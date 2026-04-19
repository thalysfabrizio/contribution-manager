import { vi } from 'vitest';

const modelMethods = [
  'findUnique',
  'findFirst',
  'findMany',
  'create',
  'update',
  'upsert',
  'delete',
  'deleteMany',
  'count',
] as const;

const models = [
  'campaign',
  'campaignMember',
  'participant',
  'person',
  'payment',
  'auditLog',
  'user',
  'session',
  'account',
  'verificationToken',
] as const;

type MockFn = ReturnType<typeof vi.fn>;
type MockModel = Record<string, MockFn>;
type MockPrisma = Record<string, MockModel> & { $transaction: MockFn };

export function createMockPrisma(): MockPrisma {
  const mock = {} as MockPrisma;
  for (const model of models) {
    (mock as Record<string, MockModel>)[model] = {};
    for (const method of modelMethods) {
      (mock as Record<string, MockModel>)[model][method] = vi.fn();
    }
  }
  mock.$transaction = vi.fn(async (arg: unknown) => {
    if (typeof arg === 'function') {
      return (arg as (tx: MockPrisma) => Promise<unknown>)(mock);
    }
    return Promise.all(arg as Promise<unknown>[]);
  });
  return mock;
}
