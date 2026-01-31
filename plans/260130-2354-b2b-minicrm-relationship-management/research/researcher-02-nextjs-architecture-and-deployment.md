# Next.js Architecture & Deployment Research
**Date:** 2025-01-30 | **Status:** Complete

---

## 1. Next.js + Prisma CRM Architecture

### Best Patterns (Next.js 16 + App Router)
- **Server Components Default**: Fetch data directly in Server Components using Prisma, eliminating internal API layer need. Reduces latency, sends only rendered HTML to client.
- **Field Selection**: Use `select` keyword in Prisma queries to fetch only UI-required fields, reducing memory/bandwidth impact.
- **Server Actions**: Use `"use server"` marked functions for mutations from client components, replacing traditional REST APIs.
- **Singleton Pattern Critical**: Serverless environments spin up new instances per request spike. Implement Prisma Client singleton to prevent database connection overload crashes.

### Query Optimization
- Type-safe schema changes propagate instantly to frontend via Prisma generated types.
- Prisma Accelerate (v7): HTTP connection pooling + global caching + cold start elimination for serverless.
- Prisma 7: Rust-free architecture, requires Driver Adapters configuration.

**Sources**: [Prisma NextJS 2025 Guide](https://blog.nextsaaspilot.com/prisma-nextjs/) | [Guide to Prisma 7 with Next.js 16](https://medium.com/@gauravkmaurya09/guide-to-prisma-7-with-next-js-16-javascript-edition-99c8c4ca10be)

---

## 2. Authentication: Better Auth vs Auth.js (NextAuth v5)

### Better Auth (Recommended for New Projects)
- **Advantages**: TypeScript-first, modular config, auto-generates schema, superior DX
- **Built-in**: Rate limiting, password policies, MFA (no extra work)
- **2025 Status**: Auth.js team joining Better Auth. Auth.js gets security patches only; Better Auth recommended for new projects.

### Auth.js v5 (NextAuth.js)
- **Advantages**: CSRF protection, JWTs, signed cookies
- **Disadvantages**: Complex setup, credential auth overhead, non-standard flows difficult, poor docs
- **Docker**: Set `trustHost: true` or `AUTH_TRUST_HOST=true` environment variable for self-hosted deployments

### Self-hosted (Docker/VPS) Recommendation
**Better Auth wins** for custom deployments:
- Cleaner Docker integration
- TypeScript safety reduces misconfiguration
- Better credential-based auth support
- Simpler environment variable handling

**Sources**: [Better Auth vs NextAuth 2025](https://betterstack.com/community/guides/scaling-nodejs/better-auth-vs-nextauth-authjs-vs-autho/) | [Auth.js vs BetterAuth Comparison](https://www.wisp.blog/blog/authjs-vs-betterauth-for-nextjs-a-comprehensive-comparison) | [NextAuth to Better Auth Migration](https://dev.to/pipipi-dev/nextauthjs-to-better-auth-why-i-switched-auth-libraries-31h3)

---

## 3. Docker Deployment (Next.js + PostgreSQL)

### Multi-stage Build & Optimization
- Use `node:18-alpine` (lightweight, includes Node 18 + npm)
- Use `npm ci` (clean install) vs `npm i` to ensure lock file consistency
- Multi-stage: build stage → production stage (reduces final image size)

### Docker Compose Configuration
- **Service Communication**: Use service names as hostnames (not localhost): `postgres:5432` from Next.js container
- **Health Checks**: PostgreSQL should use `pg_isready` with 10s interval, 5s timeout, 5 retries
- **Environment Variables**: Set in compose file OR .env files (compose variables override .env)
- **Volume Persistence**: Mount PostgreSQL data to named volume for persistence across container restarts

### Key Environment Setup
- Database URL format: `postgresql://user:password@postgres:5432/dbname` (service name as host)
- Next.js `node_env`: Set to `production` in compose for production deployments
- Separate `docker-compose.dev.yml` and `docker-compose.prod.yml` for different environments

**Sources**: [Dockerizing Next.js PostgreSQL Prisma](https://medium.com/@abhijariwala/dockerizing-a-next-js-and-node-js-app-with-postgresql-and-prisma-a-complete-guide-000527023e99) | [Next.js Docker Compose Best Practices](https://jean-marc.io/blog/setup-next.js-with-postgres-prisma-docker) | [DEV Community Docker Guide](https://dev.to/ankitparashar700/dockerizing-a-nextjs-app-with-postgresql-and-pgadmin-a-step-by-step-guide-153e)

---

## 4. PostgreSQL Schema Design for CRM

### JSONB for Flexible Fields
- **Hybrid Approach**: Fixed columns for core CRM data (contacts, deals, notes), JSONB for variable metadata/custom fields
- **Storage**: Overcomes overhead of schema changes on audit tables, stores variable attributes efficiently
- **Use Case**: Customer attributes, deal properties, custom metadata without schema migration

### Indexing Strategy
- **GIN Index** (full JSONB): `CREATE INDEX idx_contact_metadata_gin ON contacts USING GIN (metadata);`
- **GIN with jsonb_path_ops**: More efficient for path-specific searches, smaller index size
- **Timestamp/Operation Index**: Separate indexes on audit operation + timestamp for fast audit filtering

### Audit Trail Implementation
- **Trigger-based**: Create trigger on INSERT/UPDATE/DELETE, log to audit table
- **JSONB Columns**: `old_data` and `new_data` as JSONB to store full record states
- **Fields**: table_name, action (INSERT/UPDATE/DELETE), user_name, created_at, old_data, new_data
- **Partitioning**: Keep X months production data, archive older partitions (cost optimization)

### Tools & Libraries
- **pg-audit-json**: Simple trigger-based auditing with JSONB diffs
- **pgMemento**: Advanced audit trail with schema versioning (transaction-based)
- **PostgreSQL Triggers**: Standard approach, no external dependencies

**Sources**: [Audit Logging with JSONB](https://elephas.io/audit-logging-using-jsonb-in-postgres/) | [JSONB Indexing Strategies](https://github.com/oneuptime/blog/tree/master/posts/2026-01-26-jsonb-querying-indexing-postgresql) | [PostgreSQL Audit Triggers](https://wiki.postgresql.org/wiki/Audit_trigger)

---

## Key Recommendations for miniCRM

1. **Architecture**: Server Components + Prisma singleton pattern + Server Actions
2. **Auth**: Migrate to Better Auth (TypeScript-first, cleaner Docker integration)
3. **Database**: Hybrid schema (fixed columns + JSONB for custom fields) + trigger-based audit trail
4. **Deployment**: Docker Compose with health checks, named volumes, environment separation
5. **Query Performance**: Use Prisma `select` for field filtering, GIN indexes on JSONB audit columns

---

## Unresolved Questions
- Specific backup strategy for Docker Compose PostgreSQL (snapshotting vs pg_dump)?
- Caching layer (Redis) necessity for CRM read-heavy operations?
- Rate limiting implementation details in Better Auth for API endpoints?
