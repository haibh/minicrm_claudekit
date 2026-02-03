/**
 * Prisma mock helper — creates a deeply-mocked PrismaClient.
 * Every model method (findMany, create, update, delete, count, aggregate, groupBy)
 * is a vi.fn() so tests can set return values and assert calls.
 */
import { vi } from "vitest";

// Helper: create mock methods for each Prisma model
function createModelMock() {
  return {
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(null),
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    count: vi.fn().mockResolvedValue(0),
    aggregate: vi.fn().mockResolvedValue({}),
    groupBy: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockResolvedValue({}),
  };
}

export function createMockPrisma() {
  return {
    company: createModelMock(),
    contact: createModelMock(),
    deal: createModelMock(),
    activity: createModelMock(),
    tag: createModelMock(),
    companyTag: createModelMock(),
    contactTag: createModelMock(),
    user: createModelMock(),
    session: createModelMock(),
    account: createModelMock(),
    verification: createModelMock(),
    $transaction: vi.fn((fn: any) => fn()),
  };
}

export type MockPrisma = ReturnType<typeof createMockPrisma>;
