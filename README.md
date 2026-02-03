# MiniCRM — Self-Hosted B2B CRM

A lightweight, open-source B2B CRM for managing business relationships, contacts, deals, and activities. Deploy on your own VPS in minutes.

**Status:** Phase 1 Complete + Optimized | **Tests:** 67 unit + 60 E2E | **Docker Ready:** Yes

---

## Features

### Core Management
- **Companies** — CRUD, search, filter by industry/size, tags, detail view with related contacts/deals
- **Contacts** — Link to companies, mark decision-makers, track authority levels (primary/secondary/influencer)
- **Deal Pipeline** — Kanban board (drag-drop stages), list view, pipeline metrics, closing soon alerts
- **Activities** — Log calls/emails/meetings/notes, timeline view, type filtering, link to entities

### Dashboard
- **Metrics** — Company/contact/deal counts, total pipeline value
- **Pipeline Overview** — Deal count and value per stage
- **Recent Activities** — Last 10 activities with timestamps
- **Deals Closing Soon** — Upcoming closes (next 30 days, color-coded by urgency)
- **Activity Summary** — Weekly breakdown by type

### Security & Performance
- Email/password authentication (Better Auth)
- User data isolation (userId-scoped queries)
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Optimized package imports (lucide-react)
- Component modularization (DRY patterns, shared utilities)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS, Radix UI (shadcn/ui) |
| **Backend** | Next.js Server Actions, API Routes |
| **Database** | PostgreSQL, Prisma ORM |
| **Auth** | Better Auth (email/password) |
| **Testing** | Vitest (unit), Playwright (E2E) |
| **Deployment** | Docker, Docker Compose |

---

## Quick Start

### Development Setup

```bash
# 1. Clone & install
git clone <repo-url>
cd minicrm_claudekit
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your database URL

# 3. Database setup
npx prisma migrate dev
npm run db:seed  # Optional test data

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → Register → Use app.

### Docker Deployment

```bash
# 1. Configure
cp .env.production.example .env.production
nano .env.production  # Set DB_PASSWORD, BETTER_AUTH_SECRET

# 2. Deploy
docker compose up -d

# 3. Verify
curl http://localhost:3000
```

See [Deployment Guide](./docs/deployment-guide.md) for details.

---

## Project Structure

```
minicrm_claudekit/
├── src/
│   ├── app/                # Next.js pages, layouts, API routes
│   ├── actions/            # Server Actions (4 files: CRUD logic)
│   ├── components/         # React components (~58 files)
│   ├── lib/                # Utilities (7 files: auth, prisma, queries, tag-utils, format-utils)
│   ├── middleware.ts       # Route protection + security headers (72 LOC)
│   └── __tests__/          # Unit tests (67 tests, 100% pass)
├── prisma/
│   ├── schema.prisma       # Database schema (8 models, 4 enums)
│   └── seed.ts             # Test data seeder
├── e2e/                    # Playwright E2E tests (60 tests, 93% pass)
└── docs/                   # Documentation (8 files)
```

---

## Testing

### Unit Tests (Vitest)
```bash
npm run test              # Run once
npm run test:coverage     # With coverage
npm run test:unit:watch   # Watch mode
```

**Coverage:** 67 tests, 100% pass, 1.2s execution.

### E2E Tests (Playwright)
```bash
npm run test:e2e          # Headless
npm run test:e2e:ui       # Interactive UI mode
```

**Coverage:** 60 tests, 56 pass, 4 intentionally skipped (93% pass rate).

---

## Development

### Useful Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (localhost:3000) |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run db:seed` | Seed test data |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset database |
| `npm run type-check` | TypeScript check |

### Code Standards

- **Naming:** kebab-case for files, PascalCase for components
- **File Size:** Max 200 LOC for actions, max 100 LOC for components
- **TypeScript:** Explicit types (no implicit `any`)
- **Error Handling:** Try-catch with `isRedirectError()` check
- **Data Isolation:** All queries filter by `userId`

See [Code Standards](./docs/code-standards.md) for full guidelines.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [Product Requirements (PRD)](./docs/product-requirements-pdr.md) | Features, user stories, success metrics |
| [Codebase Summary](./docs/codebase-summary.md) | File inventory, module overview, test coverage |
| [Code Standards](./docs/code-standards.md) | Naming conventions, patterns, best practices |
| [System Architecture](./docs/system-architecture.md) | Auth flow, data flow, component hierarchy |
| [Design Guidelines](./docs/design-guidelines.md) | UI components, Tailwind CSS, accessibility |
| [Project Roadmap](./docs/project-roadmap.md) | Phases 1-5, future features, timeline |
| [Deployment Guide](./docs/deployment-guide.md) | Docker setup, env config, backups |
| [Testing Guide](./docs/testing-guide.md) | Unit and E2E test patterns, troubleshooting |

