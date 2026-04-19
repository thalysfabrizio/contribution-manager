import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { encode } from 'next-auth/jwt';

const COOKIE_NAME = 'authjs.session-token';
const STORAGE_STATE_PATH = path.join(process.cwd(), 'e2e/.auth/user.json');
const TEST_EMAIL = 'e2e@example.com';

export default async function globalSetup() {
  const DATABASE_URL = process.env.DATABASE_URL;
  const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
  if (!DATABASE_URL) throw new Error('DATABASE_URL não definida (E2E globalSetup).');
  if (!NEXTAUTH_SECRET) throw new Error('NEXTAUTH_SECRET não definida (E2E globalSetup).');

  const pool = new Pool({ connectionString: DATABASE_URL, max: 2 });

  try {
    await pool.query(`
      DELETE FROM "Payment";
      DELETE FROM "Participant";
      DELETE FROM "CampaignMember";
      DELETE FROM "Campaign";
      DELETE FROM "Person";
      DELETE FROM "AuditLog";
      DELETE FROM "Session";
      DELETE FROM "Account";
      DELETE FROM "User";
    `);

    const userId = randomUUID();
    const now = new Date();
    await pool.query(
      `INSERT INTO "User" (id, email, name, "emailVerified", "createdAt")
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, TEST_EMAIL, 'Teste E2E', now, now],
    );

    const token = await encode({
      token: {
        sub: userId,
        id: userId,
        email: TEST_EMAIL,
        name: 'Teste E2E',
        emailVerified: now.toISOString(),
      },
      secret: NEXTAUTH_SECRET,
      salt: COOKIE_NAME,
      maxAge: 60 * 60 * 24,
    });

    const storageState = {
      cookies: [
        {
          name: COOKIE_NAME,
          value: token,
          domain: 'localhost',
          path: '/',
          expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
          httpOnly: true,
          secure: false,
          sameSite: 'Lax' as const,
        },
      ],
      origins: [],
    };

    await mkdir(path.dirname(STORAGE_STATE_PATH), { recursive: true });
    await writeFile(STORAGE_STATE_PATH, JSON.stringify(storageState, null, 2));
  } finally {
    await pool.end();
  }
}
