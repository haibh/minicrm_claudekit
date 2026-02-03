---
title: "MiniCRM Test Plan - Unit & UI Tests"
description: "Comprehensive test plan with Vitest unit tests and Playwright UI tests for B2B MiniCRM"
status: in_progress
priority: P1
effort: 6h
branch: master
tags: [testing, vitest, playwright, unit-test, ui-test]
created: 2026-01-31
updated: 2026-02-01
---

# MiniCRM Test Plan - Unit & UI Tests

## Overview

Comprehensive test suite for the B2B MiniCRM application covering:
- **Unit Tests** (Vitest): Server actions, utility functions, dashboard queries, middleware
- **UI Tests** (Playwright): Auth flows, CRUD operations, navigation, Kanban board

## Tech Stack

| Tool | Purpose |
|------|---------|
| Vitest 4.x | Unit tests + integration tests |
| @testing-library/react | Component rendering tests |
| Playwright 1.58 | End-to-end UI tests |
| @faker-js/faker | Test data generation |

## Phases

| # | Phase | Status | Tests | Result |
|---|-------|--------|-------|--------|
| 1 | [Test Infrastructure Setup](./phase-01-test-infrastructure-setup.md) | done | 0 | configs + helpers created |
| 2 | [Unit Tests - Utils & Queries](./phase-02-unit-tests-utils-and-queries.md) | done | 18 | 18/18 passed |
| 3 | [Unit Tests - Server Actions](./phase-03-unit-tests-server-actions.md) | done | 39 | 39/39 passed |
| 4 | [Unit Tests - Middleware & Auth](./phase-04-unit-tests-middleware-and-auth.md) | done | 10 | 10/10 passed |
| 5 | [UI Tests - Auth Flows](./phase-05-ui-tests-auth-flows.md) | done | 12 | 11/12 passed, 1 failing |
| 6 | [UI Tests - Company CRUD](./phase-06-ui-tests-company-crud.md) | done | 10 | 8/10 passed, 2 failing |
| 7 | [UI Tests - Contact CRUD](./phase-07-ui-tests-contact-crud.md) | done | 10 | 7/10 passed, 3 failing |
| 8 | [UI Tests - Deal Pipeline](./phase-08-ui-tests-deal-pipeline.md) | done | 12 | 5/12 passed, 6 failing, 1 skipped |
| 9 | [UI Tests - Activity Tracking](./phase-09-ui-tests-activity-tracking.md) | done | 8 | 2/8 passed, 6 failing |
| 10 | [UI Tests - Dashboard](./phase-10-ui-tests-dashboard.md) | done | 8 | 2/8 passed, 4 failing, 2 skipped |

**Total: 127 test cases implemented**
- Unit Tests: **67/67 passing** (100%)
- UI Tests: **35/60 passing**, 22 failing, 3 skipped (58%)
- Combined: **102/127 passing** (80%)

## Progress Tracker

```
Phase 01: [##########] 100% - Infrastructure       DONE
Phase 02: [##########] 100% - Utils & Queries       67/67 unit tests passing
Phase 03: [##########] 100% - Server Actions        ↑
Phase 04: [##########] 100% - Middleware & Auth      ↑
Phase 05: [#########.]  92% - UI Auth Flows         11/12 passing
Phase 06: [########..]  80% - UI Companies          8/10 passing
Phase 07: [#######...]  70% - UI Contacts           7/10 passing
Phase 08: [####......]  42% - UI Deals              5/12 passing
Phase 09: [##........]  25% - UI Activities         2/8 passing
Phase 10: [##........]  25% - UI Dashboard          2/8 passing
─────────────────────────────────────────────────────────
Unit:     [##########] 100% (67/67 in 1.2s)
E2E:      [######....]  58% (35/60 passing)
Overall:  [########..]  80% (102/127 passing)
```

## Remaining E2E Failures (22 tests)

### Root Causes

| Cause | Tests Affected | Fix Required |
|-------|---------------|--------------|
| Next.js server cache — new entities not in dropdown | 10 | Add `revalidatePath()` to form pages after mutations |
| Search debounce timing | 3 | Increase wait after typing |
| Missing logout UI | 1 | Add sign-out button to layout |
| Pagination needs 20+ items | 1 | Seed more data or skip |
| Kanban drag-drop API | 1 (skipped) | @dnd-kit incompatible with Playwright drag |
| Dashboard data timing | 4 | Increase networkidle wait |
| Checkbox + authority timing | 2 | Add wait after checkbox click |

### To reach 100% E2E
1. Add `revalidatePath('/contacts/new')`, `/deals/new`, `/activities/new` after create mutations
2. Add sign-out button to dashboard layout
3. Increase test timeouts for search/filter tests
4. Seed 25+ companies for pagination test

## Test Files

### Unit Tests (src/__tests__/unit/) — 67 tests
| File | Tests | Status |
|------|-------|--------|
| utils.test.ts | 8 | passing |
| dashboard-queries.test.ts | 10 | passing |
| company-actions.test.ts | 9 | passing |
| contact-actions.test.ts | 9 | passing |
| activity-actions.test.ts | 9 | passing |
| deal-actions.test.ts | 12 | passing |
| middleware-and-prisma.test.ts | 10 | passing |

### E2E Tests (e2e/) — 60 tests
| File | Pass | Fail | Skip |
|------|------|------|------|
| auth-flows.spec.ts | 11 | 1 | 0 |
| company-crud.spec.ts | 8 | 2 | 0 |
| contact-crud-operations.spec.ts | 7 | 3 | 0 |
| deal-pipeline-management.spec.ts | 5 | 6 | 1 |
| activity-tracking-timeline.spec.ts | 2 | 6 | 0 |
| dashboard-widgets-metrics.spec.ts | 2 | 4 | 2 |

### Test Helpers
- `src/__tests__/helpers/mock-prisma.ts` — PrismaClient mock factory
- `src/__tests__/helpers/mock-auth.ts` — Auth session mocks
- `src/__tests__/helpers/form-data-builder.ts` — FormData builder
- `src/__tests__/helpers/test-data-factories.ts` — Faker data factories
- `e2e/auth-fixture.ts` — Playwright login fixture
- `e2e/radix-select-interaction-helpers.ts` — Radix UI select helpers

## Running Tests

```bash
# Unit tests (no external deps)
npm run test:unit

# E2E tests (needs DB + dev server)
docker compose up -d db
npm run test:e2e

# E2E single worker (more stable)
npx playwright test --workers=1

# E2E with interactive UI
npm run test:e2e:ui
```

## Issues Fixed During Implementation

1. **vi.mock hoisting** — Inlined mock factories to avoid init errors
2. **Prisma Decimal** — Used `Prisma.Decimal` from client export
3. **Middleware matcher** — config.matcher is array, adjusted assertions
4. **Auth fixture** — waitForFunction instead of waitForURL for redirect
5. **Test user password** — Re-registered via Better Auth API (raw SQL hash invalid)
6. **Radix Select selectors** — Used `data-slot` attributes instead of ARIA roles
7. **Dashboard route missing** — Created `/dashboard` route (was only `(dashboard)/`)
8. **CardTitle accessibility** — Changed from `<div>` to `<h3>` for heading role
