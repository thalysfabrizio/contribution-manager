import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { PrismaClient, PaymentStatus } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const OWNER_EMAIL = 'thalysfsilva@gmail.com';
const CAMPAIGN_NAME = 'Congresso de Jovens 2026';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL não definida.');
const prisma = new PrismaClient({ adapter: new PrismaPg(DATABASE_URL) });

const APPLY = process.argv.includes('--apply');

interface JsonParticipant {
  id: string;
  name: string;
  phone: string;
  payments: Record<string, string>;
}
interface JsonDb {
  meta: { pixKey: string; updatedAt: string };
  participants: JsonParticipant[];
}

function parseMonthKey(key: string): Date | null {
  const m = /^(\d{2})-(\d{4})$/.exec(key);
  if (!m) return null;
  const month = parseInt(m[1], 10) - 1;
  const year = parseInt(m[2], 10);
  if (month < 0 || month > 11) return null;
  return new Date(Date.UTC(year, month, 1));
}

function normalizePhone(raw: string): { phone: string; warning?: string } {
  const d = raw.replace(/\D/g, '');
  if (d.length === 11) return { phone: d };
  if (d.length === 10) {
    const ddd = d.substring(0, 2);
    const num = d.substring(2);
    return { phone: `${ddd}9${num}`, warning: `${raw} tinha 10 dígitos → ${ddd}9${num}` };
  }
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) return { phone: d.substring(2) };
  return { phone: d, warning: `REVISAR: ${raw} tem ${d.length} dígitos` };
}

async function main() {
  const mode = APPLY ? 'APPLY' : 'DRY-RUN';
  console.log(`\n== ${mode} — import data/contributions.json → ${CAMPAIGN_NAME} (${OWNER_EMAIL}) ==\n`);

  const owner = await prisma.user.findUnique({ where: { email: OWNER_EMAIL } });
  if (!owner) {
    console.error(`Owner não encontrado: ${OWNER_EMAIL}`);
    process.exit(2);
  }
  console.log(`Owner: ${owner.id} (${owner.email})`);

  const campaign = await prisma.campaign.findFirst({
    where: { name: CAMPAIGN_NAME, ownerId: owner.id },
    include: { _count: { select: { participants: true } } },
  });
  if (!campaign) {
    console.error(`Campanha "${CAMPAIGN_NAME}" não encontrada para esse owner.`);
    process.exit(2);
  }
  console.log(`Campanha: ${campaign.id}`);
  console.log(`  período: ${campaign.startMonth.toISOString().slice(0, 7)} → ${campaign.endMonth.toISOString().slice(0, 7)}`);
  console.log(`  participantes atuais: ${campaign._count.participants}`);

  const jsonPath = path.join(process.cwd(), 'data', 'contributions.json');
  const data: JsonDb = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`\nJSON: ${data.participants.length} participantes\n`);

  const warnings: string[] = [];
  let wouldCreatePerson = 0;
  let wouldReusePerson = 0;
  let wouldSkipExistingParticipant = 0;
  let wouldCreateParticipant = 0;
  let wouldCreatePayments = 0;
  let wouldSkipPayments = 0;

  for (const p of data.participants) {
    const { phone, warning } = normalizePhone(p.phone);
    if (warning) warnings.push(`${p.name}: ${warning}`);

    const existingPerson = await prisma.person.findUnique({ where: { phone } });
    if (existingPerson) {
      wouldReusePerson++;
    } else {
      wouldCreatePerson++;
    }

    const personId = existingPerson?.id;
    let existingParticipant = null;
    if (personId) {
      existingParticipant = await prisma.participant.findUnique({
        where: { personId_campaignId: { personId, campaignId: campaign.id } },
      });
    }

    if (existingParticipant) {
      wouldSkipExistingParticipant++;
      console.log(`  SKIP: ${p.name} (${phone}) — já é participante`);
      continue;
    }
    wouldCreateParticipant++;

    let payCount = 0;
    let paySkip = 0;
    for (const [key, status] of Object.entries(p.payments)) {
      const date = parseMonthKey(key);
      if (!date) {
        warnings.push(`${p.name}: mês "${key}" inválido`);
        paySkip++;
        continue;
      }
      if (status === 'PENDING') {
        paySkip++;
        continue;
      }
      payCount++;
    }
    wouldCreatePayments += payCount;
    wouldSkipPayments += paySkip;
    console.log(`  NEW : ${p.name.padEnd(22)} (${phone}) — ${payCount} pagamento(s)`);

    if (APPLY) {
      const person =
        existingPerson ??
        (await prisma.person.create({ data: { name: p.name, phone } }));

      const participant = await prisma.participant.create({
        data: { personId: person.id, campaignId: campaign.id },
      });

      for (const [key, status] of Object.entries(p.payments)) {
        const date = parseMonthKey(key);
        if (!date || status === 'PENDING') continue;
        await prisma.payment.create({
          data: {
            participantId: participant.id,
            month: date,
            status: status as PaymentStatus,
            paidAt: status === 'PAID_PIX' || status === 'PAID_CASH' ? new Date() : null,
          },
        });
      }
    }
  }

  console.log(`\n== Resumo ==`);
  console.log(`  Person reuse:            ${wouldReusePerson}`);
  console.log(`  Person create:           ${wouldCreatePerson}`);
  console.log(`  Participant create:      ${wouldCreateParticipant}`);
  console.log(`  Participant skip (dup):  ${wouldSkipExistingParticipant}`);
  console.log(`  Payment create:          ${wouldCreatePayments}`);
  console.log(`  Payment skip (pending):  ${wouldSkipPayments}`);
  if (warnings.length) {
    console.log(`\n== Avisos (${warnings.length}) ==`);
    warnings.forEach((w) => console.log(`  ⚠ ${w}`));
  }
  if (!APPLY) {
    console.log(`\n(dry-run — rode com --apply para persistir)`);
  } else {
    console.log(`\nImport concluído.`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
