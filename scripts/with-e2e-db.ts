import 'dotenv/config';
import { spawnSync } from 'node:child_process';

const e2eUrl = process.env.E2E_DATABASE_URL;
if (!e2eUrl) {
  console.error('E2E_DATABASE_URL não definida. Veja README seção "Testes E2E".');
  process.exit(1);
}
if (e2eUrl === process.env.DATABASE_URL) {
  console.error('E2E_DATABASE_URL é igual a DATABASE_URL. Use um banco dedicado — o globalSetup apaga usuários.');
  process.exit(1);
}

const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error('Uso: tsx scripts/with-e2e-db.ts <comando> [args...]');
  process.exit(1);
}

const result = spawnSync(cmd, args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_URL: e2eUrl,
    NEXTAUTH_URL: process.env.E2E_NEXTAUTH_URL ?? 'http://localhost:3100',
    AUTH_TRUST_HOST: 'true',
  },
  shell: false,
});
process.exit(result.status ?? 1);
