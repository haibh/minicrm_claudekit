# Phase 05: Contact Management

## Context Links
- [Plan Overview](./plan.md)
- [PRD — Contact Features](../../docs/product-requirements-pdr.md#32-contact-management-decision-maker-tracking)
- Depends on: [Phase 04](./phase-04-company-management.md)

## Overview
- **Date:** 2026-01-30
- **Priority:** P1
- **Description:** Full CRUD for contacts with decision-maker tracking, company association, authority level classification, list/detail views with search/filter, and tag management.
- **Implementation Status:** Pending
- **Review Status:** Not started
- **Effort:** 5h

## Key Insights
- Decision-maker tracking is the core differentiator for this CRM
- Contacts always belong to a company (companyId FK required)
- Authority level (primary/secondary/influencer) helps prioritize outreach
- Contact detail shows interaction timeline, linked deals
- Reuse shared components from Phase 04 (table, pagination, search, tags)

## Requirements

### Functional
- Create contact linked to a company (company selection required)
- Edit contact (all fields)
- Delete contact (cascade deletes activities linked to this contact)
- Mark contact as decision-maker with authority level
- List view: paginated, searchable, sortable
- Filter by company, authority level, isDecisionMaker, tags
- Detail view: contact info card + tabs (Activities, Deals)
- Quick filter: "Show Decision Makers Only" toggle

### Non-Functional
- List loads < 1s for 500 contacts
- Company selector with search (for large company lists)

## Architecture

### Server Actions
```
src/actions/contact-actions.ts
  - createContact(formData) -> redirect to detail
  - updateContact(id, formData) -> revalidatePath
  - deleteContact(id) -> redirect to list
```

### Page Structure
```
src/app/(dashboard)/contacts/
  ├── page.tsx              # Contact list
  ├── new/
  │   └── page.tsx          # Create contact
  └── [id]/
      ├── page.tsx          # Contact detail
      └── edit/
          └── page.tsx      # Edit contact
```

## Related Code Files

### Files to Create
- `src/actions/contact-actions.ts` — Server Actions for contact CRUD
- `src/app/(dashboard)/contacts/page.tsx` — Contact list page
- `src/app/(dashboard)/contacts/new/page.tsx` — Create contact page
- `src/app/(dashboard)/contacts/[id]/page.tsx` — Contact detail page
- `src/app/(dashboard)/contacts/[id]/edit/page.tsx` — Edit contact page
- `src/components/contacts/contact-list-table.tsx` — Contact table component
- `src/components/contacts/contact-form.tsx` — Create/edit form
- `src/components/contacts/contact-detail-card.tsx` — Contact info header
- `src/components/contacts/contact-filters.tsx` — Filter toolbar
- `src/components/contacts/decision-maker-badge.tsx` — Decision-maker indicator
- `src/components/shared/company-selector.tsx` — Searchable company dropdown (reusable)

### Files to Modify
- `src/components/layout/sidebar-navigation.tsx` — Already has Contacts link
- `src/app/(dashboard)/companies/[id]/page.tsx` — Wire contacts tab to show real data

## Implementation Steps

1. **Create company selector** `src/components/shared/company-selector.tsx`
   - Client Component with search/filter dropdown
   - Fetches companies for current user
   - Used in contact form and potentially deal form
   - Shows company name + industry as hint

2. **Create decision-maker badge** `src/components/contacts/decision-maker-badge.tsx`
   - Visual indicator: star icon for decision-makers
   - Color-coded authority level: primary (gold), secondary (blue), influencer (gray)

3. **Create Server Actions** `src/actions/contact-actions.ts`
   - `createContact(formData)` — Validate companyId exists for user, create contact, handle tags
   - `updateContact(id, formData)` — Validate ownership, update
   - `deleteContact(id)` — Delete with associated activities cascade
   - All: session check, userId scoping

4. **Build contact list page** `src/app/(dashboard)/contacts/page.tsx`
   - Server Component; read searchParams
   - Fetch contacts with company name (include), activity count
   - Pass to ContactListTable

5. **Build ContactListTable** `src/components/contacts/contact-list-table.tsx`
   - Columns: Name, Company, Job Title, Decision Maker (badge), Authority, Phone, Email, Tags
   - Row click -> detail page
   - Decision-maker column shows badge component

6. **Build ContactFilters** `src/components/contacts/contact-filters.tsx`
   - Filter by: company (selector), authority level (select), decision-maker toggle (switch)
   - Tag filter (multi-select)
   - Clear all button

7. **Build contact form** `src/components/contacts/contact-form.tsx`
   - Fields: name*, company* (selector), email, phone, jobTitle, isDecisionMaker (checkbox), authorityLevel (select, shown when isDecisionMaker checked), notes, tags
   - Shared between create/edit

8. **Build create contact page** `src/app/(dashboard)/contacts/new/page.tsx`
   - Fetch companies + tags for selectors
   - Optional: pre-select company if navigating from company detail
   - Render ContactForm in create mode

9. **Build contact detail page** `src/app/(dashboard)/contacts/[id]/page.tsx`
   - ContactDetailCard: name, company link, job title, decision-maker badge, contact info
   - Tabs: Overview (notes, metadata), Activities (timeline), Deals (linked deals)
   - Edit + Delete actions

10. **Build edit contact page** `src/app/(dashboard)/contacts/[id]/edit/page.tsx`
    - Fetch contact + companies + tags
    - Render ContactForm in edit mode with prefilled data

11. **Wire company detail contacts tab**
    - Update `src/app/(dashboard)/companies/[id]/page.tsx` Contacts tab
    - Show list of contacts for this company
    - "Add Contact" button pre-selects company

12. **Test contact CRUD + decision-maker features**
    - Create contact with company association
    - Mark as decision-maker with authority level
    - Filter by decision-maker toggle
    - Verify cascade from company detail tab
    - Search by contact name
    - Delete contact, verify activities cascade

## Todo List
- [ ] Build company selector shared component (searchable dropdown)
- [ ] Build decision-maker badge component (authority level colors)
- [ ] Create contact Server Actions (create, update, delete)
- [ ] Build contact list page with search params
- [ ] Build contact list table with decision-maker badges
- [ ] Build contact filters (company, authority, decision-maker toggle, tags)
- [ ] Build contact form (shared create/edit with company selector)
- [ ] Build create contact page
- [ ] Build contact detail page with tabs (Activities, Deals)
- [ ] Build contact detail card component
- [ ] Build edit contact page
- [ ] Wire company detail page Contacts tab with real data
- [ ] Support pre-selecting company when creating contact from company detail
- [ ] Test: create contact linked to company
- [ ] Test: mark/unmark decision-maker with authority level
- [ ] Test: filter contacts by decision-maker toggle
- [ ] Test: search, filter, pagination
- [ ] Test: contact appears in company detail Contacts tab
- [ ] Test: delete contact cascades correctly

## Success Criteria
- Full CRUD cycle works for contacts
- Contacts correctly associated with companies
- Decision-maker flag and authority level display prominently
- "Decision Makers Only" filter works across list view
- Company detail shows associated contacts
- Contact detail shows interaction timeline and linked deals
- All data scoped to authenticated user

## Risk Assessment
- **Company selector performance**: For users with many companies, implement search-as-you-type
- **Pre-select company flow**: Pass companyId as URL param when navigating from company detail
- **Cascade delete implications**: Deleting a contact removes associated activities; warn user

## Security Considerations
- Verify companyId belongs to current user before creating contact
- Contact queries always filtered by userId
- Server Actions validate both contact ownership and associated company ownership
- No cross-user data leakage through company selector

## Next Steps
- Phase 06: Activity/Interaction Tracking (linked to contacts and companies)
- Phase 07: Deal Pipeline (linked to contacts and companies)
