# Code Standards & Conventions

**Version:** 1.1 | **Updated:** 2026-02-02

---

## File Naming & Organization

### Convention: kebab-case with Descriptive Names

| File Type | Format | Example |
|-----------|--------|---------|
| Components | `PascalCase.tsx` | `CompanyForm.tsx`, `DealKanbanBoard.tsx` |
| Server Actions | `kebab-case-actions.ts` | `company-actions.ts`, `deal-actions.ts` |
| Utilities | `kebab-case.ts` | `dashboard-queries.ts`, `format-utils.ts` |
| Tests | `kebab-case.test.ts` | `company-actions.test.ts` |
| E2E Specs | `kebab-case.spec.ts` | `company-crud.spec.ts` |
| Folders | `kebab-case/` | `src/actions/`, `src/components/`, `src/__tests__/` |

**Rationale:** LLM tools (Glob, Grep) need self-documenting names to infer file purpose without reading content.

---

## File Size Limits

| File Type | Max LOC | Guidance |
|-----------|---------|----------|
| React Components | 100 | Split into smaller, single-responsibility components |
| Server Actions | 200 | Group related CRUD into one file; separate by entity type |
| Utility Functions | 150 | Move complex logic into dedicated modules |
| Test Files | 200 | Organize test cases per function/behavior |
| Configuration | No limit | .env, tsconfig, package.json, etc. |
| Prisma Schema | No limit | All models in one schema.prisma |
| Markdown Docs | 800 | Split into topic subdirectories at 800 LOC |

**Approach:** Monitor file size during development; refactor early to maintain clarity.

---

## TypeScript & Code Quality

### Type Definitions

```typescript
// ✓ GOOD: Explicit types for function params & returns
export async function createCompany(
  name: string,
  industry?: string,
  userId: string
): Promise<Company> {
  // ...
}

// ✗ BAD: Implicit any types
export async function createCompany(name, industry, userId) {
  // ...
}
```

### Naming Conventions

| Category | Style | Example |
|----------|-------|---------|
| Variables/Functions | camelCase | `userId`, `getCompanyById()`, `handleFormSubmit()` |
| Classes/Components | PascalCase | `CompanyForm`, `DealKanbanBoard`, `User` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE` |
| Enum Values | snake_case | `prospecting`, `closed_won`, `primary` |
| Files | Based on content | `.tsx` (components), `.ts` (logic), `.test.ts` (tests) |
| Database Fields | camelCase | `isDecisionMaker`, `expectedCloseDate`, `authorityLevel` |
| API/DB enums | snake_case | `deal_stage`, `activity_type` |

### Error Handling

```typescript
// ✓ GOOD: Try-catch with NEXT_REDIRECT re-throw pattern (Phase 1 standard)
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect';

try {
  const company = await prisma.company.create({ data });
  revalidatePath('/companies');
  return { success: true, data: company };
} catch (error) {
  // Re-throw Next.js redirect errors (auth flow)
  if (isRedirectError(error)) throw error;

  console.error('Failed to create company:', error);
  throw new Error('Company creation failed. Please try again.');
}

// ✗ BAD: Silent failures or swallowing redirect errors
const company = await prisma.company.create({ data });
return company;
```

---

## Next.js & React Patterns

### Server vs Client Components

| Context | Type | When | Pattern |
|---------|------|------|---------|
| Page fetching data | Server | Root pages, data aggregation | `async function Page()` |
| Form submission | Server | Data mutation, auth check | Server Actions |
| User interaction | Client | Buttons, dropdowns, filters | `'use client'` directive |
| Shared UI logic | Client | Multiple pages, interactive state | Client Component |

```typescript
// ✓ GOOD: Server Component (no 'use client')
export default async function CompaniesPage() {
  const companies = await getCompanies(userId);
  return <CompanyListTable companies={companies} />;
}

// ✓ GOOD: Client Component for interactivity
'use client';
export function CompanySearch() {
  const [query, setQuery] = useState('');
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}

// ✗ BAD: Server Component with form state
export default async function CompanyForm() {
  const [formData, setFormData] = useState({}); // ✗ Can't use in server
}
```

### Server Actions Pattern (Phase 1 Optimized)

```typescript
// src/actions/company-actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { isRedirectError } from 'next/dist/client/components/redirect';

