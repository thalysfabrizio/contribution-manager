import 'dotenv/config';
import { Pool } from 'pg';
import { randomUUID } from 'node:crypto';
import { getE2EDatabaseUrl } from './db-url';

let cached: Pool | null = null;

export function getPool(): Pool {
  if (cached) return cached;
  cached = new Pool({ connectionString: getE2EDatabaseUrl(), max: 4 });
  return cached;
}

export async function resetData(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    DELETE FROM "Payment";
    DELETE FROM "Participant";
    DELETE FROM "CampaignMember";
    DELETE FROM "Campaign";
    DELETE FROM "Person";
    DELETE FROM "AuditLog";
  `);
}

export async function getTestUserId(): Promise<string> {
  const pool = getPool();
  const res = await pool.query<{ id: string }>(
    'SELECT id FROM "User" WHERE email = $1 LIMIT 1',
    ['e2e@example.com'],
  );
  if (res.rowCount === 0) throw new Error('Usuário de teste não encontrado. globalSetup rodou?');
  return res.rows[0].id;
}

interface SeedCampaignOptions {
  name: string;
  pixKey?: string;
  monthlyValue?: number;
  startMonth?: Date;
  endMonth?: Date;
}

export async function seedCampaign(opts: SeedCampaignOptions): Promise<string> {
  const pool = getPool();
  const userId = await getTestUserId();
  const id = randomUUID();
  const now = new Date();
  await pool.query(
    `INSERT INTO "Campaign" (id, name, "pixKey", "monthlyValue", "startMonth", "endMonth", "paymentDayStart", "paymentDayEnd", "ownerId", "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      id,
      opts.name,
      opts.pixKey ?? 'e2e@pix.com',
      opts.monthlyValue ?? 2500,
      opts.startMonth ?? new Date(Date.UTC(new Date().getUTCFullYear() + 1, 0, 1)),
      opts.endMonth ?? new Date(Date.UTC(new Date().getUTCFullYear() + 1, 5, 1)),
      10,
      15,
      userId,
      now,
    ],
  );
  await pool.query(
    `INSERT INTO "CampaignMember" (id, "userId", "campaignId", role, "joinedAt")
     VALUES ($1, $2, $3, 'OWNER', $4)`,
    [randomUUID(), userId, id, now],
  );
  return id;
}

export async function seedParticipant(campaignId: string, name: string, phone: string): Promise<string> {
  const pool = getPool();
  const now = new Date();
  const personId = randomUUID();
  const participantId = randomUUID();
  await pool.query(
    `INSERT INTO "Person" (id, name, phone, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5)`,
    [personId, name, phone, now, now],
  );
  await pool.query(
    `INSERT INTO "Participant" (id, "campaignId", "personId", "joinedAt")
     VALUES ($1, $2, $3, $4)`,
    [participantId, campaignId, personId, now],
  );
  return participantId;
}
