# MiniCRM Testing Guide

**Updated:** 2026-02-02

Comprehensive testing documentation for MiniCRM's test suite covering unit tests (Vitest) and E2E tests (Playwright).

## Overview

**Test Suite Status**
- **Unit Tests**: 67/67 passing (100%) — 1.2s execution time
- **E2E Tests**: 56/60 passing (93%) — 4 intentionally skipped
- **Total**: 123/127 tests (97% passing)

**Tech Stack**
| Tool | Purpose | Version |
|------|---------|---------|
| Vitest | Unit + integration tests | 4.x |
| @testing-library/react | Component rendering | 16.x |
| Playwright | End-to-end UI tests | 1.58 |
| @faker-js/faker | Test data generation | 10.x |

---

## Quick Start

### Run Unit Tests
```bash
npm run test:unit              # Run once
npm run test:unit:watch        # Watch mode for development
npm run test:coverage          # With coverage report
```

No external dependencies needed — all mocked.

### Run E2E Tests

**Prerequisites**
1. Database running: `docker compose up -d db`
2. Database seeded: `npm run db:seed`
3. Dev server available (Playwright auto-starts if missing)

**Commands**
```bash
npm run test:e2e               # Headless mode
npm run test:e2e:ui            # Interactive UI mode
npx playwright test --workers=1 # Single worker (more stable)
npx playwright test auth-flows.spec.ts  # Specific file
```

---

## Unit Testing (Vitest)

### Project Structure
```
src/__tests__/
├── setup.ts                   # Global test setup
├── helpers/
│   ├── mock-prisma.ts         # Prisma mock factory
│   ├── mock-auth.ts           # Auth session mocks
│   ├── form-data-builder.ts   # FormData helper
│   └── test-data-factories.ts # Faker data factories
└── unit/
    ├── utils.test.ts                      # 8 tests
    ├── dashboard-queries.test.ts          # 10 tests
    ├── company-actions.test.ts            # 9 tests
    ├── contact-actions.test.ts            # 9 tests
    ├── activity-actions.test.ts           # 9 tests
    ├── deal-actions.test.ts               # 12 tests
    └── middleware-and-prisma.test.ts      # 10 tests
```

### Configuration

**vitest.config.ts**
```typescript
{
  environment: "jsdom",          // Browser-like environment
  globals: true,                 // No need to import describe/it/expect
  setupFiles: ["./src/__tests__/setup.ts"],
  include: ["src/__tests__/**/*.test.{ts,tsx}"],
  coverage: {
    provider: "v8",
    include: ["src/lib/**", "src/actions/**", "src/middleware.ts"]
  }
}
```

### Mock Strategy

#### Prisma Mock
```typescript
import { createMockPrisma } from "@/__tests__/helpers/mock-prisma";
vi.mock("@/lib/prisma", () => ({ prisma: createMockPrisma() }));

const { prisma } = await import("@/lib/prisma");
const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

// In test
mockPrisma.company.create.mockResolvedValue({ id: "company-123" });
```

#### Auth Mock
```typescript
import { mockAuthenticatedSession } from "@/__tests__/helpers/mock-auth";

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } }
}));

const { auth } = await import("@/lib/auth");
(auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
```

#### Next.js Mocks
```typescript
// Redirect
vi.mock("next/navigation", () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  })
}));

// Cache revalidation
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
```

### Writing a New Unit Test

**Pattern**
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/helpers/mock-prisma";
import { mockAuthenticatedSession } from "@/__tests__/helpers/mock-auth";

// CRITICAL: vi.mock() must be at top level, before imports
vi.mock("@/lib/prisma", () => ({ prisma: createMockPrisma() }));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } }
}));

const { myAction } = await import("@/actions/my-actions");
const { auth } = await import("@/lib/auth");
const { prisma } = await import("@/lib/prisma");