/**
 * Creates a new company for the authenticated user.
 * @param formData - Form data containing company fields
 * @returns Success object with company data
 * @throws Redirects to /login if unauthenticated
 */
export async function createCompany(formData: FormData) {
  try {
    // 1. Authenticate (redirect pattern)
    const session = await getSession();
    if (!session?.user?.id) redirect('/login');

    // 2. Validate
    const name = formData.get('name') as string;
    if (!name?.trim()) throw new Error('Company name is required');

    // 3. Mutate
    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        userId: session.user.id,
      },
    });

    // 4. Revalidate cache
    revalidatePath('/companies');
    return { success: true, company };
  } catch (error) {
    // Re-throw Next.js redirect errors
    if (isRedirectError(error)) throw error;

    console.error('createCompany:', error);
    throw new Error('Failed to create company');
  }
}
```

**Key Phase 1 Standards:**
- JSDoc comments on all exported functions
- Try-catch with `isRedirectError()` check
- `redirect('/login')` instead of `throw new Error('Unauthorized')`
- `revalidatePath()` after mutations
- Consistent error logging with function name prefix

### Form Component Pattern

```typescript
// components/companies/CompanyForm.tsx
'use client';

import { createCompany } from '@/actions/company-actions';
import { useTransition } from 'react';

export function CompanyForm() {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await createCompany(formData);
        if (result.success) {
          // Toast success, redirect
        }
      } catch (error) {
        // Toast error
      }
    });
  }

  return (
    <form action={handleSubmit}>
      <input name="name" required />
      <button disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</button>
    </form>
  );
}
```

---

## Component Library (Radix UI / shadcn/ui)

### Available Components

| Component | Import | Use Case |
|-----------|--------|----------|
| Button | `@/components/ui/button` | All interactive buttons |
| Card | `@/components/ui/card` | Content containers |
| Dialog | `@/components/ui/dialog` | Modals (forms, confirmations) |
| Select | `@/components/ui/select` | Dropdowns (stage, size, etc.) |
| **Table** | `@/components/ui/table` | **List views (Phase 1 standard: replaced raw HTML tables)** |
| Tabs | `@/components/ui/tabs` | Tabbed content |
| Checkbox | `@/components/ui/checkbox` | Boolean toggles |
| Label | `@/components/ui/label` | Form labels |
| Popover | `@/components/ui/popover` | Inline menus |
| AlertDialog | `@/components/ui/alert-dialog` | Destructive confirmations |

**Phase 1 Pattern:** Use shadcn Table component (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`) for all list views. No raw HTML `<table>` tags.

### Styling: Tailwind CSS

```tsx
// ✓ GOOD: Utility classes, responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
      {item.name}
    </Card>
  ))}
</div>

// ✗ BAD: Inline styles, no responsiveness
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
```

### Color & Theme

| Use | Color | Tailwind |
|-----|-------|----------|
| Primary action | Blue | `bg-blue-600`, `text-blue-600` |
| Success | Green | `bg-green-600`, `text-green-600` |
| Warning | Yellow | `bg-yellow-600`, `text-yellow-600` |
| Danger | Red | `bg-red-600`, `text-red-600` |
| Neutral | Gray | `bg-gray-100`, `text-gray-700` |
| Borders | Gray-200 | `border-gray-200` |

---

## Data Access & Prisma

### Shared Utilities Pattern (Phase 1 DRY)

Extract reusable logic into `src/lib/` modules:

```typescript
// src/lib/tag-utils.ts - Shared tag parsing/upserting
export function parseTagNames(tags: string): string[] {
  return tags.split(',').map(t => t.trim()).filter(Boolean);
}

export async function upsertUserTags(tagNames: string[], userId: string) {
  // ... implementation
}

// Usage in company-actions.ts, contact-actions.ts
import { parseAndUpsertTags } from '@/lib/tag-utils';
const tagIds = await parseAndUpsertTags(formData.get('tags'), userId);
```

```typescript
// src/lib/format-display-utils.ts - Shared display formatters
export function formatCompanySize(size: CompanySize): string {
  // ... implementation
}

// Usage in company-detail-card.tsx, company-list-table.tsx, contact-list-table.tsx
import { formatCompanySize } from '@/lib/format-display-utils';
```

