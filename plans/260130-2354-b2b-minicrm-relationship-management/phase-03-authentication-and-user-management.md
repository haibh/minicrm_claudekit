# Phase 03: Authentication & User Management

## Context Links
- [Plan Overview](./plan.md)
- [PRD — Auth](../../docs/product-requirements-pdr.md#7-authentication--authorization)
- [Research: Better Auth](./research/researcher-02-nextjs-architecture-and-deployment.md)
- Depends on: [Phase 01](./phase-01-project-setup-and-infrastructure.md), [Phase 02](./phase-02-database-schema-and-models.md)

## Overview
- **Date:** 2026-01-30
- **Priority:** P1 (Critical Path)
- **Description:** Implement Better Auth integration with login/register pages, session management, protected route middleware, and auth API route handler.
- **Implementation Status:** Pending
- **Review Status:** Not started
- **Effort:** 5h

## Key Insights
- Better Auth uses a catch-all API route at `/api/auth/[...all]`
- Client-side hooks: `useSession()`, `signIn.email()`, `signUp.email()`, `signOut()`
- Middleware checks session cookie; redirects unauthenticated users to /login
- Auth layout group `(auth)` for login/register; dashboard layout group `(dashboard)` for protected pages
- Better Auth auto-handles password hashing, session creation/validation, CSRF

## Requirements

### Functional
- Email/password registration with name field
- Email/password login
- Session persistence across page reloads
- Logout functionality
- Protected routes redirect to /login when unauthenticated
- Login redirects to /dashboard when authenticated
- Auth pages inaccessible when already logged in (redirect to dashboard)

### Non-Functional
- Auth operations complete in < 1s
- Session cookie HTTP-only, secure in production
- Rate limiting on auth endpoints (Better Auth built-in)
- Password minimum 8 characters

## Architecture

### Auth Flow
```
Register -> Better Auth creates User + Account + Session -> Redirect to /dashboard
Login -> Better Auth validates credentials -> Creates Session -> Redirect to /dashboard
Middleware -> Check session cookie -> Valid: proceed | Invalid: redirect /login
Logout -> Better Auth destroys session -> Redirect to /login
```

### Route Groups
```
src/app/
├── (auth)/           # Public auth pages
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (dashboard)/      # Protected pages
│   ├── layout.tsx    # Dashboard shell (sidebar + header)
│   └── page.tsx      # Dashboard home
├── api/
│   └── auth/
│       └── [...all]/
│           └── route.ts  # Better Auth catch-all handler
```

## Related Code Files

### Files to Create
- `src/app/api/auth/[...all]/route.ts` — Better Auth API route handler
- `src/app/(auth)/login/page.tsx` — Login page with form
- `src/app/(auth)/register/page.tsx` — Register page with form
- `src/app/(auth)/layout.tsx` — Auth layout (centered card)
- `src/app/(dashboard)/layout.tsx` — Dashboard layout shell (sidebar, header)
- `src/app/(dashboard)/page.tsx` — Dashboard home (placeholder)
- `src/components/forms/login-form.tsx` — Login form Client Component
- `src/components/forms/register-form.tsx` — Register form Client Component

### Files to Modify
- `src/lib/auth.ts` — Finalize Better Auth config
- `src/lib/auth-client.ts` — Finalize client config
- `src/middleware.ts` — Implement session check logic

## Implementation Steps

1. **Create Better Auth API route** `src/app/api/auth/[...all]/route.ts`
   ```typescript
   import { auth } from "@/lib/auth";
   import { toNextJsHandler } from "better-auth/next-js";
   export const { GET, POST } = toNextJsHandler(auth);
   ```

2. **Finalize `src/lib/auth.ts`** — Server-side config
   - Database adapter: Prisma
   - Email + password provider enabled
   - Session config: 30-day expiry
   - Plugins: none for MVP

3. **Finalize `src/lib/auth-client.ts`** — Client-side config
   ```typescript
   import { createAuthClient } from "better-auth/react";
   export const authClient = createAuthClient({ baseURL: process.env.NEXT_PUBLIC_APP_URL });
   export const { useSession, signIn, signUp, signOut } = authClient;
   ```

4. **Create auth layout** `src/app/(auth)/layout.tsx`
   - Centered card layout, no sidebar
   - Check session; if authenticated redirect to /dashboard

5. **Create login page** `src/app/(auth)/login/page.tsx`
   - Server Component wrapper
   - Renders LoginForm client component

6. **Create LoginForm** `src/components/forms/login-form.tsx`
   - Client Component ("use client")
   - Email + password inputs with validation
   - Submit calls `signIn.email({ email, password })`
   - Error display for invalid credentials
   - Link to register page
   - Redirect to /dashboard on success

7. **Create register page** `src/app/(auth)/register/page.tsx`
   - Server Component wrapper
   - Renders RegisterForm client component

8. **Create RegisterForm** `src/components/forms/register-form.tsx`
   - Client Component
   - Name + email + password + confirm password inputs
   - Submit calls `signUp.email({ name, email, password })`
   - Client-side validation (password length, match)
   - Link to login page
   - Redirect to /dashboard on success

9. **Implement middleware** `src/middleware.ts`
   - Match paths: `/dashboard/:path*`
   - Check for session cookie from Better Auth
   - If no valid session: redirect to /login
   - Public paths: /login, /register, /api/auth

10. **Create dashboard layout** `src/app/(dashboard)/layout.tsx`
    - Sidebar placeholder + header placeholder + main content area
    - Get session server-side; pass user info to header

11. **Create dashboard home** `src/app/(dashboard)/page.tsx`
    - Simple welcome message with user name
    - Placeholder for dashboard widgets (Phase 08)

12. **Install shadcn/ui components needed**
    ```bash
    npx shadcn@latest add button input label card form
    ```

13. **Test auth flow end-to-end**
    - Register new account -> auto-login -> see dashboard
    - Logout -> redirected to login
    - Login with credentials -> see dashboard
    - Visit /dashboard unauthenticated -> redirected to login

## Todo List
- [ ] Create Better Auth API catch-all route handler
- [ ] Finalize Better Auth server config (src/lib/auth.ts)
- [ ] Finalize Better Auth client config (src/lib/auth-client.ts)
- [ ] Create auth layout with centered card design
- [ ] Create login page (Server Component)
- [ ] Create LoginForm client component with validation
- [ ] Create register page (Server Component)
- [ ] Create RegisterForm client component with validation
- [ ] Implement auth middleware for protected routes
- [ ] Create dashboard layout shell (sidebar placeholder + header)
- [ ] Create dashboard home page with welcome message
- [ ] Install required shadcn/ui components (button, input, label, card, form)
- [ ] Test: register -> auto-login -> dashboard
- [ ] Test: logout -> redirect to login
- [ ] Test: login -> dashboard
- [ ] Test: unauthenticated access to /dashboard redirects to /login
- [ ] Test: authenticated access to /login redirects to /dashboard

## Success Criteria
- Full register -> login -> logout cycle works
- Protected routes block unauthenticated access
- Auth pages redirect authenticated users to dashboard
- Session persists across page refreshes
- Form validation shows meaningful errors
- Password stored as hash (never plaintext)

## Risk Assessment
- **Better Auth API compatibility**: Check docs for exact route handler export format
- **Middleware session validation**: Better Auth uses specific cookie names; ensure middleware reads correct cookie
- **Client/Server component boundary**: Forms must be Client Components; pages can be Server Components
- **Redirect loops**: Ensure middleware excludes auth pages and API routes

## Security Considerations
- Passwords hashed by Better Auth (bcrypt/argon2)
- Session cookies are HTTP-only, SameSite=Lax, Secure in production
- CSRF protection handled by Better Auth
- Rate limiting on /api/auth/* endpoints
- No password exposed in client-side state or URLs
- Middleware runs on Edge; ensure compatibility

## Next Steps
- Phase 04: Build Company CRUD (first protected feature)
- Phase 05: Build Contact CRUD (depends on companies existing)
