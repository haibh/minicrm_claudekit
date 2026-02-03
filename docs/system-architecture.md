# System Architecture

**Version:** 1.1 | **Updated:** 2026-02-02

---

## Architecture Overview

MiniCRM is a **Next.js 15 full-stack application** with server-side rendering, server actions for mutations, and PostgreSQL as the persistent store.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
│  React Components (Server & Client) + Radix UI + Tailwind   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
┌─────────────────────────▼────────────────────────────────────┐
│                   Next.js Server (App Router)                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Route Handlers & Server Actions                        │  │
│  │ - /api/auth/* (Better Auth)                            │  │
│  │ - Server Actions (company/contact/deal/activity)       │  │
│  │ - Page Rendering (SSR)                                 │  │
│  └────────────────────────┬───────────────────────────────┘  │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │ Middleware (72 LOC)                                    │  │
│  │ - Session validation (Set-based route matching)        │  │
│  │ - Route protection (/dashboard, /companies, etc.)      │  │
│  │ - Security headers (X-Frame, X-Content-Type, etc.)     │  │
│  └────────────────────────┬───────────────────────────────┘  │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │ Business Logic Layer                                   │  │
│  │ - Server Actions (src/actions/)                        │  │
│  │ - Shared Utilities (src/lib/tag-utils, format-utils)  │  │
│  │ - Dashboard Queries (src/lib/dashboard-queries.ts)     │  │
│  │ - Auth Client (Better Auth)                            │  │
│  └────────────────────────┬───────────────────────────────┘  │
└─────────────────────────┬────────────────────────────────────┘
                         │ Prisma ORM
┌────────────────────────▼────────────────────────────────────┐
│                 PostgreSQL Database                         │
│  - User, Company, Contact, Deal, Activity, Tag              │
│  - Session, Account, Verification (Better Auth)             │
│  - Indexes on userId, name, stage, date, etc.               │
└────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

### Setup

1. **Better Auth Configuration** (`src/lib/auth.ts`)
   - Strategy: email/password
   - Session storage: Database (Session table)
   - Cookie: HTTP-only, secure, 30-day expiry
   - Secret: BETTER_AUTH_SECRET env var

2. **Routes**
   - `/login` — Email + password form
   - `/register` — Create new account
   - `/api/auth/[...all]` — Better Auth API (login, register, logout)

### Register Flow

```
User fills /register form
    ↓
POST /api/auth/register (Better Auth)
    ↓
Create User + Account record (hashed password)
    ↓
Set session cookie (HTTP-only)
    ↓
Redirect to /dashboard
```

### Login Flow

```
User fills /login form
    ↓
POST /api/auth/login (Better Auth)
    ↓
Verify email + password against Account.password
    ↓
Create Session record
    ↓
Set session cookie
    ↓
Redirect to /dashboard
```

### Session Validation (Middleware)

```
Incoming request to /dashboard, /companies, etc.
    ↓
src/middleware.ts checks session cookie
    ↓
Better Auth validates session
    ↓
Valid? → Load page | Invalid? → Redirect to /login
```

### Protected Route Guard

```
Page component calls getSession()
    ↓
Better Auth client reads session cookie
    ↓
Server-side: session.user?.id available for queries
    ↓
All queries scoped to userId (data isolation)
```

---

## Data Flow: Request → Response

### Example: Create Company

```
Client Form Submission
    ↓ (POST)
CompanyForm.tsx calls createCompany(formData)
    ↓
src/actions/company-actions.ts (Server Action)
    ├─ Verify session.user.id
    ├─ Validate form data (name required, trim)
    ├─ Call prisma.company.create({
    │   data: { name, industry, size, userId }
    │ })
    ├─ Handle errors (duplicate, DB constraints)
    └─ Return { success: true, company } or throw
    ↓
Client catches response
    ├─ Success → show toast, redirect to /companies/[id]
    └─ Error → show error toast
```

### Example: Fetch Companies List

```
User navigates to /companies
    ↓
src/app/(dashboard)/companies/page.tsx (Server Component)
    ├─ Call getSession() → session.user.id
    ├─ Call getCompanies(userId)
    │   (from src/actions/company-actions.ts)
    │   └─ prisma.company.findMany({
    │       where: { userId },
    │       orderBy: { createdAt: 'desc' },
    │       take: 20
    │     })
    └─ Pass companies to CompanyListTable
    ↓
CompanyListTable (Client Component)
    ├─ Render table rows with companies
    ├─ Handle clicks (edit, delete, detail)
    └─ Pagination/search via form re-submission
```

---

## Middleware & Route Protection (Phase 1 Optimized)

**File:** `src/middleware.ts` (72 LOC)

**Optimizations:**
- Set-based route matching (faster lookup)
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- JSDoc documentation

```typescript
/**
 * Middleware for authentication and security headers.
 * Protects dashboard routes, adds security headers to all responses.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Set-based public route matching
  const publicRoutes = new Set(['/login', '/register']);
  if (publicRoutes.has(pathname) || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Protected paths (session required)
  const session = await getSession(request);
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  return response;
}
```

**Security Headers:**
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer info
- `Permissions-Policy` - Restricts browser features

**Protected Routes:**
- `/` (redirects to `/dashboard`)
- `/dashboard`
- `/companies`, `/companies/[id]`, `/companies/[id]/edit`, `/companies/new`
- `/contacts`, `/contacts/[id]`, `/contacts/[id]/edit`, `/contacts/new`
- `/deals`, `/deals/[id]`, `/deals/[id]/edit`, `/deals/new`
- `/activities`, `/activities/[id]`, `/activities/[id]/edit`, `/activities/new`

**Public Routes:**
- `/login`
- `/register`
- `/api/auth/*` (Better Auth API)

---

## Component Architecture

### Page Component (Server Component)

```typescript
// src/app/(dashboard)/companies/page.tsx
export default async function CompaniesPage() {
  const session = await getSession(); // Get user
  const companies = await getCompanies(session.user.id);

  return (
    <div>
      <PageHeader title="Companies" />
      <CompanySearch /> {/* Client component */}
      <CompanyListTable companies={companies} /> {/* Client component */}
    </div>
  );
}
```

### Client Component with Form

```typescript
// src/components/companies/CompanyForm.tsx
'use client';

