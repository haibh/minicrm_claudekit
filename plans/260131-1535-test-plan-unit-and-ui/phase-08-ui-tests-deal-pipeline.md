# Phase 08: UI Tests - Deal Pipeline

> Parent: [plan.md](./plan.md) | Depends on: [Phase 06](./phase-06-ui-tests-company-crud.md)

## Overview
- **Priority:** P1
- **Status:** pending
- **Description:** Playwright E2E tests for deal CRUD, Kanban board drag-drop, list view, stage management
- **Test Count:** 12

## Related Pages
- `src/app/(dashboard)/deals/page.tsx` — Kanban/list view with toggle
- `src/app/(dashboard)/deals/new/page.tsx` — Create form
- `src/app/(dashboard)/deals/[id]/page.tsx` — Detail view
- `src/app/(dashboard)/deals/[id]/edit/page.tsx` — Edit form

---

## Test Cases

### File: `e2e/deal-pipeline.spec.ts` (12 tests)

> All tests use authenticated fixture

#### TC-DL01: Deals page renders in Kanban view by default
- **Navigate:** /deals
- **Expected:** 6 stage columns visible (Prospecting → Closed Won/Lost)

#### TC-DL02: Toggle to list view
- **Action:** Click list view toggle
- **Expected:** Table view displayed, URL has view=list

#### TC-DL03: Toggle back to Kanban view
- **Action:** Click kanban view toggle
- **Expected:** Kanban board displayed, URL has view=kanban

#### TC-DL04: Create new deal
- **Precondition:** Company exists
- **Action:** Click "New Deal" → fill name, value, select company, stage → submit
- **Expected:** Redirected to deal detail with correct data

#### TC-DL05: Create deal with contact
- **Precondition:** Company + Contact exist
- **Action:** Select company → contact dropdown shows company's contacts → select contact → submit
- **Expected:** Deal linked to both company and contact

#### TC-DL06: Contact dropdown filters by company
- **Action:** Select Company A → check contacts dropdown
- **Expected:** Only Company A's contacts listed

#### TC-DL07: View deal detail
- **Navigate:** /deals/{id}
- **Expected:** Name, value (formatted), stage badge, company, contact, probability, close date

#### TC-DL08: Edit deal
- **Action:** Edit → change value and stage → submit
- **Expected:** Updated values on detail page

#### TC-DL09: Delete deal
- **Action:** Delete → confirm
- **Expected:** Redirected to /deals

#### TC-DL10: Kanban drag-drop changes stage
- **Precondition:** Deal in "Prospecting" column
- **Action:** Drag deal card to "Qualification" column
- **Expected:** Card moves to new column, stage persisted after refresh

#### TC-DL11: Kanban shows deal cards with value
- **Navigate:** /deals (kanban)
- **Expected:** Each card shows deal name, company, formatted value

#### TC-DL12: Deal stage badge has correct colors
- **Navigate:** /deals/{id} for each stage
- **Expected:** Badge color matches stage (green for closed_won, red for closed_lost, etc.)

---

## Todo

- [ ] TC-DL01: Kanban view renders
- [ ] TC-DL02: Toggle to list view
- [ ] TC-DL03: Toggle back to kanban
- [ ] TC-DL04: Create deal
- [ ] TC-DL05: Create deal with contact
- [ ] TC-DL06: Contact filters by company
- [ ] TC-DL07: View deal detail
- [ ] TC-DL08: Edit deal
- [ ] TC-DL09: Delete deal
- [ ] TC-DL10: Kanban drag-drop
- [ ] TC-DL11: Kanban card content
- [ ] TC-DL12: Stage badge colors

## Success Criteria
- All 12 tests pass
- Kanban drag-drop persists stage change
- View toggle preserves deal data
- Contact filtering by company works
