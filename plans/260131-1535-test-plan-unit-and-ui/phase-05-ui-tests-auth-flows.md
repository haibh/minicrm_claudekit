# Phase 05: UI Tests - Auth Flows

> Parent: [plan.md](./plan.md) | Depends on: [Phase 01](./phase-01-test-infrastructure-setup.md)

## Overview
- **Priority:** P1
- **Status:** pending
- **Description:** Playwright E2E tests for registration, login, logout, and route protection
- **Test Count:** 12

## Related Pages
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/middleware.ts`

---

## Test Cases

### File: `e2e/auth-flows.spec.ts` (12 tests)

#### TC-AF01: Register page renders correctly
- **Navigate:** /register
- **Expected:** Form visible with name, email, password, confirm password fields + submit button

#### TC-AF02: Register with valid credentials
- **Action:** Fill name, email, password, confirm password → submit
- **Expected:** Redirected to /dashboard (or /)

#### TC-AF03: Register rejects mismatched passwords
- **Action:** password="Test1234", confirmPassword="Different"
- **Expected:** Error message displayed, stays on /register

#### TC-AF04: Register rejects short password
- **Action:** password="123"
- **Expected:** Error about minimum 8 characters

#### TC-AF05: Register rejects duplicate email
- **Action:** Register with already-used email
- **Expected:** Error message about existing account

#### TC-AF06: Login page renders correctly
- **Navigate:** /login
- **Expected:** Form with email, password fields + submit button + register link

#### TC-AF07: Login with valid credentials
- **Precondition:** Registered user exists
- **Action:** Enter email + password → submit
- **Expected:** Redirected to dashboard

#### TC-AF08: Login with wrong password
- **Action:** Valid email + wrong password
- **Expected:** Error message, stays on /login

#### TC-AF09: Login with non-existent email
- **Action:** nonexistent@test.com
- **Expected:** Error message

#### TC-AF10: Logout redirects to login
- **Precondition:** Logged in
- **Action:** Click logout button/link
- **Expected:** Redirected to /login, session cleared

#### TC-AF11: Protected route redirects unauthenticated user
- **Action:** Navigate to /companies without session
- **Expected:** Redirected to /login

#### TC-AF12: Navigation between login and register
- **Action:** On /login, click "Register" link
- **Expected:** Navigate to /register
- **Action:** On /register, click "Login" link
- **Expected:** Navigate to /login

---

## Todo

- [ ] TC-AF01: Register page renders
- [ ] TC-AF02: Register valid credentials
- [ ] TC-AF03: Register mismatched passwords
- [ ] TC-AF04: Register short password
- [ ] TC-AF05: Register duplicate email
- [ ] TC-AF06: Login page renders
- [ ] TC-AF07: Login valid credentials
- [ ] TC-AF08: Login wrong password
- [ ] TC-AF09: Login non-existent email
- [ ] TC-AF10: Logout redirects
- [ ] TC-AF11: Protected route redirect
- [ ] TC-AF12: Login/register navigation

## Success Criteria
- All 12 tests pass
- Auth state persists across page navigations
- Error messages user-friendly
