# B2B MiniCRM — Implementation Plan

**Date:** 2026-01-30 | **Effort:** ~40h | **Status:** Pending

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Auth | Better Auth (email/password) |
| Styling | Tailwind CSS + shadcn/ui |
| Drag & Drop | @dnd-kit/core |
| Containerization | Docker + Docker Compose |
| Deployment | Self-hosted VPS |

---

## Project File Structure

```
minicrm_claudekit/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── companies/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/page.tsx
│   │   │   ├── contacts/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/page.tsx
│   │   │   ├── deals/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/page.tsx
│   │   │   ├── activities/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx              # Dashboard home
│   │   ├── api/auth/[...all]/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Landing/redirect
│   ├── actions/
│   │   ├── company-actions.ts
│   │   ├── contact-actions.ts
│   │   ├── deal-actions.ts
│   │   └── activity-actions.ts
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── sidebar-navigation.tsx
│   │   │   ├── header-bar.tsx
│   │   │   └── page-header.tsx
│   │   ├── forms/
│   │   │   ├── login-form.tsx
│   │   │   └── register-form.tsx
│   │   ├── companies/
│   │   │   ├── company-list-table.tsx
│   │   │   ├── company-form.tsx
│   │   │   ├── company-detail-card.tsx
│   │   │   └── company-filters.tsx
│   │   ├── contacts/
│   │   │   ├── contact-list-table.tsx
│   │   │   ├── contact-form.tsx
│   │   │   ├── contact-detail-card.tsx
│   │   │   ├── contact-filters.tsx
│   │   │   └── decision-maker-badge.tsx
│   │   ├── deals/
│   │   │   ├── deal-kanban-board.tsx
│   │   │   ├── deal-kanban-column.tsx
│   │   │   ├── deal-kanban-card.tsx
│   │   │   ├── deal-list-table.tsx
│   │   │   ├── deal-form.tsx
│   │   │   ├── deal-detail-card.tsx
│   │   │   ├── deal-filters.tsx
│   │   │   ├── deal-stage-badge.tsx
│   │   │   └── deal-view-toggle.tsx
│   │   ├── activities/
│   │   │   ├── activity-list.tsx
│   │   │   ├── activity-form.tsx
│   │   │   ├── activity-timeline.tsx
│   │   │   ├── activity-timeline-item.tsx
│   │   │   ├── activity-type-icon.tsx
│   │   │   └── activity-filters.tsx
│   │   ├── dashboard/
│   │   │   ├── metric-card.tsx
│   │   │   ├── metrics-row.tsx
│   │   │   ├── pipeline-overview-widget.tsx
│   │   │   ├── recent-activities-widget.tsx
│   │   │   ├── deals-closing-soon-widget.tsx
│   │   │   ├── activity-summary-widget.tsx
│   │   │   └── quick-actions-bar.tsx
│   │   └── shared/
│   │       ├── pagination-controls.tsx
│   │       ├── search-input.tsx
│   │       ├── tag-badge.tsx
│   │       ├── confirm-delete-dialog.tsx
│   │       ├── company-selector.tsx
│   │       ├── contact-selector.tsx
│   │       ├── deal-selector.tsx
│   │       └── date-range-picker.tsx
│   ├── lib/
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── auth.ts                   # Better Auth server config
│   │   ├── auth-client.ts            # Better Auth client config
│   │   ├── utils.ts                  # cn() helper, formatters
│   │   └── dashboard-queries.ts      # Dashboard aggregate queries
│   ├── types/
│   │   └── index.ts                  # Shared TypeScript types
│   └── middleware.ts                  # Auth route protection
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── scripts/
│   ├── docker-entrypoint.sh
│   └── backup-database.sh
├── public/
├── docs/
│   ├── product-requirements-pdr.md
│   └── deployment-guide.md
├── docker-compose.yml                # Dev
├── docker-compose.prod.yml           # Production
├── Dockerfile
├── .env.example
├── .env.production.example
├── .dockerignore
├── .gitignore
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── package.json
```

---

## Phase Dependencies

```
Phase 1 (Setup) ──► Phase 2 (Schema) ──► Phase 3 (Auth)
                                              │
                         ┌────────────────────┤
                         ▼                    ▼
                    Phase 4 (Companies)  Phase 4 (Companies)
                         │                    │
                    ┌────┴────┐          ┌────┴────┐
                    ▼         ▼          ▼         ▼
              Phase 5    Phase 5    Phase 5    Phase 5
             (Contacts) (Contacts) (Contacts) (Contacts)
                    │         │
                    ▼         ▼
              Phase 6    Phase 7
            (Activities)  (Deals)
                    │         │
                    └────┬────┘
                         ▼
                    Phase 8 (Dashboard)
                         │
                         ▼
                    Phase 9 (Docker Deploy)
```

