# Better Auth v1.4.x + Next.js + Prisma Integration Research

**Date:** 2026-01-31
**Focus:** Server-side setup, client hooks, API routes, middleware, and Prisma adapter patterns

---

## 1. Server-Side Auth Instance (betterAuth)

### Import & Configuration

```ts
// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite", // or "mysql", "postgresql"
  }),
  // Optional: Enable experimental joins (2-3x faster queries)
  experimental: {
    joins: true
  }
});
```

**Key Points:**
- Prisma adapter import: `better-auth/adapters/prisma`
- PrismaClient can be imported from `@prisma/client` (default) or custom path (Prisma 7+)
- Provider must match your database type

### Environment Variables

```env
BETTER_AUTH_SECRET=<32+ character key>  # Generate: openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000    # Base URL (production: your domain)
```

---

## 2. Client-Side Auth Hooks

### Initialize Auth Client

```ts
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000"  // Must match BETTER_AUTH_URL
});
```

### Available Client Hooks

```ts
// In client components (use "use client")
import { authClient } from "@/lib/auth-client";

// Check session
const { data: session } = authClient.useSession();

// Sign up
authClient.signUp.email({
  email: "user@example.com",
  password: "password123",
  name: "John Doe"
});

// Sign in
authClient.signIn.email({
  email: "user@example.com",
  password: "password123"
});

// Sign out
authClient.signOut();
```

---

## 3. Next.js API Route Handler (Catch-All)

### Route Setup

```ts
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

**Key Points:**
- Catch-all route must be at `/api/auth/[...all]/route.ts`
- `toNextJsHandler()` converts Better Auth to Next.js request handlers
- Handles all auth endpoints automatically (signup, signin, signout, etc.)

---

## 4. Next.js Middleware for Route Protection

### Middleware Implementation

```ts
// middleware.ts (root level)
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/next-js";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip auth routes and public paths
  if (pathname.startsWith("/api/auth") || pathname === "/sign-in") {
    return NextResponse.next();
  }

  // Check for session cookie (optimistic check)
  const session = getSessionCookie(request.cookies);

  if (!session && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]  // Apply to all routes except _next and static files
};
```

### Route Protection in Client Components

```tsx
// app/dashboard/page.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session === undefined) return; // Loading
    if (!session) {
      router.push("/sign-in");  // Redirect if not authenticated
    }
  }, [session, router]);

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <button onClick={() => authClient.signOut()}>Sign Out</button>
    </div>
  );
}
```

### Route Protection in Server Components (Next.js 16+)

```ts
// app/dashboard/page.ts (Server Component)
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
    </div>
  );
}
```

**Note:** Next.js 16+ can use Node.js runtime in middleware for full validation. Earlier versions should use optimistic cookie checks + server-side validation.

---

## 5. Prisma Adapter Details

### Import Path

```ts
import { prismaAdapter } from "better-auth/adapters/prisma";
```

### Configuration Options

```ts
prismaAdapter(prisma, {
  provider: "sqlite" | "mysql" | "postgresql",  // Required
  // Optional:
  experimental: {
    joins: true  // Enable for 2-3x query performance
  }
});
```

### Database Schema Generation

```bash
# Generate required tables (User, Session, Account, Verification)
npx @better-auth/cli@latest generate

# For Prisma 7+ with custom output path:
# Make sure to import PrismaClient from your configured output path
```

### Prisma 7+ Note

If you've set a custom `output` path in `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "./generated/prisma"  // Custom path
}
```

Import from that location:

```ts
import { PrismaClient } from "@/generated/prisma/client";
```

---

## Database Models Auto-Generated

Better Auth automatically creates these models:

- **User** - User account information
- **Session** - Active user sessions
- **Account** - OAuth/provider accounts
- **Verification** - Email/email verification tokens

Relations are optional but recommended for performance (use CLI to regenerate schema if missing).

---

## Quick Setup Checklist

- [ ] `npm install better-auth`
- [ ] Create `.env` with `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`
- [ ] Create `lib/auth.ts` with betterAuth + prismaAdapter
- [ ] Create `lib/auth-client.ts` with createAuthClient
- [ ] Create `app/api/auth/[...all]/route.ts` handler
- [ ] Run `npx @better-auth/cli@latest generate`
- [ ] Run migrations: `npx prisma migrate dev`
- [ ] Create middleware.ts for route protection (optional)
- [ ] Implement useSession hooks in client components

---

## Sources

- [Better Auth Installation](https://www.better-auth.com/docs/installation)
- [Better Auth Prisma Adapter](https://www.better-auth.com/docs/adapters/prisma)
- [Prisma + Better Auth + Next.js Guide](https://www.prisma.io/docs/guides/betterauth-nextjs)
- [Better Auth Next.js Integration](https://www.better-auth.com/docs/integrations/next)

---

## Unresolved Questions

None at this time. All major integration patterns documented with code examples.
