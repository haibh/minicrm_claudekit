# Phase 04: Company Management

## Context Links
- [Plan Overview](./plan.md)
- [PRD — Company Features](../../docs/product-requirements-pdr.md#31-company-management)
- Depends on: [Phase 02](./phase-02-database-schema-and-models.md), [Phase 03](./phase-03-authentication-and-user-management.md)

## Overview
- **Date:** 2026-01-30
- **Priority:** P1
- **Description:** Full CRUD for companies with list view (search, sort, filter, pagination), detail view (associated contacts/deals/activities tabs), create/edit forms, and tag management.
- **Implementation Status:** Pending
- **Review Status:** Not started
- **Effort:** 5h

## Key Insights
- Company is the primary entity; contacts, deals, activities all reference it
- Server Components fetch company list/detail data via Prisma
- Server Actions handle create/update/delete mutations
- List view uses URL search params for filter/sort/page state (shareable URLs)
- Detail view uses tabbed layout showing related entities
- Tags use many-to-many via CompanyTag join table

## Requirements

### Functional
- Create company with all fields (name required, others optional)
- Edit company (all fields)
- Delete company (soft consideration; hard delete for MVP with cascade)
- List view: paginated table (20/page), sortable columns, search by name
- Filter by industry, size, tags
- Detail view: company info card + tabs (Contacts, Deals, Activities)
- Add/remove tags on company
- Count badges on tabs showing related entity counts

### Non-Functional
- List loads < 1s for 500 companies
- Search debounced at 300ms
- Pagination via cursor or offset (offset for simplicity in MVP)

## Architecture

### Server Actions Pattern
```
src/actions/company-actions.ts
  - createCompany(formData) -> redirect to detail
  - updateCompany(id, formData) -> revalidatePath
  - deleteCompany(id) -> redirect to list
```

### Page Structure
```
src/app/(dashboard)/companies/
  ├── page.tsx              # Company list (Server Component)
  ├── new/
  │   └── page.tsx          # Create company page
  └── [id]/
      ├── page.tsx          # Company detail (Server Component)
      └── edit/
          └── page.tsx      # Edit company page
```

## Related Code Files

### Files to Create
- `src/actions/company-actions.ts` — Server Actions for company CRUD
- `src/app/(dashboard)/companies/page.tsx` — Company list page
- `src/app/(dashboard)/companies/new/page.tsx` — Create company page
- `src/app/(dashboard)/companies/[id]/page.tsx` — Company detail page
- `src/app/(dashboard)/companies/[id]/edit/page.tsx` — Edit company page
- `src/components/companies/company-list-table.tsx` — Company table Client Component
- `src/components/companies/company-form.tsx` — Create/edit form Client Component
- `src/components/companies/company-detail-card.tsx` — Company info header card
- `src/components/companies/company-filters.tsx` — Filter sidebar/toolbar
- `src/components/layout/sidebar-navigation.tsx` — Sidebar nav (shared)
- `src/components/layout/header-bar.tsx` — Top header bar (shared)
- `src/components/layout/page-header.tsx` — Reusable page title + actions bar
- `src/components/shared/pagination-controls.tsx` — Reusable pagination
- `src/components/shared/search-input.tsx` — Debounced search input
- `src/components/shared/tag-badge.tsx` — Tag display component
- `src/components/shared/confirm-delete-dialog.tsx` — Delete confirmation modal

### Files to Modify
- `src/app/(dashboard)/layout.tsx` — Add real sidebar and header

## Implementation Steps

1. **Build shared layout components first**
   - `src/components/layout/sidebar-navigation.tsx` — Links: Dashboard, Companies, Contacts, Deals, Activities. Highlight active route. Collapsible on mobile.
   - `src/components/layout/header-bar.tsx` — Global search input + user avatar dropdown (signOut)
   - `src/components/layout/page-header.tsx` — Title, description, action buttons (e.g., "New Company")
   - Update `src/app/(dashboard)/layout.tsx` to use sidebar + header

2. **Build shared UI components**
   - `src/components/shared/search-input.tsx` — Debounced input (300ms) that updates URL params
   - `src/components/shared/pagination-controls.tsx` — Page prev/next + page info
   - `src/components/shared/tag-badge.tsx` — Colored tag pill
   - `src/components/shared/confirm-delete-dialog.tsx` — AlertDialog with confirm/cancel
   - Install shadcn/ui: `npx shadcn@latest add table dialog alert-dialog badge select textarea tabs separator dropdown-menu avatar sheet`

3. **Create Server Actions** `src/actions/company-actions.ts`
   - `createCompany(formData: FormData)` — Validate, create via Prisma, handle tags, redirect
   - `updateCompany(id: string, formData: FormData)` — Validate, update, revalidatePath
   - `deleteCompany(id: string)` — Delete with cascading, redirect to list
   - All actions: get userId from session, scope queries

4. **Build company list page** `src/app/(dashboard)/companies/page.tsx`
   - Server Component; read searchParams for query, page, sort, filters
   - Fetch companies with Prisma: include tag count, contact count
   - Pass data to CompanyListTable client component
   - Render PageHeader with "New Company" button

5. **Build CompanyListTable** `src/components/companies/company-list-table.tsx`
   - Client Component for sort interactions
   - Columns: Name, Industry, Size, Contacts (count), Deals (count), Tags, Created
   - Row click navigates to detail page
   - Inline delete action with confirmation

6. **Build CompanyFilters** `src/components/companies/company-filters.tsx`
   - Client Component updating URL searchParams
   - Filter by: industry (select), size (select), tag (multi-select)
   - Clear filters button

7. **Build company form** `src/components/companies/company-form.tsx`
   - Client Component; shared between create and edit
   - Fields: name*, industry, size (select), website, phone, email, address (textarea), notes (textarea)
   - Tag selection (existing tags + create new)
   - Client-side validation (name required)
   - Submit via Server Action

8. **Build create company page** `src/app/(dashboard)/companies/new/page.tsx`
   - Server Component; fetch tags for tag selector
   - Render CompanyForm in create mode

9. **Build company detail page** `src/app/(dashboard)/companies/[id]/page.tsx`
   - Server Component; fetch company with relations
   - CompanyDetailCard at top (name, industry, size, contact info, tags)
   - Tabs: Overview, Contacts (count), Deals (count), Activities (count)
   - Edit + Delete buttons in page header

10. **Build edit company page** `src/app/(dashboard)/companies/[id]/edit/page.tsx`
    - Server Component; fetch company data
    - Render CompanyForm in edit mode with prefilled values

11. **Test company CRUD flow**
    - Create -> appears in list
    - Edit -> changes reflected
    - Delete -> removed from list
    - Search by name works
    - Filter by industry works
    - Pagination navigates correctly

## Todo List
- [ ] Build sidebar navigation component
- [ ] Build header bar component with user menu
- [ ] Build reusable page header component
- [ ] Update dashboard layout with real sidebar + header
- [ ] Build debounced search input component
- [ ] Build pagination controls component
- [ ] Build tag badge component
- [ ] Build confirm delete dialog component
- [ ] Install required shadcn/ui components (table, dialog, badge, select, tabs, etc.)
- [ ] Create company Server Actions (create, update, delete)
- [ ] Build company list page with search params handling
- [ ] Build company list table client component
- [ ] Build company filters component
- [ ] Build company form component (shared create/edit)
- [ ] Build create company page
- [ ] Build company detail page with tabs
- [ ] Build company detail card component
- [ ] Build edit company page
- [ ] Test: create company -> appears in list
- [ ] Test: edit company -> changes reflected
- [ ] Test: delete company -> removed with confirmation
- [ ] Test: search, filter, sort, pagination all work
- [ ] Test: detail page tabs show correct related counts

## Success Criteria
- Full CRUD cycle works for companies
- List view displays, searches, filters, sorts, paginates correctly
- Detail page shows associated contacts, deals, activities in tabs
- Tags can be added/removed from companies
- All data scoped to authenticated user
- Page loads < 1s with 100 companies
- No TypeScript errors

## Risk Assessment
- **Many shared components**: Build layout/shared components first to avoid duplication in later phases
- **URL search params complexity**: Use utility function to build/parse search params consistently
- **Cascade delete safety**: Warn user about deleting company with associated data
- **Tag management UX**: Keep simple for MVP (select existing, type to create)

## Security Considerations
- All Prisma queries include `where: { userId }` filter
- Server Actions validate session before any mutation
- Form inputs sanitized (Prisma parameterized queries handle SQL injection)
- Company ID in URL validated as valid UUID before query

## Next Steps
- Phase 05: Contact Management (reuses many shared components from this phase)
- Phase 06: Activity Tracking (linked to companies)
