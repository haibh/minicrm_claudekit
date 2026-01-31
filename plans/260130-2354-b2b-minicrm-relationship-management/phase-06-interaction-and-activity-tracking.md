# Phase 06: Interaction & Activity Tracking

## Context Links
- [Plan Overview](./plan.md)
- [PRD — Activity Features](../../docs/product-requirements-pdr.md#33-interaction--activity-tracking)
- [Research: Interaction Logging](./research/researcher-01-crm-data-models-and-features.md)
- Depends on: [Phase 04](./phase-04-company-management.md), [Phase 05](./phase-05-contact-management.md)

## Overview
- **Date:** 2026-01-30
- **Priority:** P1
- **Description:** Activity logging system for calls, emails, meetings, and notes. Includes global activity list, per-entity timelines, and creation from multiple contexts (standalone, from contact detail, from company detail, from deal detail).
- **Implementation Status:** Pending
- **Review Status:** Not started
- **Effort:** 5h

## Key Insights
- Activities are the relationship history — most frequently created entity
- Must be loggable from multiple contexts: global, contact, company, deal
- Timeline view (chronological) is primary display pattern
- Type categorization (call/email/meeting/note) with visual icons
- Optional links to company, contact, deal (at least one required)
- Outcome and nextSteps fields support follow-up tracking

## Requirements

### Functional
- Create activity with type, subject, description, date, optional duration
- Link activity to contact and/or company and/or deal
- Edit/delete activities
- Global activity list: paginated, filterable by type/date/contact/company
- Per-entity timeline views (contact detail, company detail, deal detail)
- Activity type icons: phone (call), mail (email), users (meeting), notepad (note)
- Date range filter
- Outcome and next-steps fields for follow-up tracking

### Non-Functional
- Activity creation < 500ms
- Timeline renders chronologically (newest first)
- Support 1000+ activities per user with pagination

## Architecture

### Server Actions
```
src/actions/activity-actions.ts
  - createActivity(formData) -> revalidatePath
  - updateActivity(id, formData) -> revalidatePath
  - deleteActivity(id) -> revalidatePath
```

### Page Structure
```
src/app/(dashboard)/activities/
  ├── page.tsx              # Global activity list
  ├── new/
  │   └── page.tsx          # Create activity (standalone)
  └── [id]/
      ├── page.tsx          # Activity detail
      └── edit/
          └── page.tsx      # Edit activity
```

### Context-Aware Creation
Activities can be created from:
- `/activities/new` — standalone, user picks contact/company/deal
- `/contacts/[id]` — pre-links to contact + their company
- `/companies/[id]` — pre-links to company
- `/deals/[id]` — pre-links to deal + its contact/company

## Related Code Files

### Files to Create
- `src/actions/activity-actions.ts` — Server Actions for activity CRUD
- `src/app/(dashboard)/activities/page.tsx` — Global activity list
- `src/app/(dashboard)/activities/new/page.tsx` — Create activity page
- `src/app/(dashboard)/activities/[id]/page.tsx` — Activity detail view
- `src/app/(dashboard)/activities/[id]/edit/page.tsx` — Edit activity page
- `src/components/activities/activity-list.tsx` — Activity list/table component
- `src/components/activities/activity-form.tsx` — Create/edit form
- `src/components/activities/activity-timeline.tsx` — Chronological timeline component (reusable)
- `src/components/activities/activity-timeline-item.tsx` — Single timeline entry
- `src/components/activities/activity-type-icon.tsx` — Type-based icon component
- `src/components/activities/activity-filters.tsx` — Filter toolbar
- `src/components/shared/contact-selector.tsx` — Searchable contact dropdown
- `src/components/shared/deal-selector.tsx` — Searchable deal dropdown
- `src/components/shared/date-range-picker.tsx` — Date range filter component

### Files to Modify
- `src/app/(dashboard)/contacts/[id]/page.tsx` — Wire Activities tab with timeline
- `src/app/(dashboard)/companies/[id]/page.tsx` — Wire Activities tab with timeline
- Company/contact detail pages: Add "Log Activity" quick action button

## Implementation Steps

1. **Build activity type icon** `src/components/activities/activity-type-icon.tsx`
   - Map ActivityType enum to Lucide icons: call->Phone, email->Mail, meeting->Users, note->FileText
   - Color coding per type

2. **Build contact selector** `src/components/shared/contact-selector.tsx`
   - Searchable dropdown for contacts (shows name + company)
   - Optionally filter by company when company already selected

3. **Build deal selector** `src/components/shared/deal-selector.tsx`
   - Searchable dropdown for deals (shows name + company + stage)

4. **Build date range picker** `src/components/shared/date-range-picker.tsx`
   - Simple from/to date inputs
   - Preset ranges: Today, This Week, This Month, Last 30 Days
   - Install shadcn/ui: `npx shadcn@latest add calendar popover`

5. **Create Server Actions** `src/actions/activity-actions.ts`
   - `createActivity(formData)` — Validate at least one link (company/contact/deal), create
   - `updateActivity(id, formData)` — Validate ownership, update
   - `deleteActivity(id)` — Delete activity
   - All: session check, userId scoping

6. **Build activity form** `src/components/activities/activity-form.tsx`
   - Fields: type* (select), subject*, description (textarea), date* (datetime), durationMinutes, outcome, nextSteps (textarea)
   - Selectors: company (optional), contact (optional, filtered by selected company), deal (optional)
   - Pre-populate selectors based on URL params (contactId, companyId, dealId)
   - Validation: at least subject and type required

7. **Build activity timeline** `src/components/activities/activity-timeline.tsx`
   - Reusable component accepting Activity[] prop
   - Vertical timeline with date grouping (Today, Yesterday, This Week, Earlier)
   - Each item: type icon, subject, description preview, linked entities, timestamp

8. **Build activity timeline item** `src/components/activities/activity-timeline-item.tsx`
   - Type icon + subject line
   - Description truncated with expand
   - Links to contact, company, deal (if set)
   - Outcome badge + next steps preview
   - Edit/delete actions

9. **Build global activity list page** `src/app/(dashboard)/activities/page.tsx`
   - Server Component; fetch activities with relations
   - ActivityFilters + ActivityList (table format for global view)
   - PageHeader with "Log Activity" button

10. **Build activity filters** `src/components/activities/activity-filters.tsx`
    - Filter by: type (multi-select), date range, company, contact
    - Clear filters

11. **Build create activity page** `src/app/(dashboard)/activities/new/page.tsx`
    - Read URL params: ?contactId=X&companyId=Y&dealId=Z
    - Pre-populate selectors from params
    - Render ActivityForm

12. **Build activity detail page** `src/app/(dashboard)/activities/[id]/page.tsx`
    - Full activity info display
    - Links to related entities
    - Edit/delete actions

13. **Build edit activity page** `src/app/(dashboard)/activities/[id]/edit/page.tsx`
    - Prefilled ActivityForm

14. **Wire entity detail pages**
    - Contact detail Activities tab: render ActivityTimeline filtered by contactId
    - Company detail Activities tab: render ActivityTimeline filtered by companyId
    - Add "Log Activity" button on contact/company detail -> `/activities/new?contactId=X`

15. **Test activity flows**
    - Create activity from global page
    - Create activity from contact detail (pre-linked)
    - Create activity from company detail (pre-linked)
    - Verify timeline shows on contact/company detail
    - Filter by type, date range
    - Edit/delete activity

## Todo List
- [ ] Build activity type icon component (call, email, meeting, note)
- [ ] Build contact selector shared component
- [ ] Build deal selector shared component
- [ ] Build date range picker component
- [ ] Install shadcn/ui calendar and popover components
- [ ] Create activity Server Actions (create, update, delete)
- [ ] Build activity form with entity selectors and URL param pre-population
- [ ] Build activity timeline component (reusable)
- [ ] Build activity timeline item component
- [ ] Build global activity list page
- [ ] Build activity filters (type, date range, company, contact)
- [ ] Build create activity page with URL param support
- [ ] Build activity detail page
- [ ] Build edit activity page
- [ ] Wire contact detail Activities tab with real timeline data
- [ ] Wire company detail Activities tab with real timeline data
- [ ] Add "Log Activity" quick action buttons on entity detail pages
- [ ] Test: create activity from global page
- [ ] Test: create activity pre-linked from contact detail
- [ ] Test: timeline displays correctly on entity detail pages
- [ ] Test: filter by type and date range works
- [ ] Test: edit and delete activity

## Success Criteria
- Activities loggable from global page and entity detail pages
- Pre-linking works via URL parameters
- Timeline displays chronologically on contact/company detail tabs
- Type icons and categorization display correctly
- Filters narrow results by type, date, company, contact
- Outcome and next-steps fields captured and displayed

## Risk Assessment
- **Multiple creation contexts**: Use URL params consistently; test all entry points
- **Timeline performance**: Paginate timeline (load 20, "load more" button) for contacts with many activities
- **Date handling**: Ensure consistent timezone handling (store UTC, display local)
- **Required links validation**: At least subject + type required; entity links optional but encouraged

## Security Considerations
- Validate all referenced entity IDs (contact, company, deal) belong to current user
- Activity queries always scoped by userId
- No activity visible to other users
- Server Actions check ownership before update/delete

## Next Steps
- Phase 07: Deal Pipeline (activities link to deals)
- Phase 08: Dashboard (activity feed widget)
