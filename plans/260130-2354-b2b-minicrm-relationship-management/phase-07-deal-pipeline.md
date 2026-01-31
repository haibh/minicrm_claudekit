# Phase 07: Deal Pipeline

## Context Links
- [Plan Overview](./plan.md)
- [PRD — Deal Pipeline](../../docs/product-requirements-pdr.md#34-deal-pipeline)
- [Research: Pipeline Visualization](./research/researcher-01-crm-data-models-and-features.md)
- Depends on: [Phase 04](./phase-04-company-management.md), [Phase 05](./phase-05-contact-management.md)

## Overview
- **Date:** 2026-01-30
- **Priority:** P1
- **Description:** Deal/opportunity management with CRUD, Kanban board for stage visualization with drag-and-drop, list view with filters, deal detail with linked entities and activities.
- **Implementation Status:** Pending
- **Review Status:** Not started
- **Effort:** 5h

## Key Insights
- Kanban board is the primary view for deals (visual pipeline management)
- Stages: Prospecting -> Qualification -> Proposal -> Negotiation -> Closed Won / Closed Lost
- Drag-and-drop between stages updates deal.stage via Server Action
- Deal cards show: name, value, company, contact, expected close date
- List view as alternative for sorting/filtering large deal sets
- Value tracking per stage enables pipeline reporting (Phase 08)

## Requirements

### Functional
- Create deal linked to company (required) and contact (optional)
- Edit deal (all fields including stage)
- Delete deal
- Kanban board: columns per stage, deal cards, drag-and-drop stage change
- List view: paginated, sortable by value/date/stage, searchable
- Filter by stage, company, contact, date range, value range
- Deal detail: info card + tabs (Activities, Notes)
- Pipeline summary: total value per stage shown in column headers
- Toggle between Kanban and List view

### Non-Functional
- Kanban renders < 1s for 100 deals
- Drag-and-drop updates stage optimistically (instant UI, async persist)
- Responsive: Kanban scrolls horizontally on small screens

## Architecture

### Server Actions
```
src/actions/deal-actions.ts
  - createDeal(formData) -> redirect to detail
  - updateDeal(id, formData) -> revalidatePath
  - updateDealStage(id, newStage) -> revalidatePath (optimistic)
  - deleteDeal(id) -> redirect to list/kanban
```

### Page Structure
```
src/app/(dashboard)/deals/
  ├── page.tsx              # Deals page (Kanban default + List toggle)
  ├── new/
  │   └── page.tsx          # Create deal
  └── [id]/
      ├── page.tsx          # Deal detail
      └── edit/
          └── page.tsx      # Edit deal
```

### Kanban Architecture
- Server Component fetches all deals grouped by stage
- KanbanBoard Client Component handles drag-and-drop interactions
- On drop: optimistic UI update + Server Action call to persist
- Uses @dnd-kit/core for accessible drag-and-drop

## Related Code Files

### Files to Create
- `src/actions/deal-actions.ts` — Server Actions for deal CRUD + stage update
- `src/app/(dashboard)/deals/page.tsx` — Deals page (Kanban + List)
- `src/app/(dashboard)/deals/new/page.tsx` — Create deal page
- `src/app/(dashboard)/deals/[id]/page.tsx` — Deal detail page
- `src/app/(dashboard)/deals/[id]/edit/page.tsx` — Edit deal page
- `src/components/deals/deal-kanban-board.tsx` — Kanban board Client Component
- `src/components/deals/deal-kanban-column.tsx` — Single stage column
- `src/components/deals/deal-kanban-card.tsx` — Deal card within column
- `src/components/deals/deal-list-table.tsx` — List view table
- `src/components/deals/deal-form.tsx` — Create/edit form
- `src/components/deals/deal-detail-card.tsx` — Deal info header
- `src/components/deals/deal-filters.tsx` — Filter toolbar
- `src/components/deals/deal-stage-badge.tsx` — Color-coded stage badge
- `src/components/deals/deal-view-toggle.tsx` — Kanban/List toggle button

### Files to Modify
- `src/app/(dashboard)/contacts/[id]/page.tsx` — Wire Deals tab
- `src/app/(dashboard)/companies/[id]/page.tsx` — Wire Deals tab

## Implementation Steps

1. **Install drag-and-drop library**
   ```bash
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   ```

2. **Build deal stage badge** `src/components/deals/deal-stage-badge.tsx`
   - Color mapping: prospecting (gray), qualification (blue), proposal (yellow), negotiation (orange), closed_won (green), closed_lost (red)

3. **Build deal view toggle** `src/components/deals/deal-view-toggle.tsx`
   - Two buttons: Kanban (grid icon) / List (list icon)
   - Stores preference in URL param `?view=kanban|list`

4. **Create Server Actions** `src/actions/deal-actions.ts`
   - `createDeal(formData)` — Validate company exists for user, create deal
   - `updateDeal(id, formData)` — Full update
   - `updateDealStage(id, stage)` — Lightweight stage-only update for drag-and-drop
   - `deleteDeal(id)` — Delete deal + cascade activities
   - All: session + userId scoping

5. **Build Kanban card** `src/components/deals/deal-kanban-card.tsx`
   - Displays: deal name, value (formatted currency), company name, contact name, expected close date
   - Stage badge
   - Click -> navigate to deal detail
   - Draggable via @dnd-kit

6. **Build Kanban column** `src/components/deals/deal-kanban-column.tsx`
   - Column header: stage name + deal count + total value
   - Droppable zone
   - Renders deal cards
   - Visual feedback on drag over

7. **Build Kanban board** `src/components/deals/deal-kanban-board.tsx`
   - Client Component ("use client")
   - 6 columns (one per DealStage)
   - DndContext wrapping all columns
   - onDragEnd: call `updateDealStage` Server Action
   - Optimistic update: move card in UI immediately, revert on error
   - Horizontal scroll on overflow

8. **Build deal list table** `src/components/deals/deal-list-table.tsx`
   - Columns: Name, Value, Stage (badge), Company, Contact, Expected Close, Probability, Created
   - Sortable columns
   - Row click -> detail

9. **Build deal filters** `src/components/deals/deal-filters.tsx`
   - Filter by: stage (multi-select), company, contact, value range (min/max inputs), date range
   - Applied to both Kanban and List views

10. **Build deals page** `src/app/(dashboard)/deals/page.tsx`
    - Server Component; fetch deals grouped by stage
    - Read `?view=` param for toggle state
    - Render DealViewToggle + DealFilters + (KanbanBoard or DealListTable)
    - PageHeader with "New Deal" button

11. **Build deal form** `src/components/deals/deal-form.tsx`
    - Fields: name*, value* (number input), stage* (select), probability (slider/number 0-100), expectedCloseDate (date picker), notes (textarea)
    - Selectors: company* (required), contact (optional, filtered by selected company)
    - Shared create/edit

12. **Build create deal page** `src/app/(dashboard)/deals/new/page.tsx`
    - URL params: ?companyId=X&contactId=Y for pre-linking
    - Fetch companies, contacts, render DealForm

13. **Build deal detail page** `src/app/(dashboard)/deals/[id]/page.tsx`
    - DealDetailCard: name, value, stage badge, probability, close date, company link, contact link
    - Tabs: Overview (notes), Activities (timeline)
    - Edit + Delete + "Change Stage" dropdown
    - "Log Activity" button -> `/activities/new?dealId=X`

14. **Build edit deal page** `src/app/(dashboard)/deals/[id]/edit/page.tsx`
    - Prefilled DealForm

15. **Wire entity detail deal tabs**
    - Contact detail Deals tab: list deals where contactId matches
    - Company detail Deals tab: list deals where companyId matches
    - "New Deal" button on each with pre-linking

16. **Test deal pipeline**
    - Create deal -> appears in correct Kanban column
    - Drag deal between stages -> stage updates
    - List view shows same data with sort/filter
    - Deal detail shows linked activities
    - Pipeline value totals correct per column

## Todo List
- [ ] Install @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- [ ] Build deal stage badge component (color-coded)
- [ ] Build deal view toggle component (Kanban/List)
- [ ] Create deal Server Actions (create, update, updateStage, delete)
- [ ] Build deal Kanban card component (draggable)
- [ ] Build deal Kanban column component (droppable)
- [ ] Build deal Kanban board with @dnd-kit drag-and-drop
- [ ] Implement optimistic stage update on drag-and-drop
- [ ] Build deal list table component
- [ ] Build deal filters (stage, company, value range, date range)
- [ ] Build deals page with Kanban/List toggle
- [ ] Build deal form (shared create/edit with company/contact selectors)
- [ ] Build create deal page with URL param pre-linking
- [ ] Build deal detail page with tabs (Overview, Activities)
- [ ] Build deal detail card component
- [ ] Build edit deal page
- [ ] Wire contact detail Deals tab with real data
- [ ] Wire company detail Deals tab with real data
- [ ] Test: create deal -> correct Kanban column
- [ ] Test: drag deal -> stage updates (optimistic + persisted)
- [ ] Test: Kanban column headers show count + total value
- [ ] Test: toggle between Kanban and List views
- [ ] Test: filters work on both views

## Success Criteria
- Kanban board renders all stages with deal cards
- Drag-and-drop moves deals between stages with optimistic update
- Pipeline value totals shown per stage column
- List view provides alternative sortable/filterable table
- Deal form with company/contact selectors works
- Deal detail shows linked activities
- Entity detail pages show associated deals

## Risk Assessment
- **@dnd-kit bundle size**: Tree-shakeable; only import needed modules
- **Optimistic update revert**: Handle Server Action failure gracefully; show toast on error
- **Many deals per column**: Virtual scrolling not needed for MVP (< 50 deals/stage expected)
- **Mobile Kanban**: Horizontal scroll works; touch drag-and-drop needs testing

## Security Considerations
- Deal value is sensitive business data; ensure userId scoping
- updateDealStage validates deal ownership before mutation
- Company and contact selectors only show user's own entities
- No cross-user deal visibility

## Next Steps
- Phase 08: Dashboard (pipeline overview widget uses deal stage data)
- Phase 09: Docker deployment
