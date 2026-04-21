# Contribution Manager

> Full-stack app (Portuguese UI) for tracking recurring monthly contributions —
> campaigns with participants, payments (PIX / cash), WhatsApp message templates,
> and printable reports. Built with LGPD compliance, audit logging and WCAG 2.1 AA
> accessibility as first-class concerns.

Gestão de contribuições financeiras mensais com campanhas, participantes, pagamentos PIX/dinheiro, templates de WhatsApp e relatórios imprimíveis.

`Next 16` · `React 19` · `Prisma 7` · `Postgres 16` · `NextAuth 5` · `TailwindCSS 4` · `TypeScript 5`

## Status

| Campo | Valor |
| --- | --- |
| Versão | `v0.9` (tag) |
| Testes | 247 unit (Vitest) + 4 E2E (Playwright + axe-core, WCAG 2.1 AA) |
| CI | GitHub Actions — lint → typecheck → test → build |
| Runtime | Node 20+ (CI 22) |
| Deploy | VPS (em preparação — Sprint 5) |

## Features

- **Auth & LGPD** — Google OAuth + magic link (Resend), email verificado obrigatório, consent versionado, export JSON, exclusão de conta com typed-confirm
- **Campanhas** — período configurável, valor mensal fixo, chave PIX, branding (logo, banner, cor de destaque, assinatura), múltiplos membros com papéis OWNER/MEMBER
- **Participantes e pagamentos** — `Person` reutilizável entre campanhas via telefone único, status `PENDING` / `PAID_PIX` / `PAID_CASH` / `LATE`
- **Comunicação** — templates de WhatsApp customizáveis com preview e variáveis ({nome}, {mês}, {valor}, etc.)
- **Relatórios** — layout A4 imprimível com KPIs, progresso mensal e listas de pendentes/em dia
- **Acessibilidade** — tema claro/escuro, tamanho de fonte ajustável, modo reduced-motion, skip link, focus trap em modais

## Destaques de arquitetura

| Padrão | Arquivo | O que resolve |
| --- | --- | --- |
| ActionResult | [src/lib/errors.ts](src/lib/errors.ts) | Server actions retornam `{ ok, data } \| { ok: false, error, code? }`; `handlePrismaError()` mapeia P2002/P2003/P2025/ZodError para mensagens pt-BR |
| Permissions / IDOR | [src/lib/permissions.ts](src/lib/permissions.ts) | `requireCampaignAccess` / `requireCampaignOwner` + scoping por `campaignId` em todas as mutations de Participant/Payment |
| Env fail-fast | [src/lib/env.ts](src/lib/env.ts) | Zod valida todas as variáveis obrigatórias na boot — app falha na inicialização se algo faltar |
| Auth adapter custom | [src/lib/auth.ts](src/lib/auth.ts) | PrismaAdapter customizado que marca `emailVerified` na criação OAuth (corrige o default `null` do NextAuth) |
| Rate limit DB-backed | [src/lib/rate-limit.ts](src/lib/rate-limit.ts) | Sliding window persistente em tabela `RateLimit`, resiliente a multi-instance |
| Audit log | [prisma/schema.prisma](prisma/schema.prisma) | Modelo `AuditLog` com `actorEmailHash` para preservar auditoria após delete de conta (LGPD soft delete) |
| Security headers | [next.config.ts](next.config.ts) | HSTS 2 anos, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy (câmera/mic/geo/FLoC off) |
| Sentry opcional | [sentry.server.config.ts](sentry.server.config.ts) | 3 configs (client/server/edge) + instrumentation; no-op sem `SENTRY_DSN`, não bloqueia dev |

## Segurança & LGPD

- Consent versionado (`consentAt` + `consentVersion` no modelo `User`), registrado pós-login em [src/lib/consent-service.ts](src/lib/consent-service.ts)
- Export completo em `/api/account/export` e retenção de `AuditLog` por 24 meses via [scripts/cleanup-audit-logs.ts](scripts/cleanup-audit-logs.ts)
- Exclusão de conta: typed email + acknowledgment + rate limit (3 tentativas/h) em [src/app/api/account/route.ts](src/app/api/account/route.ts)
- IDOR scoping em [participant](src/actions/participant.ts) e [payment](src/actions/payment.ts) actions
- SSRF mitigado: `<Image unoptimized>` para URLs user-provided, sem wildcard em `remotePatterns`
- X-Forwarded-For last-hop no rate-limit de auth (mitigação de spoofing)