---

## Configuration

### Environment Variables

**Development (.env.local):**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/minicrm_dev
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
BETTER_AUTH_URL=http://localhost:3000
NODE_ENV=development
```

**Production (.env.production):**
```env
DATABASE_URL=postgresql://minicrm:strong-password@postgres:5432/minicrm
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
BETTER_AUTH_URL=https://crm.yourdomain.com
NODE_ENV=production
```

Generate secrets:
```bash
openssl rand -base64 32
```

---

## Architecture

**Server-Side Rendering (SSR)** with **Server Actions** for mutations:

1. User requests page → Next.js Server Component fetches data
2. Data passed to Client Components for interactivity
3. User action (create/edit) → Server Action executes
4. Prisma updates database (userId scope for security)
5. Client receives response, updates UI, shows toast

See [System Architecture](./docs/system-architecture.md) for detailed flows.

---

## Phase 1 Optimization (2026-02-02)

**What Changed:**
- **DRY Server Actions:** Extracted shared utilities (tag-utils, format-display-utils)
- **Component Modularization:** Split large forms into sub-components (76-78 LOC each)
- **Security Headers:** Middleware adds X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Error Handling:** Standardized try-catch with NEXT_REDIRECT re-throw, `redirect("/login")` pattern
- **Config Hardening:** `poweredByHeader: false`, `reactStrictMode: true`, optimizePackageImports
- **Table Standardization:** All list views use shadcn Table component (deal-list-table: 103 LOC)
- **Documentation:** JSDoc comments on all server actions

**Files Modified:**
- Server actions: 4 files (152-196 LOC each)
- Components: 8 files (added 4 new sub-components)
- Lib utilities: 7 files (added 2 new shared modules)
- Middleware: 72 LOC (from 40 LOC)
- Config: next.config.ts, package.json scripts

---

## Roadmap

| Phase | Status | Features |
|-------|--------|----------|
| **Phase 1** | ✓ Complete + Optimized | CRUD, Dashboard, Auth, Tests, Docker, Code optimization |
| **Phase 2** | Planned (Q2 2026) | Import/Export CSV, Advanced Search, Reporting |
| **Phase 3** | Planned (Q3 2026) | Multi-user Teams, Collaboration |
| **Phase 4** | Planned (Q4 2026) | Performance, Webhooks, REST API |
| **Phase 5** | Planned (2027) | Mobile responsive, Dark Mode, i18n, AI features |

See [Project Roadmap](./docs/project-roadmap.md) for detailed timeline.

---

## Security

- **Data Isolation:** All queries filtered by authenticated `userId`
- **Authentication:** Better Auth handles session management & CSRF
- **Input Validation:** Form validation + Prisma parameterized queries
- **Secrets:** Store in `.env`, never commit sensitive data
- **Security Headers:** Middleware adds X-Frame-Options, X-Content-Type-Options, etc.
- **HTTPS:** Recommended via reverse proxy (nginx, Traefik)

---

## Contributing

1. Read [Code Standards](./docs/code-standards.md)
2. Create feature branch: `git checkout -b feat/your-feature`
3. Write tests for new features
4. Run `npm run lint && npm run test && npm run test:e2e`
5. Commit: `git commit -m "feat(scope): description"`
6. Push and create PR

---

## FAQ

**Q: Can I self-host on my VPS?**
A: Yes! Docker Compose deploys in < 10 minutes on any VPS with Docker.

**Q: Is my data secure?**
A: Yes. Data isolated by userId, passwords hashed via Better Auth, HTTPS recommended via reverse proxy.

**Q: Can multiple people use it?**
A: Phase 1 is single-user. Phase 3 adds multi-user teams with roles and workspaces.

**Q: How many records can it handle?**
A: PostgreSQL easily handles 100K+ records. Optimized for 50-500 relationships initially.

**Q: Is there a managed hosting option?**
A: Not yet. Self-host via Docker or use any VPS provider (DigitalOcean, Linode, AWS EC2).

---

## License

MIT License — Use freely for personal and commercial purposes.

---

**Built with Next.js 15 + React 19 + PostgreSQL. Simple. Fast. Self-hosted.**
