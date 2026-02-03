# MiniCRM Codebase Summary

**Last Updated:** 2026-02-02 | **Version:** 1.1

---

## Directory Structure

```
minicrm_claudekit/
├── prisma/
│   ├── schema.prisma           # Prisma ORM schema (252 lines)
│   ├── seed.ts                 # DB seeder with fake data (726 lines)
│   └── migrations/             # Prisma auto-migrations
├── src/
│   ├── generated/prisma/       # Auto-generated Prisma client types
│   ├── app/                    # Next.js App Router
│   ├── actions/                # Server Actions (company, contact, deal, activity)
│   ├── components/             # React components (~58 files)
│   ├── lib/                    # Utilities (auth, prisma, queries, utils, shared modules)
│   ├── types/                  # TypeScript type definitions
│   ├── middleware.ts           # Route protection middleware (72 LOC)
│   └── __tests__/              # Unit tests (6 test files, 67 tests)
├── e2e/                        # Playwright E2E tests (6 spec files, 60 tests)
├── docs/                       # Documentation (this folder)
├── scripts/                    # Utility scripts
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

## File Inventory by Module

### Database Layer (Prisma)

| File | Lines | Purpose |
|------|-------|---------|
| `prisma/schema.prisma` | 252 | Database schema: 8 models (User, Company, Contact, Deal, Activity, Tag, CompanyTag, ContactTag), 4 enums |
| `prisma/seed.ts` | 726 | Populates test data: 50 companies, 150 contacts, 100 deals, 200 activities |
| `src/lib/prisma.ts` | 29 | Singleton Prisma client with DATABASE_URL validation, JSDoc |

**Data Models:**
- **User** (Better Auth): id, name, email, emailVerified, image, timestamps; relations to sessions, accounts, companies, contacts, deals, activities, tags
- **Company**: name, industry, size (enum), website, phone, email, address, notes, metadata (JSONB), userId; relations to contacts, deals, activities, tags
- **Contact**: name, email, phone, jobTitle, isDecisionMaker, authorityLevel (enum), notes, metadata (JSONB), companyId, userId; relations to company, deals, activities
- **Deal**: name, value (Decimal), stage (enum), probability, expectedCloseDate, notes, metadata (JSONB), companyId, contactId, userId; relations to company, contact, activities
- **Activity**: type (enum), subject, description, date, durationMinutes, outcome, nextSteps, companyId, contactId, dealId, userId
- **Tag/CompanyTag/ContactTag**: Many-to-many tagging system

**Enums:**
- `DealStage`: prospecting, qualification, proposal, negotiation, closed_won, closed_lost
- `ActivityType`: call, email, meeting, note
- `AuthorityLevel`: primary, secondary, influencer
- `CompanySize`: tiny_1_10, small_11_50, medium_51_200, large_201_500, enterprise_500_plus

---

### Server Actions (src/actions/)

| File | Lines | Functions | Purpose |
|------|-------|-----------|---------|
| `company-actions.ts` | 152 | createCompany, updateCompany, deleteCompany, getCompanies, getCompanyById | CRUD + queries |
| `contact-actions.ts` | 186 | createContact, updateContact, deleteContact, getContacts, getContactById | CRUD + queries + filtering |
| `deal-actions.ts` | 196 | createDeal, updateDeal, changeDealStage, getDealsByStage, getDeals | CRUD + stage transitions |
| `activity-actions.ts` | 154 | createActivity, updateActivity, deleteActivity, getActivities, getActivitiesByEntity | CRUD + timeline queries |

**Pattern:** All server actions use Prisma queries, scoped by `userId` for data isolation, try-catch with NEXT_REDIRECT re-throw, JSDoc comments, standardized `redirect("/login")` for auth failures, revalidatePath calls.

---

### Components Library (src/components/) — ~58 files

| Module | Components | Files | Purpose |
|--------|------------|-------|---------|
| `activities/` | ActivityForm (199 LOC), ActivityTimeline, ActivityTypeFilter, ActivityRelatedEntityFields (76 LOC) | 5 | Activity logging, timeline display, entity selectors |
| `companies/` | CompanyForm, CompanyDetailCard, CompanyListTable | 3 | Company CRUD, list, detail views |
| `contacts/` | ContactForm (171 LOC), ContactDetailCard, ContactListTable, ContactSelector, ContactDecisionMakerFields (66 LOC) | 5 | Contact CRUD, decision-maker display, authority selector |
| `deals/` | DealForm (222 LOC), DealDetailCard, DealListTable (103 LOC, shadcn Table), DealKanbanBoard, DealKanbanColumn, DealKanbanCard, DealStageBadge, DealEntitySelectors (78 LOC) | 9 | Deal CRUD, kanban board, stage badges, entity selectors |
| `dashboard/` | DashboardHeader, MetricsRow, QuickActionsBar, PipelineOverviewWidget, RecentActivitiesWidget, DealsClosingSoonWidget, ActivitySummaryWidget, TopContactsWidget | 8 | Dashboard widgets & metrics |
| `forms/` | LoginForm, RegisterForm | 2 | Authentication forms |
| `layout/` | Sidebar, DashboardLayout | 1 | Layout components |
| `shared/` | CompanySelector, ContactSelector, DealSelector, SearchInput, PaginationControls, ConfirmDeleteDialog, PageHeader | 7 | Reusable form & interaction components |
| `ui/` | shadcn/ui primitives (Button, Card, Dialog, Select, Table, Tabs, etc.) | 16 | Radix UI wrapper components |

**Tech:** React 19, TypeScript, Server Components (RSC) where possible, Tailwind CSS + Radix UI.

---

### Routes & Pages (src/app/)

| Path | Type | Purpose |
|------|------|---------|
| `/` | Redirect | → `/dashboard` |
| `/dashboard` | Page | Dashboard home (with sidebar layout) |
| `/login` | Page | Auth: email/password login |
| `/register` | Page | Auth: user registration |
| `/companies` | Page | Company list (search, filter, pagination) |
| `/companies/new` | Page | Create company form |
| `/companies/[id]` | Page | Company detail view + related contacts/deals/activities |
| `/companies/[id]/edit` | Page | Edit company |
| `/contacts` | Page | Contact list + decision-maker filter |
| `/contacts/new` | Page | Create contact (company selector) |
| `/contacts/[id]` | Page | Contact detail + activity timeline |
| `/contacts/[id]/edit` | Page | Edit contact |
| `/deals` | Page | Deal kanban board + toggle list view |
| `/deals/new` | Page | Create deal (company/contact selectors) |
| `/deals/[id]` | Page | Deal detail (linked company, contact, activities) |
| `/deals/[id]/edit` | Page | Edit deal |
| `/activities` | Page | Activity timeline (all users' activities) |
| `/activities/new` | Page | Log activity (company/contact/deal selectors) |
| `/activities/[id]` | Page | Activity detail |
| `/activities/[id]/edit` | Page | Edit activity |
| `/api/auth/[...all]` | API | Better Auth API routes (login, register, session) |

**Layout Groups:**
- `(auth)` — Public login/register pages
- `(dashboard)` — Protected pages with sidebar + header layout

---

### Authentication & Middleware

| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/auth.ts` | ~50 | Better Auth server config (email/password strategy, session settings) |
| `src/lib/auth-client.ts` | ~30 | Better Auth client-side hook & utilities |
| `src/middleware.ts` | 72 | Route protection with Set-based route matching, security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), JSDoc |