export function CompanyForm() {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createCompany(formData);
      if (result.success) {
        // Navigation, toast
      }
    });
  }

  return <form action={handleSubmit}>...</form>;
}
```

### List Component (Mostly Presentational)

```typescript
// src/components/companies/CompanyListTable.tsx
export function CompanyListTable({ companies }: Props) {
  return (
    <Table>
      <TableBody>
        {companies.map(company => (
          <TableRow key={company.id}>
            <TableCell>{company.name}</TableCell>
            <TableCell>
              <Link href={`/companies/${company.id}`}>View</Link>
              <Link href={`/companies/${company.id}/edit`}>Edit</Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## Routing Structure

### App Router Hierarchy

```
src/app/
├── layout.tsx (Root layout: providers, fonts, globals.css)
├── globals.css (Tailwind base + custom styles)
├── (auth)/
│   ├── layout.tsx (Auth layout: centered form)
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── layout.tsx (Sidebar + DashboardHeader + Providers)
│   ├── page.tsx (Redirect to /dashboard → /)
│   ├── dashboard/page.tsx (Dashboard home)
│   ├── companies/
│   │   ├── page.tsx (List)
│   │   ├── new/page.tsx (Create)
│   │   ├── [id]/page.tsx (Detail)
│   │   └── [id]/edit/page.tsx (Edit)
│   ├── contacts/
│   │   ├── page.tsx (List)
│   │   ├── new/page.tsx (Create)
│   │   ├── [id]/page.tsx (Detail)
│   │   └── [id]/edit/page.tsx (Edit)
│   ├── deals/
│   │   ├── page.tsx (List/Kanban toggle)
│   │   ├── new/page.tsx (Create)
│   │   ├── [id]/page.tsx (Detail)
│   │   └── [id]/edit/page.tsx (Edit)
│   └── activities/
│       ├── page.tsx (Timeline)
│       ├── new/page.tsx (Log)
│       ├── [id]/page.tsx (Detail)
│       └── [id]/edit/page.tsx (Edit)
└── api/
    └── auth/
        └── [...all]/route.ts (Better Auth API)
```

**Layout Groups:**
- `(auth)` — Public pages (login, register)
- `(dashboard)` — Protected pages (sidebar layout)

---

## Kanban Board Architecture

**Tech:** @dnd-kit/core, @dnd-kit/sortable

### Component Hierarchy

```
DealKanbanBoard (Client Component)
  ├─ DragContext (dnd-kit)
  └─ For each DealStage:
      └─ DealKanbanColumn (Droppable)
          ├─ Column header (stage name + deal count)
          └─ For each deal in stage:
              └─ DealKanbanCard (Draggable)
                  ├─ Deal name, value, contact
                  └─ Delete button
```

### Drag & Drop Flow

```
User drags DealKanbanCard from "Prospecting" to "Qualification"
    ↓
@dnd-kit detects drop
    ↓
Call changeDealStage(dealId, newStage)
    ↓ (Server Action)
prisma.deal.update({
  where: { id: dealId },
  data: { stage: newStage }
})
    ↓
UI updates (optimistic or refetch)
```

---

## Data Isolation & Multi-Tenancy (Single-User)

**Principle:** Every query includes `where: { userId }` filter.

| Entity | Isolation | Pattern |
|--------|-----------|---------|
| Company | `where: { userId: session.user.id }` | User owns all companies |
| Contact | `where: { userId: session.user.id }` | User owns all contacts |
| Deal | `where: { userId: session.user.id }` | User owns all deals |
| Activity | `where: { userId: session.user.id }` | User owns all activities |
| Tag | `where: { userId: session.user.id }` | User owns all tags |

**Security:** User A cannot query, update, or delete User B's data.

---

## Error Handling Strategy (Phase 1 Optimized)

### Server Actions with NEXT_REDIRECT Pattern

```typescript
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { revalidatePath } from 'next/cache';

try {
  // Auth check with redirect
  const session = await getSession();
  if (!session?.user?.id) redirect('/login');

  // Validate input
  if (!name?.trim()) {
    throw new Error('Company name is required');
  }

  // Mutate
  const company = await prisma.company.create({
    data: { name: name.trim(), userId: session.user.id }
  });

  revalidatePath('/companies');
  return { success: true, company };
} catch (error) {
  // CRITICAL: Re-throw redirect errors (Next.js routing)
  if (isRedirectError(error)) throw error;

  console.error('createCompany:', error);

  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new Error('Company already exists');
    }
  }

  throw new Error('Failed to create company. Please try again.');
}
```

**Phase 1 Standards:**
- Always check `isRedirectError()` and re-throw
- Use `redirect('/login')` instead of throwing auth errors
- Call `revalidatePath()` after mutations
- Log errors with function name prefix

### Client-Side Handling

```typescript
async function handleSubmit(formData: FormData) {
  startTransition(async () => {
    try {
      const result = await createCompany(formData);
      toast.success('Company created!');
      router.push(`/companies/${result.company.id}`);
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    }
  });
}
```

---

## Dashboard Aggregations

**File:** `src/lib/dashboard-queries.ts` (181 LOC)

### Queries

| Query | Purpose | Returns |
|-------|---------|---------|
| `getMetrics(userId)` | Total counts: companies, contacts, deals | `{ companyCount, contactCount, dealCount }` |
| `getPipelineValue(userId)` | Deal value by stage | `{ prospecting: 100000, qualification: 50000, ... }` |
| `getPipelineOverview(userId)` | Deals per stage (count + value) | `{ stage, dealCount, totalValue }[]` |
| `getRecentActivities(userId)` | Last 10 activities | `Activity[]` with relations |
| `getDealClosingSoon(userId, days)` | Deals closing in next 30 days | `Deal[]` with company/contact |
| `getActivitySummary(userId, period)` | Activity count by type (week/month) | `{ call: 5, email: 3, meeting: 2, note: 1 }` |

### Dashboard Page Flow

```
User visits /dashboard
    ↓
server component calls:
├─ getMetrics(userId)
├─ getPipelineOverview(userId)
├─ getRecentActivities(userId)
├─ getDealClosingSoon(userId, 30)
└─ getActivitySummary(userId, 'week')
    ↓
Pass aggregated data to dashboard widgets
    ↓
Render MetricsRow, PipelineOverviewWidget, etc.
```

---

## Testing Architecture

### Unit Tests (Vitest)

```
src/__tests__/unit/
├── company-actions.test.ts
├── contact-actions.test.ts
├── deal-actions.test.ts
├── activity-actions.test.ts
├── dashboard-queries.test.ts
├── utils.test.ts
└── middleware-and-prisma.test.ts
```

**Pattern:** Mock Prisma, test business logic in isolation.

### E2E Tests (Playwright)

```
e2e/
├── auth-fixture.ts (Shared login flow)
├── global-setup.ts (DB cleanup)
├── auth-flows.spec.ts
├── company-crud.spec.ts
├── contact-crud-operations.spec.ts
├── deal-pipeline-management.spec.ts
├── activity-tracking-timeline.spec.ts
└── dashboard-widgets-metrics.spec.ts
```

**Pattern:** Real browser, real database, full user journeys.

---

## Deployment Architecture

### Docker Deployment

```
docker-compose.yml
├── app service
│   ├── Build: Dockerfile (Next.js app)
│   ├── Env: DATABASE_URL, BETTER_AUTH_SECRET, NODE_ENV
│   ├── Ports: 3000
│   ├── Health check: curl http://localhost:3000
│   └── Depends on: postgres service
└── postgres service
    ├── Image: postgres:16
    ├── Env: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
    ├── Ports: 5432
    ├── Volumes: postgres_data (named volume)
    └── Health check: pg_isready
```

### Environment Configuration

| Var | Type | Used In |
|-----|------|---------|
| `DATABASE_URL` | Connection string | Prisma, migrations |
| `BETTER_AUTH_SECRET` | 32-byte secret | Auth session encryption |
| `BETTER_AUTH_URL` | Full domain | CSRF/cookie domain validation |
| `NODE_ENV` | `development` or `production` | Next.js optimization |

---

## Scaling Considerations

| Layer | Limit | Approach |
|-------|-------|----------|
| Single User | 1-5 users | Current setup, works fine |
| Small Team | 5-20 users | Same setup, monitor DB |
| Medium Team | 20-100 users | Add read replicas, caching |
| Large Scale | 100+ users | Multi-tenancy redesign |

**Current MVP:** Optimized for single user or small team with shared VPS.

