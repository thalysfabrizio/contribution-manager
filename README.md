# Contribution Manager

App [Next.js 16](https://nextjs.org) com NextAuth, Prisma + PostgreSQL e Resend (magic link).

## Pré-requisitos

- Node.js 20+
- Docker Desktop (para o Postgres local)
- Conta no [Resend](https://resend.com) e credenciais OAuth do Google para login

## Setup inicial (uma vez)

```bash
# 1. instalar dependências (o postinstall já roda prisma generate)
npm install

# 2. copiar e preencher variáveis de ambiente
cp .env.example .env
# edite .env: NEXTAUTH_SECRET, GOOGLE_CLIENT_ID/SECRET, RESEND_API_KEY, EMAIL_FROM

# 3. subir o Postgres
docker compose up -d

# 4. aplicar migrations
npx prisma migrate deploy

# 5. (opcional) popular dados de seed
npm run db:seed
```

Gere o `NEXTAUTH_SECRET` com `openssl rand -base64 32`. Variáveis obrigatórias são validadas em [src/lib/env.ts](src/lib/env.ts) — o app falha na inicialização se algo estiver ausente.

## Rotina diária (após reboot da máquina)

```bash
docker compose up -d      # sobe o Postgres
npm run dev               # inicia o Next em http://localhost:3000
```

Se há migrations novas no repositório:

```bash
npx prisma migrate status   # verificar pendências
npx prisma migrate deploy   # aplicar
```

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento (Turbopack) |
| `npm run build` | build de produção |
| `npm start` | serve o build de produção |
| `npm run lint` | ESLint |
| `npm test` | vitest (run único) |
| `npm run test:watch` | vitest em modo watch |
| `npm run test:coverage` | cobertura |
| `npm run db:seed` | popula o banco com dados de seed (aborta se já tem dados; use `-- --force` pra limpar) |
| `npm run db:migrate-json` | importa dados de JSON legado |
| `npm run cleanup:audit-logs -- --dry-run` | simula exclusão de audit logs > 24 meses |
| `npm run cleanup:audit-logs` | exclui audit logs > 24 meses (retenção LGPD) |
| `npm run e2e` | roda Playwright (exige `E2E_DATABASE_URL` em banco separado) |
| `npm run e2e:migrate` | aplica migrations no banco de E2E |

## Testes E2E

Os testes E2E apagam todos os usuários a cada rodada (`e2e/global-setup.ts`). Por isso exigem um banco separado — `E2E_DATABASE_URL` deve apontar para `contribution_manager_e2e`. Setup:

```bash
# Cria o banco dedicado (rodar uma vez)
docker compose exec db psql -U postgres -c "CREATE DATABASE contribution_manager_e2e;"

# Aplica migrations
npm run e2e:migrate

# Roda os testes
npm run e2e
```

Se `E2E_DATABASE_URL` não estiver definida ou for igual a `DATABASE_URL`, o setup falha imediatamente com erro explicativo.

## Banco de dados

- Dev local: Postgres 16 via [docker-compose.yml](docker-compose.yml) (container `contribution-db`, porta `5432`, volume `pgdata`)
- Schema: [prisma/schema.prisma](prisma/schema.prisma)
- Migrations: [prisma/migrations/](prisma/migrations/)

Comandos úteis:

```bash
docker compose stop           # para o Postgres preservando dados
docker compose down           # remove container (dados ficam no volume pgdata)
docker compose down -v        # remove container E volume (apaga os dados)
npx prisma studio             # GUI para inspecionar o banco
npx prisma migrate dev        # cria nova migration a partir de mudanças no schema
```

## Retenção de audit logs (LGPD)

A política é manter `AuditLog` por **24 meses** (alinhada à [Política de Privacidade](src/app/legal/privacy/page.tsx)). O script [scripts/cleanup-audit-logs.ts](scripts/cleanup-audit-logs.ts) remove registros mais antigos que esse limite. Deve rodar mensalmente em produção:

- **Vercel Cron**: adicione entrada em `vercel.json` apontando para uma rota interna que invoque a rotina. Ou
- **GitHub Actions**: workflow `schedule: - cron: '0 3 1 * *'` rodando `npm run cleanup:audit-logs` com as envs do ambiente (ver [docs/RUNBOOK.md](docs/RUNBOOK.md)).

Sempre faça um `--dry-run` antes em produção para ver quantos registros seriam afetados.

## Estrutura

- [src/app/](src/app/) — rotas do App Router
- [src/lib/](src/lib/) — utilitários (env, prisma, rate-limit, auth)
- [prisma/](prisma/) — schema, migrations e seed
- [scripts/](scripts/) — scripts de manutenção (retenção, etc.)