## Qualidade

- **Unit tests** — 18 arquivos, 247 casos, Prisma mockado via [src/test/mocks/prisma.ts](src/test/mocks/prisma.ts)
- **E2E** — 4 specs (3 fluxos críticos + a11y audit) com axe-core, em banco dedicado `contribution_manager_e2e` e servidor na porta 3100 (setup em [scripts/with-e2e-db.ts](scripts/with-e2e-db.ts))
- **CI** — [.github/workflows/ci.yml](.github/workflows/ci.yml) roda lint → typecheck → Vitest → `next build` em cada push/PR
- **Guarda-corpos** — `npm run db:seed` aborta se o banco já tem usuários; E2E falha imediatamente se `E2E_DATABASE_URL` for igual a `DATABASE_URL`

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
| `npm test` | Vitest (run único; aceita `:watch` e `:coverage`) |
| `npm run db:seed` | popula o banco com dados de seed (aborta se já tem dados; use `-- --force` para limpar) |
| `npm run cleanup:audit-logs -- --dry-run` | simula exclusão de audit logs > 24 meses |
| `npm run cleanup:audit-logs` | exclui audit logs > 24 meses (retenção LGPD) |
| `npm run db:backup` | `pg_dump` do banco para `./backups/` (retém 30 dias) |
| `npm run db:restore <arquivo>` | restaura um dump — SOBRESCREVE o banco (exige typed-confirm) |
| `npm run e2e` | roda Playwright (exige `E2E_DATABASE_URL` em banco separado) |
| `npm run e2e:migrate` | aplica migrations no banco de E2E |
| `npm run e2e:build` | build de produção usando `E2E_DATABASE_URL` |
| `npm run e2e:serve` | serve o build E2E em `http://localhost:3100` |

## Testes E2E

Os testes E2E apagam todos os usuários a cada rodada ([e2e/global-setup.ts](e2e/global-setup.ts)). Por isso exigem um banco separado — `E2E_DATABASE_URL` deve apontar para `contribution_manager_e2e`. Setup:

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
docker compose down -v        # ⚠ DESTRUTIVO: remove container E volume (apaga TODOS os dados)
npx prisma studio             # GUI para inspecionar o banco
npx prisma migrate dev        # cria nova migration a partir de mudanças no schema
```

### Backup local

Como os dados ficam no volume Docker (ponto único de falha), rode backups antes de qualquer operação arriscada (migrations, `down -v`, troca de máquina). A restauração exige digitar o nome do banco.

```bash
npm run db:backup                                 # cria ./backups/contribution_manager-YYYYMMDD-HHMMSS.sql.gz
npm run db:restore backups/<arquivo>.sql.gz       # restaura (sobrescreve o banco)
```

Os backups são ignorados pelo git. Considere copiar periodicamente para outro disco ou serviço externo.

## Retenção de audit logs (LGPD)

A política é manter `AuditLog` por **24 meses** (alinhada à [Política de Privacidade](src/app/legal/privacy/page.tsx)). O script [scripts/cleanup-audit-logs.ts](scripts/cleanup-audit-logs.ts) remove registros mais antigos que esse limite.

Em produção, rodar mensalmente via cron do host ou GitHub Actions (`schedule: '0 3 1 * *'`). Sempre executar com `--dry-run` antes para ver quantos registros seriam afetados.

## Estrutura

- [src/app/](src/app/) — rotas do App Router (páginas + endpoints `/api/*`)
- [src/actions/](src/actions/) — server actions (campaign, participant, payment, member, activity)
- [src/lib/](src/lib/) — utilitários (env, prisma, auth, permissions, rate-limit, errors, logger, templates, consent)
- [src/components/](src/components/) — componentes React (ui genérica + features por domínio)
- [prisma/](prisma/) — schema, migrations e seed
- [e2e/](e2e/) — specs Playwright + helpers (db, axe, auth storage)
- [scripts/](scripts/) — manutenção (backup, restore, retenção, E2E db wrapper)
- [sentry.client.config.ts](sentry.client.config.ts), [sentry.server.config.ts](sentry.server.config.ts), [sentry.edge.config.ts](sentry.edge.config.ts), [instrumentation.ts](instrumentation.ts) — observabilidade Sentry

## Licença

MIT — veja [LICENSE](LICENSE).
