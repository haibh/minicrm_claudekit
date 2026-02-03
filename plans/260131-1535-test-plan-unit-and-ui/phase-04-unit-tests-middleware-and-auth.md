# Phase 04: Unit Tests - Middleware & Auth

> Parent: [plan.md](./plan.md) | Depends on: [Phase 01](./phase-01-test-infrastructure-setup.md)

## Overview
- **Priority:** P1
- **Status:** pending
- **Description:** Unit tests for route protection middleware and auth configuration
- **Test Count:** 10

## Related Files
- `src/middleware.ts` — Route protection, session cookie check, redirects
- `src/lib/auth.ts` — Better Auth server config
- `src/lib/auth-client.ts` — Client-side auth hooks
- `src/lib/prisma.ts` — Prisma singleton with PrismaPg adapter

---

## Test Cases

### File: `src/__tests__/unit/middleware.test.ts` (7 tests)

#### TC-MW01: Allows access to /login without session
- **Input:** Request to /login, no session cookie
- **Expected:** NextResponse.next() (pass through)

#### TC-MW02: Allows access to /register without session
- **Input:** Request to /register, no session cookie
- **Expected:** NextResponse.next()

#### TC-MW03: Allows access to /api/auth/* without session
- **Input:** Request to /api/auth/signin, no session cookie
- **Expected:** NextResponse.next()

#### TC-MW04: Redirects /dashboard to /login when unauthenticated
- **Input:** Request to /dashboard, no session cookie
- **Expected:** Redirect to /login

#### TC-MW05: Allows /dashboard access with valid session
- **Input:** Request to /dashboard, valid session cookie present
- **Expected:** NextResponse.next()

#### TC-MW06: Redirects / to /dashboard when authenticated
- **Input:** Request to /, valid session cookie
- **Expected:** Redirect to /dashboard (or pass through to page that does this)

#### TC-MW07: Excludes static files from middleware
- **Input:** Request to /_next/static/chunk.js
- **Expected:** Middleware not invoked (matcher config)

---

### File: `src/__tests__/unit/prisma-singleton.test.ts` (3 tests)

#### TC-PS01: Creates PrismaClient with PrismaPg adapter
- **Verify:** PrismaClient instantiated with adapter option

#### TC-PS02: Reuses client in development (singleton)
- **Verify:** Same instance returned on multiple imports in non-production

#### TC-PS03: Creates new client in production
- **Mock:** NODE_ENV=production
- **Verify:** Does not attach to globalThis

---

## Todo

- [ ] TC-MW01: /login allowed without session
- [ ] TC-MW02: /register allowed without session
- [ ] TC-MW03: /api/auth/* allowed without session
- [ ] TC-MW04: /dashboard redirects to /login unauthenticated
- [ ] TC-MW05: /dashboard allowed with session
- [ ] TC-MW06: / redirects when authenticated
- [ ] TC-MW07: Static files excluded
- [ ] TC-PS01: PrismaClient with adapter
- [ ] TC-PS02: Singleton in development
- [ ] TC-PS03: New client in production

## Success Criteria
- All 10 tests pass
- Middleware route protection fully verified
- No actual database or auth connections needed (all mocked)
