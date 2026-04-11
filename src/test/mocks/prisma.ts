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

type MockModel = Record<string, ReturnType<typeof vi.fn>>;
type MockPrisma = Record<string, MockModel>;

export function createMockPrisma(): MockPrisma {
  const mock: MockPrisma = {};
  for (const model of models) {
    mock[model] = {};
    for (const method of modelMethods) {
      mock[model][method] = vi.fn();
    }
  }
  return mock;
}
