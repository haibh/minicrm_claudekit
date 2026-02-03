# Phase 09: UI Tests - Activity Tracking

> Parent: [plan.md](./plan.md) | Depends on: [Phase 06](./phase-06-ui-tests-company-crud.md)

## Overview
- **Priority:** P2
- **Status:** pending
- **Description:** Playwright E2E tests for activity creation, timeline view, filtering, entity linking
- **Test Count:** 8

## Related Pages
- `src/app/(dashboard)/activities/page.tsx` — Timeline with search/filter
- `src/app/(dashboard)/activities/new/page.tsx` — Create form
- `src/app/(dashboard)/activities/[id]/page.tsx` — Detail view
- `src/app/(dashboard)/activities/[id]/edit/page.tsx` — Edit form

---

## Test Cases

### File: `e2e/activity-tracking.spec.ts` (8 tests)

> All tests use authenticated fixture

#### TC-AT01: Activity list renders as timeline
- **Navigate:** /activities
- **Expected:** Timeline layout with activity cards, type icons, dates

#### TC-AT02: Create activity linked to company
- **Precondition:** Company exists
- **Action:** New activity → type=call, subject="Discovery call", select company → submit
- **Expected:** Detail page shows activity with company link

#### TC-AT03: Create activity linked to contact and deal
- **Precondition:** Company, contact, deal exist
- **Action:** New activity → type=meeting, select company, contact, deal → submit
- **Expected:** All three entities linked on detail page

#### TC-AT04: Pre-fill form via URL params
- **Navigate:** /activities/new?companyId=c1&contactId=ct1
- **Expected:** Company and contact pre-selected in form

#### TC-AT05: Filter activities by type
- **Action:** Select type filter "email"
- **Expected:** Only email activities shown

#### TC-AT06: Search activities by subject
- **Action:** Type "follow up" in search
- **Expected:** Only matching activities shown

#### TC-AT07: Edit activity
- **Action:** Edit → change outcome text → submit
- **Expected:** Updated outcome on detail page

#### TC-AT08: Delete activity
- **Action:** Delete → confirm
- **Expected:** Redirected to /activities

---

## Todo

- [ ] TC-AT01: Timeline renders
- [ ] TC-AT02: Create linked to company
- [ ] TC-AT03: Create linked to contact and deal
- [ ] TC-AT04: Pre-fill via URL params
- [ ] TC-AT05: Filter by type
- [ ] TC-AT06: Search by subject
- [ ] TC-AT07: Edit activity
- [ ] TC-AT08: Delete activity

## Success Criteria
- All 8 tests pass
- Entity linking works across company/contact/deal
- URL param pre-filling functional
