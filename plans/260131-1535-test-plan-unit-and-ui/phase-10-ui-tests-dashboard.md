# Phase 10: UI Tests - Dashboard

> Parent: [plan.md](./plan.md) | Depends on: [Phase 05](./phase-05-ui-tests-auth-flows.md)

## Overview
- **Priority:** P2
- **Status:** pending
- **Description:** Playwright E2E tests for dashboard widgets, metrics, navigation, quick actions
- **Test Count:** 8

## Related Pages
- `src/app/(dashboard)/page.tsx` — Dashboard with parallel data loading
- `src/components/dashboard/` — All dashboard widgets

---

## Test Cases

### File: `e2e/dashboard.spec.ts` (8 tests)

> All tests use authenticated fixture with seeded data

#### TC-DB01: Dashboard renders all widgets
- **Navigate:** / (redirects to dashboard)
- **Expected:** Metrics row, pipeline overview, recent activities, deals closing soon, activity summary all visible

#### TC-DB02: Metrics show correct counts
- **Precondition:** Seeded data (5 companies, 15 contacts, 10 deals)
- **Expected:** Metric cards show non-zero numbers matching seed data

#### TC-DB03: Quick actions bar has create links
- **Expected:** Links to new company, contact, deal, activity visible

#### TC-DB04: Quick action navigates to create page
- **Action:** Click "New Company" quick action
- **Expected:** Navigated to /companies/new

#### TC-DB05: Pipeline overview shows stages
- **Expected:** Stage names visible with deal counts

#### TC-DB06: Recent activities widget shows items
- **Expected:** Activity items with type icons, subjects, timestamps

#### TC-DB07: Deals closing soon shows upcoming deals
- **Precondition:** Deals with expectedCloseDate in next 30 days
- **Expected:** Deal names with close dates visible

#### TC-DB08: Metric card links navigate correctly
- **Action:** Click companies metric card
- **Expected:** Navigated to /companies

---

## Todo

- [ ] TC-DB01: Dashboard renders widgets
- [ ] TC-DB02: Metrics correct counts
- [ ] TC-DB03: Quick actions present
- [ ] TC-DB04: Quick action navigation
- [ ] TC-DB05: Pipeline overview stages
- [ ] TC-DB06: Recent activities widget
- [ ] TC-DB07: Deals closing soon widget
- [ ] TC-DB08: Metric card navigation

## Success Criteria
- All 8 tests pass
- Dashboard loads without errors
- All widgets display data from seeded database
- Navigation links functional
