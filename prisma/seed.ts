import 'dotenv/config';
import { PrismaClient, PaymentStatus, CampaignRole } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Limpar dados existentes
  await prisma.payment.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.campaignMember.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.person.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Criar owner
  const owner = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Administrador',
    },
  });

  // Criar campanha default
  const campaign = await prisma.campaign.create({
    data: {
      name: 'Congresso 2025/2026',
      description: 'Campanha de contribuições mensais para o congresso da igreja',
      pixKey: 'exemplo@pixkey.com',
      monthlyValue: 2000, // R$ 20,00 em centavos
      startMonth: new Date(Date.UTC(2025, 11, 1)), // Dez/2025
      endMonth: new Date(Date.UTC(2026, 8, 1)),    // Set/2026
      paymentDayStart: 10,
      paymentDayEnd: 15,
      ownerId: owner.id,
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

  // Participantes de exemplo
  const participants = [
    {
      name: 'Ana Silva',
      phone: '83999001001',
      payments: [
        { month: new Date(Date.UTC(2025, 11, 1)), status: PaymentStatus.PAID_PIX },
        { month: new Date(Date.UTC(2026, 0, 1)), status: PaymentStatus.PAID_PIX },
        { month: new Date(Date.UTC(2026, 1, 1)), status: PaymentStatus.PAID_PIX },
        { month: new Date(Date.UTC(2026, 2, 1)), status: PaymentStatus.PAID_CASH },
      ],
    },
    {
      name: 'Bruno Costa',
      phone: '83999002002',
      payments: [
        { month: new Date(Date.UTC(2025, 11, 1)), status: PaymentStatus.PAID_PIX },
        { month: new Date(Date.UTC(2026, 0, 1)), status: PaymentStatus.PAID_PIX },
      ],
    },
    {
      name: 'Carla Mendes',
      phone: '83999003003',
      payments: [
        { month: new Date(Date.UTC(2025, 11, 1)), status: PaymentStatus.PAID_CASH },
        { month: new Date(Date.UTC(2026, 0, 1)), status: PaymentStatus.PAID_PIX },
        { month: new Date(Date.UTC(2026, 1, 1)), status: PaymentStatus.PAID_PIX },
        { month: new Date(Date.UTC(2026, 2, 1)), status: PaymentStatus.PAID_PIX },
        { month: new Date(Date.UTC(2026, 3, 1)), status: PaymentStatus.PAID_PIX },
      ],
    },
    {
      name: 'Daniel Oliveira',
      phone: '83999004004',
      payments: [
        { month: new Date(Date.UTC(2025, 11, 1)), status: PaymentStatus.PAID_PIX },
      ],
    },
    {
      name: 'Elisa Santos',
      phone: '83999005005',
      payments: [],
    },
  ];

  for (const p of participants) {
    const person = await prisma.person.create({
      data: {
        name: p.name,
        phone: p.phone,
      },
    });

    const participant = await prisma.participant.create({
      data: {
        personId: person.id,
        campaignId: campaign.id,
      },
    });

    for (const payment of p.payments) {
      await prisma.payment.create({
        data: {
          month: payment.month,
          status: payment.status,
          participantId: participant.id,
          paidAt: payment.status !== PaymentStatus.PENDING ? new Date() : null,
        },
      });
    }
  }

  console.log('Seed concluído:');
  console.log(`  - 1 usuário (owner): ${owner.email}`);
  console.log(`  - 1 campanha: ${campaign.name}`);
  console.log(`  - ${participants.length} participantes com pagamentos`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
