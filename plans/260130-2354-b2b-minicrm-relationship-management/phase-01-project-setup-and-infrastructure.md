# Phase 01: Project Setup & Infrastructure

## Context Links
- [Plan Overview](./plan.md)
- [PRD](../../docs/product-requirements-pdr.md)
- [Research: Next.js Architecture](./research/researcher-02-nextjs-architecture-and-deployment.md)

## Overview
- **Date:** 2026-01-30
- **Priority:** P1 (Critical Path)
- **Description:** Initialize Next.js project with TypeScript, configure Prisma ORM, set up Docker Compose for local dev, integrate Better Auth, establish project folder structure and tooling.
- **Implementation Status:** Pending
- **Review Status:** Not started
- **Effort:** 4h

## Key Insights
- Next.js App Router with Server Components is default; minimize Client Components
- Prisma singleton pattern prevents connection pool exhaustion
- Better Auth auto-generates DB schema tables (User, Session, Account)
- Docker Compose uses service names as hostnames (postgres:5432)
- shadcn/ui installs components locally (not a dependency)

## Requirements

### Functional
- Next.js 15 project with App Router and TypeScript strict mode
- Prisma ORM configured pointing to PostgreSQL
- Docker Compose with postgres + app services for local dev
- Better Auth installed and configured with email/password provider
- shadcn/ui initialized with Tailwind CSS
- ESLint + Prettier configured
- Environment variables template (.env.example)

### Non-Functional
- Dev server starts in < 10s
- Hot reload working for all file types
- Docker Compose `up` brings full stack in < 30s

## Architecture

```
minicrm_claudekit/
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Landing/redirect
│   ├── components/
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── auth.ts              # Better Auth server config
│   │   ├── auth-client.ts       # Better Auth client config
│   │   └── utils.ts             # cn() helper, misc utils
│   ├── actions/                 # Server Actions
│   └── types/                   # Shared TypeScript types
├── prisma/
│   └── schema.prisma            # Database schema
├── public/                      # Static assets
├── docker-compose.yml           # Dev compose
├── Dockerfile                   # Multi-stage build
├── .env.example                 # Env template
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── package.json
```

## Related Code Files

### Files to Create
- `package.json` (via npx create-next-app)
- `src/app/layout.tsx` — Root layout with font, metadata
- `src/app/page.tsx` — Landing page / redirect to dashboard
- `src/lib/prisma.ts` — Prisma client singleton
- `src/lib/auth.ts` — Better Auth server configuration
- `src/lib/auth-client.ts` — Better Auth client configuration
- `src/lib/utils.ts` — cn() utility, common helpers
- `src/types/index.ts` — Shared type definitions
- `prisma/schema.prisma` — Initial schema (User, Session, Account from Better Auth)
- `docker-compose.yml` — Dev environment (postgres + app)
- `Dockerfile` — Multi-stage Next.js build
- `.env.example` — Environment variable template
- `src/middleware.ts` — Auth middleware for protected routes

## Implementation Steps

1. **Initialize Next.js project**
   ```bash
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   ```

2. **Install core dependencies**
   ```bash
   npm install prisma @prisma/client better-auth
   npm install -D @types/node
   ```

3. **Initialize Prisma**
   ```bash
   npx prisma init --datasource-provider postgresql
   ```

4. **Create `.env.example`** with:
   ```
   DATABASE_URL=postgresql://minicrm:minicrm@localhost:5432/minicrm
   BETTER_AUTH_SECRET=your-secret-here
   BETTER_AUTH_URL=http://localhost:3000
   NEXTAUTH_URL=http://localhost:3000
   ```

5. **Create `src/lib/prisma.ts`** — Singleton pattern:
   ```typescript
   import { PrismaClient } from "@prisma/client";
   const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
   export const prisma = globalForPrisma.prisma || new PrismaClient();
   if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
   ```

6. **Create `src/lib/auth.ts`** — Better Auth server config with email/password provider, Prisma adapter

7. **Create `src/lib/auth-client.ts`** — Better Auth client-side hooks (useSession, signIn, signOut)

8. **Create `src/lib/utils.ts`** — cn() clsx+twMerge helper

9. **Initialize shadcn/ui**
   ```bash
   npx shadcn@latest init
   ```

10. **Create `docker-compose.yml`** with postgres service (named volume, health check) and app service

11. **Create `Dockerfile`** — Multi-stage build (deps -> build -> runner) using node:20-alpine

12. **Create `src/middleware.ts`** — Protect /dashboard/* routes, redirect unauthenticated to /login

13. **Verify setup**: `docker compose up`, confirm DB connects, dev server runs, auth pages accessible

## Todo List
- [ ] Initialize Next.js project with TypeScript + Tailwind + App Router
- [ ] Install Prisma, Better Auth, and dev dependencies
- [ ] Initialize Prisma with PostgreSQL datasource
- [ ] Create .env.example with all required variables
- [ ] Create .env with local dev values (gitignored)
- [ ] Create Prisma client singleton (src/lib/prisma.ts)
- [ ] Configure Better Auth server (src/lib/auth.ts)
- [ ] Configure Better Auth client (src/lib/auth-client.ts)
- [ ] Create utility helpers (src/lib/utils.ts)
- [ ] Initialize shadcn/ui
- [ ] Create docker-compose.yml for local dev
- [ ] Create Dockerfile with multi-stage build
- [ ] Create auth middleware (src/middleware.ts)
- [ ] Create root layout and landing page
- [ ] Verify full stack starts with docker compose up
- [ ] Verify TypeScript compilation has no errors

## Success Criteria
- `npm run dev` starts without errors
- `docker compose up` brings up postgres + app
- Prisma connects to PostgreSQL successfully
- Better Auth endpoints respond at /api/auth/*
- shadcn/ui components render correctly
- TypeScript strict mode passes with zero errors

## Risk Assessment
- **Better Auth version compatibility**: Pin exact version; check changelog before install
- **Prisma + Docker networking**: Use service name `postgres` as DB host, not `localhost`
- **Node version mismatch**: Use node:20-alpine consistently in Dockerfile and local dev

## Security Considerations
- Never commit .env file (add to .gitignore)
- BETTER_AUTH_SECRET must be cryptographically random (32+ chars)
- DATABASE_URL credentials must differ between dev and production
- Middleware must block all /dashboard routes for unauthenticated users

## Next Steps
- Phase 02: Define full database schema with all CRM tables
- Phase 03: Build auth pages (login, register)