**Flow:** Register → Login → Session cookie → Middleware validates → Access protected routes.

---

### Utilities & Queries

| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/dashboard-queries.ts` | 181 | Aggregation queries: metrics (company/contact/deal counts), pipeline value, deals closing soon, recent activities, activity summary |
| `src/lib/utils.ts` | ~60 | Helpers: cn (class merge), formatCurrency, formatDate, etc. |
| `src/lib/tag-utils.ts` | 40 | Shared tag utilities: parseTagNames, upsertUserTags, parseAndUpsertTags (DRY extraction from company/contact actions) |
| `src/lib/format-display-utils.ts` | 50 | Shared display formatters: formatCompanySize, formatCompanySizeShort, formatAuthorityLevel (DRY extraction from detail cards/list tables) |
| `src/types/index.ts` | ~80 | TypeScript types: form inputs, API responses, component props |

---

## Test Coverage

### Unit Tests (Vitest) — 67 tests across 6 files

| File | Tests | Scope |
|------|-------|-------|
| `company-actions.test.ts` | 11 | Create, update, delete, get (single/all) companies |
| `contact-actions.test.ts` | 12 | Create, update, delete, get contacts; filters by decision-maker/company |
| `deal-actions.test.ts` | 10 | Create, update, delete deals; stage transitions; pipeline queries |
| `activity-actions.test.ts` | 11 | Create, update, delete activities; queries by type/entity |
| `dashboard-queries.test.ts` | 14 | Metrics, pipeline overview, deals closing soon, activity summary |
| `utils.test.ts` | 9 | Currency formatting, date formatting, misc utilities |

**Approach:** Mock Prisma, test business logic isolation.

### E2E Tests (Playwright) — 60 tests (56 pass, 4 skipped)

| Spec File | Tests | Scenarios |
|-----------|-------|-----------|
| `auth-flows.spec.ts` | 12 | Register, login, logout, session persistence, protected route redirect |
| `company-crud.spec.ts` | 10 | Create, read, update, delete, search, filter by size, pagination (1 skipped: bulk data) |
| `contact-crud-operations.spec.ts` | 10 | Create, read, update, delete, decision-maker flag, authority level, company linking |
| `deal-pipeline-management.spec.ts` | 12 | Create, read, update, delete, kanban drag-drop (1 skipped), stage transitions, value calc (2 skipped) |
| `activity-tracking-timeline.spec.ts` | 8 | Create, read, update, delete, timeline display, type filtering |
| `dashboard-widgets-metrics.spec.ts` | 8 | Metrics card display, pipeline overview, recent activities, quick actions |

**Skipped Tests:**
- TC-CO09: Pagination with bulk data (>1000 records required)
- TC-DL10: Playwright drag-drop limitation (dnd-kit not testable via Playwright)
- TC-DB06, TC-DB07: Require specific setup (deals closing soon, activity summary)

---

## Technology Stack

**Frontend:**
- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS, Radix UI (shadcn/ui), Lucide React (icons)
- @dnd-kit/core, @dnd-kit/sortable (kanban drag-drop)
- date-fns (date utilities), class-variance-authority, clsx, tailwind-merge

**Backend:**
- Next.js Server Actions, API Routes
- Better Auth (email/password auth)
- Prisma ORM (@prisma/client)
- PostgreSQL (src/generated/prisma generated types)

**Testing:**
- Vitest (unit tests)
- Playwright (E2E tests)
- @testing-library/react, jsdom

**DevTools:**
- TypeScript, ESLint
- Docker, Docker Compose
- tsx (TypeScript runner)
- @faker-js/faker (test data)

---

## Key Patterns

### Server Component Hierarchy
- Layout → Page containers render as Server Components
- Fetch data server-side in page.tsx, pass to client components
- Minimize client-side state (prefer Server Actions)

### Form Handling
- Use Radix UI select, dialog, etc. for form UI
- Server Actions validate & persist data
- Toast/error messages via client-side handlers

### Data Isolation
- All queries filtered by `userId` (from session)
- Middleware ensures authenticated access
- Cascading deletes maintain referential integrity

### Kanban Board
- @dnd-kit for drag-drop
- Update deal.stage via server action on drop
- Columns render deals filtered by stage

---

## File Size Compliance

- **All action files <200 LOC:** Modular business logic
- **Component files <100 LOC:** Single-responsibility components
- **Pages <100 LOC:** Composition of smaller components
- **Test files <200 LOC:** Focused test scenarios per module