### Query Pattern

```typescript
// ✓ GOOD: Scope by userId, handle errors
export async function getCompanies(userId: string) {
  try {
    return await prisma.company.findMany({
      where: { userId }, // Critical: scoped to user
      include: { tags: true }, // Eager load relations
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw new Error('Failed to fetch companies');
  }
}

// ✗ BAD: Missing userId filter (data leak)
export async function getCompanies() {
  return await prisma.company.findMany();
}
```

### Mutation Pattern

```typescript
// ✓ GOOD: Validate, scope, handle concurrency
export async function updateCompany(
  companyId: string,
  data: Partial<Company>,
  userId: string
) {
  // Verify ownership
  const company = await prisma.company.findFirst({
    where: { id: companyId, userId },
  });
  if (!company) throw new Error('Company not found');

  // Mutate
  return await prisma.company.update({
    where: { id: companyId },
    data,
  });
}
```

---

## Testing Approach

### Unit Tests (Vitest)

```typescript
// ✓ GOOD: Mock Prisma, test business logic
describe('company-actions', () => {
  it('should create company with valid name', async () => {
    vi.mocked(prisma.company.create).mockResolvedValue({
      id: 'cuid',
      name: 'Acme Corp',
      userId: 'user123',
      // ...
    });

    const result = await createCompany('Acme Corp', 'user123');
    expect(result.name).toBe('Acme Corp');
  });

  it('should throw on missing name', async () => {
    await expect(createCompany('', 'user123')).rejects.toThrow();
  });
});
```

### E2E Tests (Playwright)

```typescript
// ✓ GOOD: Test full user journey
test('user can create and view company', async ({ page }) => {
  await page.goto('/companies/new');
  await page.fill('input[name="name"]', 'Tech Startup');
  await page.click('button:has-text("Save")');
  await expect(page).toHaveURL('/companies');
  await expect(page.locator('text=Tech Startup')).toBeVisible();
});
```

---

## Security Guidelines

| Area | Rule | Example |
|------|------|---------|
| Auth | Always verify `userId` in server actions | `where: { userId }` filter in all queries |
| Input | Sanitize & trim user input | `name.trim()`, validate lengths |
| Secrets | Never commit `.env`, use `.env.example` | Database password, API keys in env only |
| Cookies | Better Auth manages; use HTTP-only | Don't access session cookies in client JS |
| CSRF | Better Auth handles CSRF tokens | No manual token management needed |
| Rate Limit | Implement on auth endpoints (phase 2) | `/api/auth/login`, `/api/auth/register` |

---

## Code Review Checklist

- [ ] TypeScript types are explicit (no implicit `any`)
- [ ] Error handling is present and informative
- [ ] User data is scoped by `userId`
- [ ] Server Actions use `'use server'` directive
- [ ] Components follow file size limits (<100 LOC)
- [ ] No console.log in production code (use proper logging)
- [ ] Tailwind classes used for styling (no inline CSS)
- [ ] Database queries include proper indexes (@index in schema)
- [ ] Tests cover happy path + error cases
- [ ] No hardcoded secrets or sensitive data
- [ ] Files use correct naming convention (kebab-case or PascalCase)

---

## Development Workflow

1. **Feature Branch:** `git checkout -b feat/company-search`
2. **Implement:** Write code following standards above
3. **Test:** `npm run test` (unit) + `npm run test:e2e` (E2E)
4. **Lint:** `npm run lint` (check for issues)
5. **Review:** Code review via PR (check checklist above)
6. **Merge:** Squash commit with conventional message
   - `feat: add company search`
   - `fix: resolve deal stage update bug`
   - `docs: update deployment guide`

---

## Conventional Commit Format

```
<type>(<scope>): <subject>
<blank line>
<body>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
**Scopes:** `auth`, `companies`, `contacts`, `deals`, `activities`, `dashboard`, `db`

**Examples:**
```
feat(deals): add drag-drop kanban board
fix(contacts): resolve decision-maker filter bug
docs(deployment): update Docker setup guide
test(activities): add timeline view tests
```