---

## Phase 1: Project Setup & Infrastructure (4h)

- [ ] Initialize Next.js project with TypeScript + Tailwind + App Router + src dir
- [ ] Install core deps: prisma, @prisma/client, better-auth
- [ ] Initialize Prisma with PostgreSQL datasource
- [ ] Create .env.example with DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
- [ ] Create .env with local dev values (gitignored)
- [ ] Create Prisma client singleton (`src/lib/prisma.ts`)
- [ ] Configure Better Auth server (`src/lib/auth.ts`)
- [ ] Configure Better Auth client (`src/lib/auth-client.ts`)
- [ ] Create utility helpers (`src/lib/utils.ts`) — cn(), formatCurrency(), formatDate()
- [ ] Initialize shadcn/ui (`npx shadcn@latest init`)
- [ ] Create docker-compose.yml for local dev (postgres service with health check)
- [ ] Create Dockerfile with multi-stage build
- [ ] Create auth middleware (`src/middleware.ts`)
- [ ] Create root layout (`src/app/layout.tsx`) and landing page
- [ ] Verify: `docker compose up` + `npm run dev` both work
- [ ] Verify: TypeScript compiles with zero errors

## Phase 2: Database Schema & Models (4h)

- [ ] Define enums: DealStage, ActivityType, AuthorityLevel, CompanySize
- [ ] Define Better Auth tables: User, Session, Account, Verification
- [ ] Define Company model (fields, relations, indexes, JSONB metadata)
- [ ] Define Contact model (decision-maker fields, company FK, indexes)
- [ ] Define Deal model (value, stage, probability, company/contact FKs)
- [ ] Define Activity model (type, subject, date, company/contact/deal FKs)
- [ ] Define Tag model with unique [name, userId] constraint
- [ ] Define CompanyTag and ContactTag join tables
- [ ] Add GIN indexes on JSONB metadata columns (raw SQL migration)
- [ ] Create seed script (`prisma/seed.ts`) — 1 user, 5 companies, 15 contacts, 10 deals, 20 activities, 5 tags
- [ ] Add prisma seed config to package.json
- [ ] Run migration: `npx prisma migrate dev --name init`
- [ ] Run seed: `npx prisma db seed`
- [ ] Verify all tables and relations in Prisma Studio
- [ ] Export Prisma types from `src/types/index.ts`

## Phase 3: Authentication & User Management (5h)

