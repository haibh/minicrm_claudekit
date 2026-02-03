# Phase 07: UI Tests - Contact CRUD

> Parent: [plan.md](./plan.md) | Depends on: [Phase 06](./phase-06-ui-tests-company-crud.md)

## Overview
- **Priority:** P1
- **Status:** pending
- **Description:** Playwright E2E tests for contact list, create, view, edit, delete with decision-maker tracking
- **Test Count:** 10

## Related Pages
- `src/app/(dashboard)/contacts/page.tsx` — List with search/filter
- `src/app/(dashboard)/contacts/new/page.tsx` — Create form
- `src/app/(dashboard)/contacts/[id]/page.tsx` — Detail view
- `src/app/(dashboard)/contacts/[id]/edit/page.tsx` — Edit form

---

## Test Cases

### File: `e2e/contact-crud.spec.ts` (10 tests)

> All tests use authenticated fixture

#### TC-CN01: Contact list page renders
- **Navigate:** /contacts
- **Expected:** Page header, "New Contact" button, table visible

#### TC-CN02: Create contact with company association
- **Precondition:** Company "Acme" exists
- **Action:** Click "New Contact" → fill name, select company, add email → submit
- **Expected:** Redirected to detail, company name shown

#### TC-CN03: Create decision-maker contact
- **Action:** Create contact with isDecisionMaker checked, authorityLevel="primary"
- **Expected:** Detail page shows decision maker badge with "Primary" authority

#### TC-CN04: Authority level hidden when not decision maker
- **Action:** On new contact form, leave isDecisionMaker unchecked
- **Expected:** Authority level dropdown is not visible

#### TC-CN05: Authority level shown when decision maker checked
- **Action:** Check isDecisionMaker checkbox
- **Expected:** Authority level dropdown appears

#### TC-CN06: View contact detail
- **Navigate:** /contacts/{id}
- **Expected:** Name, email, phone, company, job title, decision maker status visible

#### TC-CN07: Edit contact
- **Action:** Edit → change job title → submit
- **Expected:** Updated job title on detail page

#### TC-CN08: Delete contact
- **Action:** Delete → confirm
- **Expected:** Redirected to /contacts

#### TC-CN09: Search contacts
- **Action:** Type contact name in search
- **Expected:** Filtered results

#### TC-CN10: Filter by decision maker status
- **Action:** Filter by decisionMaker=true
- **Expected:** Only decision makers shown

---

## Todo

- [ ] TC-CN01: Contact list renders
- [ ] TC-CN02: Create contact with company
- [ ] TC-CN03: Create decision-maker contact
- [ ] TC-CN04: Authority hidden when unchecked
- [ ] TC-CN05: Authority shown when checked
- [ ] TC-CN06: View contact detail
- [ ] TC-CN07: Edit contact
- [ ] TC-CN08: Delete contact
- [ ] TC-CN09: Search contacts
- [ ] TC-CN10: Filter by decision maker

## Success Criteria
- All 10 tests pass
- Decision-maker toggle logic verified
- Company association displayed correctly
