/**
 * Test data factories — generate realistic test data using faker.
 * Each factory returns a plain object matching the Prisma model shape.
 */
import { faker } from "@faker-js/faker";

const TEST_USER_ID = "test-user-id-001";

export function createTestCompany(overrides: Record<string, any> = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    industry: faker.commerce.department(),
    size: "medium_51_200",
    website: faker.internet.url(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    address: faker.location.streetAddress(),
    notes: faker.lorem.sentence(),
    userId: TEST_USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestContact(overrides: Record<string, any> = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    jobTitle: faker.person.jobTitle(),
    isDecisionMaker: false,
    authorityLevel: null,
    notes: faker.lorem.sentence(),
    companyId: faker.string.uuid(),
    userId: TEST_USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestDeal(overrides: Record<string, any> = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    value: faker.number.float({ min: 1000, max: 100000, fractionDigits: 2 }),
    stage: "prospecting",
    probability: faker.number.int({ min: 0, max: 100 }),
    expectedCloseDate: faker.date.future(),
    notes: faker.lorem.sentence(),
    companyId: faker.string.uuid(),
    contactId: null,
    userId: TEST_USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestActivity(overrides: Record<string, any> = {}) {
  return {
    id: faker.string.uuid(),
    type: "call",
    subject: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    date: new Date(),
    durationMinutes: faker.number.int({ min: 5, max: 120 }),
    outcome: faker.lorem.sentence(),
    nextSteps: faker.lorem.sentence(),
    companyId: null,
    contactId: null,
    dealId: null,
    userId: TEST_USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