- [ ] Create Better Auth API catch-all route (`src/app/api/auth/[...all]/route.ts`)
- [ ] Finalize Better Auth server config (Prisma adapter, email/password, session 30 days)
- [ ] Finalize Better Auth client config (useSession, signIn, signUp, signOut)
- [ ] Create auth layout (`src/app/(auth)/layout.tsx`) — centered card, redirect if authed
- [ ] Create login page (Server Component wrapper)
- [ ] Create LoginForm client component (email/password, validation, error display)
- [ ] Create register page (Server Component wrapper)
- [ ] Create RegisterForm client component (name/email/password/confirm, validation)
- [ ] Implement auth middleware (protect /dashboard/*, allow /login, /register, /api/auth)
- [ ] Create dashboard layout (`src/app/(dashboard)/layout.tsx`) — sidebar + header placeholder
- [ ] Create dashboard home placeholder (`src/app/(dashboard)/page.tsx`)
- [ ] Install shadcn/ui: button, input, label, card, form
- [ ] Test: register -> auto-login -> dashboard
- [ ] Test: logout -> redirect to login
- [ ] Test: login -> dashboard
- [ ] Test: unauthenticated /dashboard -> redirect /login
- [ ] Test: authenticated /login -> redirect /dashboard

## Phase 4: Company Management (5h)

- [ ] Build sidebar navigation component (Dashboard, Companies, Contacts, Deals, Activities)
- [ ] Build header bar component (global search, user avatar/signOut)
- [ ] Build reusable page header component (title + action buttons)
- [ ] Update dashboard layout with sidebar + header
- [ ] Build debounced search input shared component
- [ ] Build pagination controls shared component
- [ ] Build tag badge shared component
- [ ] Build confirm delete dialog shared component
- [ ] Install shadcn/ui: table, dialog, alert-dialog, badge, select, textarea, tabs, separator, dropdown-menu, avatar, sheet
- [ ] Create company Server Actions (createCompany, updateCompany, deleteCompany)
- [ ] Build company list page with URL search params (query, page, sort, filters)
- [ ] Build company list table client component (sortable columns, inline actions)
- [ ] Build company filters (industry select, size select, tag multi-select)
- [ ] Build company form (shared create/edit, tag management)
- [ ] Build create company page
- [ ] Build company detail page with tabs (Overview, Contacts, Deals, Activities)
- [ ] Build company detail card component
- [ ] Build edit company page
- [ ] Test: full CRUD cycle
- [ ] Test: search, filter, sort, pagination
- [ ] Test: detail page tabs show related entity counts

## Phase 5: Contact Management (5h)

- [ ] Build company selector shared component (searchable dropdown)
- [ ] Build decision-maker badge component (authority level color-coding)
- [ ] Create contact Server Actions (createContact, updateContact, deleteContact)
- [ ] Build contact list page with search params
- [ ] Build contact list table (decision-maker badges, company column)
- [ ] Build contact filters (company, authority level, decision-maker toggle, tags)
- [ ] Build contact form (company selector, isDecisionMaker checkbox, authorityLevel select)
- [ ] Build create contact page (support pre-select company via URL param)
- [ ] Build contact detail page with tabs (Activities, Deals)
- [ ] Build contact detail card component
- [ ] Build edit contact page
- [ ] Wire company detail Contacts tab with real data
- [ ] Test: create contact linked to company
- [ ] Test: mark/unmark decision-maker with authority level
- [ ] Test: filter by decision-maker toggle
- [ ] Test: contact appears in company detail Contacts tab

## Phase 6: Interaction & Activity Tracking (5h)

- [ ] Build activity type icon component (call/email/meeting/note -> Lucide icons)
- [ ] Build contact selector shared component (searchable)
- [ ] Build deal selector shared component (searchable)
- [ ] Build date range picker component
- [ ] Install shadcn/ui: calendar, popover
- [ ] Create activity Server Actions (createActivity, updateActivity, deleteActivity)
- [ ] Build activity form (type select, entity selectors, URL param pre-population)
- [ ] Build activity timeline component (reusable, date-grouped)
- [ ] Build activity timeline item component (type icon, subject, links, expand)
- [ ] Build global activity list page
- [ ] Build activity filters (type, date range, company, contact)
- [ ] Build create activity page with URL param support (?contactId, ?companyId, ?dealId)
- [ ] Build activity detail page
- [ ] Build edit activity page
- [ ] Wire contact detail Activities tab with timeline
- [ ] Wire company detail Activities tab with timeline
- [ ] Add "Log Activity" buttons on entity detail pages
- [ ] Test: create from global + from entity detail (pre-linked)
- [ ] Test: timeline displays on entity detail tabs
- [ ] Test: filters work (type, date range)

## Phase 7: Deal Pipeline (5h)

- [ ] Install @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- [ ] Build deal stage badge component (6 stages, color-coded)
- [ ] Build deal view toggle (Kanban/List via URL param)
- [ ] Create deal Server Actions (createDeal, updateDeal, updateDealStage, deleteDeal)
- [ ] Build deal Kanban card (draggable: name, value, company, close date)
- [ ] Build deal Kanban column (droppable: stage header with count + total value)
- [ ] Build deal Kanban board (@dnd-kit DndContext, optimistic stage update)
- [ ] Build deal list table (sortable columns, stage badges)
- [ ] Build deal filters (stage, company, value range, date range)
- [ ] Build deals page with Kanban/List toggle
- [ ] Build deal form (company selector required, contact selector optional, value, stage, probability)
- [ ] Build create deal page with URL param pre-linking
- [ ] Build deal detail page with tabs (Overview, Activities)
- [ ] Build deal detail card component
- [ ] Build edit deal page
- [ ] Wire contact detail Deals tab
- [ ] Wire company detail Deals tab
- [ ] Test: drag deal between Kanban stages -> persists
- [ ] Test: column headers show count + total value
- [ ] Test: Kanban/List toggle preserves filter state

## Phase 8: Dashboard & Reporting (4h)

- [ ] Create dashboard aggregate queries (`src/lib/dashboard-queries.ts`)
  - [ ] getKeyMetrics: count companies, contacts, open deals, sum pipeline value
  - [ ] getPipelineOverview: groupBy stage -> count + sum value
  - [ ] getRecentActivities: last 10 with relations
  - [ ] getDealsClosingSoon: next 30 days, open stages only
  - [ ] getActivitySummary: count by type, this week + this month
- [ ] Build metric card component (label, value, icon)
- [ ] Build metrics row (4 cards grid: companies, contacts, deals, pipeline value)
- [ ] Build pipeline overview widget (stage table with value bars)
- [ ] Build recent activities widget (type icons, subject, entity links, date)
- [ ] Build deals closing soon widget (color-coded urgency)
- [ ] Build activity summary widget (type counts: week + month)
- [ ] Build quick actions bar (New Company, Contact, Deal, Activity)
- [ ] Assemble dashboard page with CSS Grid layout
- [ ] Test: metrics match database counts
- [ ] Test: pipeline groups deals correctly
- [ ] Test: recent activities ordered newest-first
- [ ] Test: deals closing soon only shows open deals within 30 days
- [ ] Test: dashboard loads < 3s with seeded data

## Phase 9: Docker Deployment (3h)

- [ ] Add `output: "standalone"` to next.config.ts
- [ ] Create .dockerignore (exclude node_modules, .next, .git, docs, plans)
- [ ] Create multi-stage Dockerfile (deps -> builder -> runner on node:20-alpine)
- [ ] Create docker-entrypoint.sh (wait for DB -> prisma migrate deploy -> node server.js)
- [ ] Create docker-compose.prod.yml (postgres with health check, app with depends_on)
- [ ] Update docker-compose.yml (dev) with postgres health check
- [ ] Create .env.production.example template
- [ ] Create backup-database.sh (pg_dump with rotation)
- [ ] Create docs/deployment-guide.md (VPS setup, env config, build, start, backup cron)
- [ ] Test: `docker compose -f docker-compose.prod.yml build` succeeds
- [ ] Test: `docker compose -f docker-compose.prod.yml up -d` starts both services
- [ ] Test: app accessible at localhost:3000
- [ ] Test: health checks pass (docker compose ps shows healthy)
- [ ] Test: data persists across container restart
- [ ] Test: backup script produces valid compressed dump

---

## Key Architecture Decisions

1. **Server Components default** — Data fetching via Prisma in Server Components; Client Components only for interactive UI (forms, Kanban, dropdowns)
2. **Server Actions for mutations** — No REST API layer; forms submit directly to Server Actions
3. **Prisma singleton** — Prevents connection pool exhaustion in dev/serverless
4. **Better Auth over NextAuth** — TypeScript-first, cleaner Docker integration, better credential auth
5. **JSONB metadata columns** — Flexible custom fields without schema migrations
6. **URL search params for state** — Filter/sort/page state in URL for shareable, bookmarkable views
7. **User data isolation** — Every query includes `where: { userId }` filter
8. **@dnd-kit for Kanban** — Accessible, tree-shakeable drag-and-drop library
9. **Multi-stage Docker build** — Minimal production image with standalone Next.js output

---

## Detailed Plan Files

See `plans/260130-2354-b2b-minicrm-relationship-management/` for detailed phase files:
- [plan.md](plans/260130-2354-b2b-minicrm-relationship-management/plan.md) — Overview
- [phase-01](plans/260130-2354-b2b-minicrm-relationship-management/phase-01-project-setup-and-infrastructure.md) — Setup
- [phase-02](plans/260130-2354-b2b-minicrm-relationship-management/phase-02-database-schema-and-models.md) — Schema
- [phase-03](plans/260130-2354-b2b-minicrm-relationship-management/phase-03-authentication-and-user-management.md) — Auth
- [phase-04](plans/260130-2354-b2b-minicrm-relationship-management/phase-04-company-management.md) — Companies
- [phase-05](plans/260130-2354-b2b-minicrm-relationship-management/phase-05-contact-management.md) — Contacts
- [phase-06](plans/260130-2354-b2b-minicrm-relationship-management/phase-06-interaction-and-activity-tracking.md) — Activities
- [phase-07](plans/260130-2354-b2b-minicrm-relationship-management/phase-07-deal-pipeline.md) — Deals
- [phase-08](plans/260130-2354-b2b-minicrm-relationship-management/phase-08-dashboard-and-reporting.md) — Dashboard
- [phase-09](plans/260130-2354-b2b-minicrm-relationship-management/phase-09-docker-deployment.md) — Docker
