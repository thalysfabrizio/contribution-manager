import { logger } from './logger';

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function err(message: string, code?: string): ActionResult<never> {
  return { ok: false, error: message, code };
}

const PRISMA_KNOWN_CODES = new Set(['P2002', 'P2003', 'P2025']);

type PrismaKnownError = { code: string; meta?: Record<string, unknown>; message?: string };

function isPrismaKnownError(e: unknown): e is PrismaKnownError {
  if (typeof e !== 'object' || e === null) return false;
  const { code } = e as { code?: unknown };
  return typeof code === 'string' && PRISMA_KNOWN_CODES.has(code);
}

// Distingue erros que LANÇAMOS intencionalmente (new Error('mensagem pt-BR')) de
// erros do runtime (TypeError, ReferenceError, SyntaxError…) ou Prisma.
// Errors "plain" (constructor.name === 'Error') são os nossos; qualquer subclasse
// específica indica bug ou erro de infraestrutura e é mascarada + logada.
function isOurBusinessError(e: unknown): e is Error {
  if (!(e instanceof Error)) return false;
  return e.constructor.name === 'Error';
}

type ZodLikeError = { issues: Array<{ message: string; path: (string | number)[] }> };

function isZodError(e: unknown): e is ZodLikeError {
  if (!(e instanceof Error)) return false;
  if (e.constructor.name !== 'ZodError') return false;
  return Array.isArray((e as unknown as { issues?: unknown }).issues);
}

function fieldFromTarget(target: unknown): string | null {
  if (Array.isArray(target) && target.length > 0) return String(target[0]);
  if (typeof target === 'string') return target;
  return null;
}

// Converte qualquer exceção lançada por uma server action em um ActionResult seguro.
// - Erros Prisma conhecidos (P2002/P2003/P2025) ganham mensagem pt-BR específica.
// - ZodError retorna a primeira issue (mensagens já estão em pt-BR no schema).
// - Erros de negócio/permissões (Error plain com mensagens pt-BR curtas) passam pelo messaging.
// - Qualquer outra coisa (incluindo erros Prisma desconhecidos) é logada e mascarada.
export function handlePrismaError(
  e: unknown,
  context: Record<string, unknown> = {},
): ActionResult<never> {
  if (isPrismaKnownError(e)) {
    if (e.code === 'P2002') {
      const field = fieldFromTarget(e.meta?.target);
      return err(
        field ? `Este ${field} já está em uso` : 'Este registro já existe',
        e.code,
      );
    }
    if (e.code === 'P2025') {
      return err('Registro não encontrado ou já removido', e.code);
    }
    if (e.code === 'P2003') {
      return err('Operação viola uma relação obrigatória', e.code);
    }
  }

  if (isZodError(e)) {
    const first = e.issues[0];
    return err(first?.message ?? 'Dados inválidos', 'VALIDATION');
  }

  if (isOurBusinessError(e)) {
    // Permissões / checks de negócio lançam `new Error('mensagem pt-BR')`.
    return err(e.message);
  }

  logger.error('Falha inesperada em server action', { ...context, error: e });
  return err('Erro inesperado. Tente novamente.');
}
