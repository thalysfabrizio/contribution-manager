/**
 * Script de migração: data/contributions.json → PostgreSQL
 *
 * Uso: npx tsx prisma/migrate-json.ts
 *
 * Requisitos:
 * - PostgreSQL rodando (docker compose up -d)
 * - prisma migrate dev já executado
 * - Um usuário owner precisa existir no banco (rode o seed primeiro)
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { PrismaClient, PaymentStatus, CampaignRole } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

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

// Meses da campanha hardcoded
const MONTH_MAP: Record<string, Date> = {
  '12-2025': new Date(Date.UTC(2025, 11, 1)),
  '01-2026': new Date(Date.UTC(2026, 0, 1)),
  '02-2026': new Date(Date.UTC(2026, 1, 1)),
  '03-2026': new Date(Date.UTC(2026, 2, 1)),
  '04-2026': new Date(Date.UTC(2026, 3, 1)),
  '05-2026': new Date(Date.UTC(2026, 4, 1)),
  '06-2026': new Date(Date.UTC(2026, 5, 1)),
  '07-2026': new Date(Date.UTC(2026, 6, 1)),
  '08-2026': new Date(Date.UTC(2026, 7, 1)),
  '09-2026': new Date(Date.UTC(2026, 8, 1)),
};

/**
 * Normaliza telefone para 11 dígitos (DDD 2 + 9 + número 8)
 * Retorna { phone, warning? }
 */
function normalizePhone(raw: string): { phone: string; warning?: string } {
  const digits = raw.replace(/\D/g, '');

  // 11 dígitos: OK (83 9 9999-9999)
  if (digits.length === 11) {
    return { phone: digits };
  }

  // 10 dígitos: falta o 9 (83 9999-9999 → 83 9 9999-9999)
  if (digits.length === 10) {
    const ddd = digits.substring(0, 2);
    const number = digits.substring(2);
    return {
      phone: `${ddd}9${number}`,
      warning: `Telefone ${raw} tinha 10 dígitos — adicionado 9 → ${ddd}9${number}`,
    };
  }

  // 12 dígitos: tem 55 no início (55 83 9999-9999)
  if (digits.length === 12 && digits.startsWith('55')) {
    return { phone: digits.substring(2) };
  }

  // 13 dígitos: 55 + 11 dígitos
  if (digits.length === 13 && digits.startsWith('55')) {
    return { phone: digits.substring(2) };
  }

  // Não encaixa — sinalizar
  return {
    phone: digits,
    warning: `REVISAR MANUALMENTE: telefone ${raw} tem ${digits.length} dígitos, não encaixa no padrão esperado`,
  };
}

async function main() {
  const jsonPath = path.join(process.cwd(), 'data', 'contributions.json');
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const data: JsonDb = JSON.parse(raw);

  console.log(`\nMigrando ${data.participants.length} participantes de contributions.json\n`);

  const warnings: string[] = [];

  // Buscar ou criar owner
  let owner = await prisma.user.findFirst();
  if (!owner) {
    owner = await prisma.user.create({
      data: { email: 'admin@example.com', name: 'Administrador' },
    });
    console.log('Criado usuário owner: admin@example.com');
  }

  // Buscar ou criar campanha
  let campaign = await prisma.campaign.findFirst();
  if (!campaign) {
    campaign = await prisma.campaign.create({
      data: {
        name: 'Congresso 2025/2026',
        description: 'Campanha de contribuições mensais para o congresso da igreja',
        pixKey: data.meta.pixKey,
        monthlyValue: 2000,
        startMonth: new Date(Date.UTC(2025, 11, 1)),
        endMonth: new Date(Date.UTC(2026, 8, 1)),
        paymentDayStart: 10,
        paymentDayEnd: 15,
        owner: { connect: { id: owner.id } },
      },
    });

    // Criar CampaignMember para o owner
    await prisma.campaignMember.create({
      data: {
        userId: owner.id,
        campaignId: campaign.id,
        role: CampaignRole.OWNER,
      },
    });

    console.log(`Criada campanha: ${campaign.name}`);
  }

  let migrated = 0;
  let skipped = 0;

  for (const p of data.participants) {
    const { phone, warning } = normalizePhone(p.phone);
    if (warning) warnings.push(`${p.name}: ${warning}`);

    // Verificar se Person já existe
    let person = await prisma.person.findUnique({ where: { phone } });
    if (!person) {
      person = await prisma.person.create({
        data: { name: p.name, phone },
      });
    }

    // Verificar se já é participante
    const existing = await prisma.participant.findUnique({
      where: {
        personId_campaignId: {
          personId: person.id,
          campaignId: campaign.id,
        },
      },
    });

    if (existing) {
      console.log(`  SKIP: ${p.name} (já é participante)`);
      skipped++;
      continue;
    }

    const participant = await prisma.participant.create({
      data: {
        personId: person.id,
        campaignId: campaign.id,
      },
    });

    // Migrar pagamentos
    let paymentCount = 0;
    for (const [monthKey, status] of Object.entries(p.payments)) {
      const monthDate = MONTH_MAP[monthKey];
      if (!monthDate) {
        warnings.push(`${p.name}: mês desconhecido "${monthKey}" ignorado`);
        continue;
      }

      if (status === 'PENDING') continue;

      await prisma.payment.create({
        data: {
          participantId: participant.id,
          month: monthDate,
          status: status as PaymentStatus,
          paidAt: status === 'PAID_PIX' || status === 'PAID_CASH' ? new Date() : null,
        },
      });
      paymentCount++;
    }

    console.log(`  OK: ${p.name} (${phone}) — ${paymentCount} pagamentos`);
    migrated++;
  }

  console.log(`\n=== Resultado ===`);
  console.log(`Migrados: ${migrated}`);
  console.log(`Ignorados (já existiam): ${skipped}`);

  if (warnings.length > 0) {
    console.log(`\n=== Avisos (${warnings.length}) ===`);
    warnings.forEach((w) => console.log(`  ⚠ ${w}`));
  } else {
    console.log('\nNenhum aviso — todos os telefones foram normalizados com sucesso.');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