describe("my-feature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates item with valid data", async () => {
    (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
    mockPrisma.myModel.create.mockResolvedValue({ id: "item-123" } as any);

    const result = await myAction();
    expect(result.success).toBe(true);
  });
});
```

---

## E2E Testing (Playwright)

### Project Structure
```
e2e/
├── auth-fixture.ts                     # Shared login flow
├── global-setup.ts                     # DB cleanup
├── radix-select-interaction-helpers.ts # Select helpers
├── auth-flows.spec.ts                  # 12 tests
├── company-crud.spec.ts                # 10 tests
├── contact-crud-operations.spec.ts     # 10 tests
├── deal-pipeline-management.spec.ts    # 12 tests
├── activity-tracking-timeline.spec.ts  # 8 tests
└── dashboard-widgets-metrics.spec.ts   # 8 tests
```

### Configuration

**playwright.config.ts**
```typescript
{
  testDir: "./e2e",
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
}
```

### Auth Fixture

**Usage**
```typescript
import { test as base } from "@playwright/test";
import { authenticateUser } from "./auth-fixture";

export const test = base.extend({
  page: async ({ page }, use) => {
    await authenticateUser(page);  // Auto-login before each test
    await use(page);
  }
});

test("user can view companies", async ({ page }) => {
  // Already logged in
  await page.goto("/companies");
});
```

**Credentials**
- Email: `test@example.com`
- Password: `password123`
- Auto-created on first run via Better Auth API

### Radix Select Helpers

**Problem:** Radix renders options in portal, ARIA roles unreliable.

**Solution:** Use data-slot attributes.

```typescript
import { selectOption } from "./radix-select-interaction-helpers";

// Select company from dropdown (0-indexed)
await selectOption(page, 0, "Acme Corp");

// Select contact from second dropdown
await selectOption(page, 1, "John Smith");
```

**How it works:**
1. Finds trigger button by `data-slot="trigger"` index
2. Clicks to open dropdown
3. Clicks option by text match
4. Waits for state change

### Writing a New E2E Test

**Pattern**
```typescript
import { test, expect } from "@playwright/test";
import { authenticateUser } from "./auth-fixture";

export const baseTest = test.extend({
  page: async ({ page }, use) => {
    await authenticateUser(page);
    await use(page);
  }
});

