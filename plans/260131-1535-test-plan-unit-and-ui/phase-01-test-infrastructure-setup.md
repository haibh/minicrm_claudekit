# Phase 01: Test Infrastructure Setup

> Parent: [plan.md](./plan.md)

## Overview
- **Priority:** P0 (blocker for all other phases)
- **Status:** pending
- **Description:** Install test frameworks, configure Vitest + Playwright, create test helpers/mocks

## Requirements

### Vitest Setup
- Install vitest, @testing-library/react, @testing-library/jest-dom, jsdom
- Configure vitest.config.ts with Next.js path aliases
- Create Prisma mock helper (prisma client mock)
- Create auth session mock helper
- Create FormData builder helper

### Playwright Setup
- Install @playwright/test
- Configure playwright.config.ts (baseURL, webServer, projects)
- Create auth fixture (login helper for reuse)
- Create test user seeding script

### Test Helpers
- Prisma mock factory (mock all model methods)
- Session mock (authenticated/unauthenticated)
- FormData builder (type-safe form data creation)
- Test data factories (company, contact, deal, activity)

## Implementation Steps

1. Install Vitest devDependencies
2. Create `vitest.config.ts`
3. Install Playwright
4. Create `playwright.config.ts`
5. Create `src/__tests__/helpers/` directory with mock factories
6. Create `e2e/` directory with Playwright fixtures
7. Add test scripts to package.json
8. Verify both test runners execute

## Todo

- [ ] Install Vitest + testing-library + faker
- [ ] Create vitest.config.ts
- [ ] Install Playwright
- [ ] Create playwright.config.ts
- [ ] Create Prisma mock helper
- [ ] Create auth mock helper
- [ ] Create FormData builder helper
- [ ] Create test data factories
- [ ] Create Playwright auth fixture
- [ ] Add npm scripts: test, test:unit, test:ui, test:e2e
- [ ] Verify test runners work

## Success Criteria
- `npm run test:unit` runs Vitest (even with 0 tests)
- `npm run test:e2e` runs Playwright (even with 0 tests)
- All mock helpers importable without errors
