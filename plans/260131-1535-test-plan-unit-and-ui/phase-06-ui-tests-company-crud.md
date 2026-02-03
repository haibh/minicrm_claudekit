# Phase 06: UI Tests - Company CRUD

> Parent: [plan.md](./plan.md) | Depends on: [Phase 05](./phase-05-ui-tests-auth-flows.md)

## Overview
- **Priority:** P1
- **Status:** pending
- **Description:** Playwright E2E tests for company list, create, view, edit, delete
- **Test Count:** 10

## Related Pages
- `src/app/(dashboard)/companies/page.tsx` — List with search/filter/pagination
- `src/app/(dashboard)/companies/new/page.tsx` — Create form
- `src/app/(dashboard)/companies/[id]/page.tsx` — Detail view
- `src/app/(dashboard)/companies/[id]/edit/page.tsx` — Edit form

---

## Test Cases

### File: `e2e/company-crud.spec.ts` (10 tests)

> All tests use authenticated fixture (logged-in user)

#### TC-CO01: Company list page renders
- **Navigate:** /companies
- **Expected:** Page header, "New Company" button, table/list visible

#### TC-CO02: Create new company
- **Action:** Click "New Company" → fill name, industry, size → submit
- **Expected:** Redirected to company detail, data visible

#### TC-CO03: Create company with tags
- **Action:** Create company with tags "vip, enterprise"
- **Expected:** Tags displayed on detail page

#### TC-CO04: View company detail
- **Navigate:** /companies/{id}
- **Expected:** All fields displayed: name, industry, size, website, contacts count, deals count

#### TC-CO05: Edit company
- **Action:** On detail page, click Edit → change name → submit
- **Expected:** Redirected to detail, updated name visible

#### TC-CO06: Delete company
- **Action:** Click delete → confirm in dialog
- **Expected:** Redirected to /companies, company no longer in list

#### TC-CO07: Search companies by name
- **Action:** Type "Acme" in search input
- **Expected:** Only matching companies shown

#### TC-CO08: Filter companies by size
- **Action:** Select size filter "medium_51_200"
- **Expected:** Only matching companies shown

#### TC-CO09: Pagination works
- **Precondition:** >20 companies exist
- **Action:** Click next page
- **Expected:** URL updates with page=2, different companies shown

#### TC-CO10: Create company rejects empty name
- **Action:** Submit form with empty name
- **Expected:** Validation error, stays on form

---

## Todo

- [ ] TC-CO01: Company list renders
- [ ] TC-CO02: Create company
- [ ] TC-CO03: Create company with tags
- [ ] TC-CO04: View company detail
- [ ] TC-CO05: Edit company
- [ ] TC-CO06: Delete company
- [ ] TC-CO07: Search by name
- [ ] TC-CO08: Filter by size
- [ ] TC-CO09: Pagination
- [ ] TC-CO10: Empty name validation

## Success Criteria
- All 10 tests pass
- Full CRUD lifecycle verified
- Search/filter/pagination functional