baseTest("TC-XX01: user can perform action", async ({ page }) => {
  await page.goto("/path");
  await page.fill('input[name="field"]', "value");
  await page.click('button:has-text("Submit")');

  await expect(page).toHaveURL("/success");
  await expect(page.locator("text=Success")).toBeVisible();
});
```

---

## Known E2E Skipped Tests

| Test ID | Spec File | Reason | Status |
|---------|-----------|--------|--------|
| TC-CO09 | company-crud.spec.ts | Pagination with bulk data (>1000 records required) | Intentionally skipped |
| TC-DL10 | deal-pipeline-management.spec.ts | Playwright drag-drop limitation (dnd-kit not testable) | Intentionally skipped |
| TC-DB06 | dashboard-widgets-metrics.spec.ts | Requires specific setup (deals closing soon) | Intentionally skipped |
| TC-DB07 | dashboard-widgets-metrics.spec.ts | Requires specific setup (activity summary) | Intentionally skipped |

**Total:** 4 tests skipped (not failures). Pass rate: 56/60 = 93%.

---

## Test Coverage

### Unit Tests — 67/67 passing (100%)

| File | Tests | Coverage |
|------|-------|----------|
| utils.test.ts | 8 | formatCurrency, formatDate, truncate, etc. |
| dashboard-queries.test.ts | 10 | getCompanyCount, getRecentActivities, etc. |
| company-actions.test.ts | 9 | create, update, delete company |
| contact-actions.test.ts | 9 | create, update, delete contact |
| activity-actions.test.ts | 9 | create, update, delete activity |
| deal-actions.test.ts | 12 | create, update, delete, updateStage |
| middleware-and-prisma.test.ts | 10 | auth middleware, Prisma client |

**Execution Time**: 1.2s

### E2E Tests — 56/60 passing (93%)

| File | Pass | Skip | Coverage |
|------|------|------|----------|
| auth-flows.spec.ts | 12 | 0 | Register, login, logout, session persistence |
| company-crud.spec.ts | 9 | 1 | Create, read, update, delete, search, filter |
| contact-crud-operations.spec.ts | 10 | 0 | Create, read, update, delete, decision-maker |
| deal-pipeline-management.spec.ts | 11 | 1 | Create, read, update, delete, kanban, stage transitions |
| activity-tracking-timeline.spec.ts | 8 | 0 | Create, read, update, delete, timeline, type filtering |
| dashboard-widgets-metrics.spec.ts | 6 | 2 | Metrics, pipeline, recent activities, quick actions |

---

## Troubleshooting

### vi.mock Hoisting Issues

**Error**: `ReferenceError: Cannot access before initialization`

**Solution**: Import inside factory function:
```typescript
vi.mock("@/lib/prisma", () => {
  const { createMockPrisma } = require("@/__tests__/helpers/mock-prisma");
  return { prisma: createMockPrisma() };
});
```

### Radix Select Selectors Fail

**Error**: `Timeout: element not found` when clicking select option

**Solution**: Use `selectOption()` helper from `radix-select-interaction-helpers.ts`.

### Auth Fixture Timeout

**Error**: `Authentication failed - still on login page`

**Solution**: Delete user and let fixture recreate:
```sql
DELETE FROM "User" WHERE email = 'test@example.com';
```

### Better Auth Password Hash Issues

**Error**: Login succeeds in UI but fails in tests

**Solution**: Always create test users via Better Auth API, never via Prisma:
```typescript
// Good
await page.request.post("/api/auth/sign-up/email", {
  data: { email: "test@example.com", password: "password123", name: "Test" }
});
```

### Tests Pass Locally, Fail in CI

**Cause**: Race conditions with parallel execution.

**Solution**: Run with `--workers=1` in CI:
```typescript
// playwright.config.ts
workers: process.env.CI ? 1 : undefined
```

---

## NPM Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `test` | `vitest run` | Run all unit tests once |
| `test:unit` | `vitest run` | Alias for `test` |
| `test:unit:watch` | `vitest` | Watch mode for unit tests |
| `test:coverage` | `vitest run --coverage` | Generate coverage report |
| `test:e2e` | `npx playwright test` | Run E2E tests headless |
| `test:e2e:ui` | `npx playwright test --ui` | Interactive UI mode |

**Additional Playwright Commands**
```bash
npx playwright test --headed                 # Show browser window
npx playwright test --debug                  # Step through with debugger
npx playwright test --project=chromium       # Specific browser
npx playwright show-report                   # View HTML report
npx playwright codegen http://localhost:3000 # Record new tests
```

---

## Best Practices

### Unit Tests
- Mock all external dependencies (Prisma, auth, Next.js modules)
- Use `beforeEach` to clear mocks between tests
- Test happy path + error cases (missing auth, validation, DB errors)
- Use test data factories for realistic data
- Keep tests focused (one behavior per test)

### E2E Tests
- Use auth fixture for auto-login
- Use `selectOption()` helper for Radix selects
- Wait for network idle after mutations: `await page.waitForLoadState('networkidle')`
- Add test IDs to flaky elements: `data-testid="submit-button"`
- Use retries for flaky tests in CI: `retries: process.env.CI ? 2 : 0`
- Take screenshots on failure: `screenshot: "only-on-failure"`

---

## Next Steps

**Testing Improvements**
- Add visual regression tests with Playwright screenshots
- Increase coverage for edge cases (empty states, error messages)
- Add performance tests (page load time, query performance)

**CI/CD Integration**
- Run unit tests on every commit (fast feedback)
- Run E2E tests on PR only (slower, resource-intensive)
- Fail PR if coverage drops below 85%

---

## Additional Resources

**Official Docs**
- [Vitest Guide](https://vitest.dev/guide/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

**Project Files**
- Vitest config: `/vitest.config.ts`
- Playwright config: `/playwright.config.ts`
- Test helpers: `/src/__tests__/helpers/*`
- E2E fixtures: `/e2e/auth-fixture.ts`, `/e2e/radix-select-interaction-helpers.ts`
