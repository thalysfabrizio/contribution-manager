import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { RETENTION_MONTHS, getCutoffDate } from '../src/lib/audit-retention';

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL não definida. Configure seu .env antes de rodar o script.');
  }

  const dryRun = process.argv.includes('--dry-run');
  const cutoff = getCutoffDate();

  const adapter = new PrismaPg(DATABASE_URL);
  const prisma = new PrismaClient({ adapter });

  try {
    const count = await prisma.auditLog.count({
      where: { createdAt: { lt: cutoff } },
    });

    console.log(
      JSON.stringify({
        level: 'info',
        message: 'audit log cleanup',
        mode: dryRun ? 'dry-run' : 'execute',
        retentionMonths: RETENTION_MONTHS,
        cutoff: cutoff.toISOString(),
        affected: count,
        timestamp: new Date().toISOString(),
      }),
    );

    if (dryRun || count === 0) return;

    const result = await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    console.log(
      JSON.stringify({
        level: 'info',
        message: 'audit log cleanup deleted',
        deleted: result.count,
        timestamp: new Date().toISOString(),
      }),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
