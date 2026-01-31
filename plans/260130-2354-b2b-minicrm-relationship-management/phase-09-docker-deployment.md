# Phase 09: Docker Deployment

## Context Links
- [Plan Overview](./plan.md)
- [PRD — Non-Functional](../../docs/product-requirements-pdr.md#5-non-functional-requirements)
- [Research: Docker Deployment](./research/researcher-02-nextjs-architecture-and-deployment.md)
- Depends on: All previous phases (Phase 01-08)

## Overview
- **Date:** 2026-01-30
- **Priority:** P1
- **Description:** Production-ready Docker setup with multi-stage Dockerfile, docker-compose.prod.yml, health checks, environment configuration, backup strategy, and deployment instructions.
- **Implementation Status:** Pending
- **Review Status:** Not started
- **Effort:** 3h

## Key Insights
- Multi-stage Docker build reduces image size (deps -> build -> runner)
- node:20-alpine for minimal image footprint
- Docker Compose uses service names as hostnames (postgres not localhost)
- Health checks: pg_isready for PostgreSQL, HTTP check for Next.js
- Named volumes for PostgreSQL data persistence
- Separate dev and prod compose files
- Prisma migrate deploy runs on container startup (not migrate dev)

## Requirements

### Functional
- Multi-stage Dockerfile producing optimized production image
- docker-compose.prod.yml with postgres + app services
- Health checks on both services
- Named volume for PostgreSQL data
- Environment variables externalized (.env.production)
- Startup script: wait for DB -> run migrations -> start app
- Backup script for PostgreSQL data (pg_dump)

### Non-Functional
- Production image < 500MB
- Container starts in < 30s (including migrations)
- PostgreSQL data survives container restarts
- Zero-downtime restart possible via docker compose restart

## Architecture

### Container Layout
```
┌─────────────────────────────────────────┐
│            Docker Compose               │
│                                         │
│  ┌─────────────┐   ┌─────────────────┐ │
│  │  postgres    │   │      app        │ │
│  │  Port: 5432  │◄──│  Port: 3000     │ │
│  │  Volume:     │   │  Multi-stage    │ │
│  │  pgdata      │   │  node:20-alpine │ │
│  └─────────────┘   └─────────────────┘ │
│                                         │
│  Network: minicrm-network (bridge)      │
└─────────────────────────────────────────┘
```

### Multi-stage Dockerfile
```
Stage 1 (deps):     Install node_modules
Stage 2 (builder):  Build Next.js + Generate Prisma client
Stage 3 (runner):   Copy build output + node_modules, run standalone
```

## Related Code Files

### Files to Create
- `Dockerfile` — Multi-stage production build
- `docker-compose.prod.yml` — Production compose with health checks
- `docker-compose.yml` — Dev compose (updated with health checks)
- `.env.example` — Updated with all production variables
- `.env.production.example` — Production-specific env template
- `scripts/docker-entrypoint.sh` — Startup script (wait for DB, migrate, start)
- `scripts/backup-database.sh` — pg_dump backup script
- `.dockerignore` — Exclude unnecessary files from build context
- `docs/deployment-guide.md` — Step-by-step VPS deployment instructions

### Files to Modify
- `next.config.ts` — Add `output: "standalone"` for Docker
- `package.json` — Ensure build scripts correct

## Implementation Steps

1. **Update next.config.ts** — Add standalone output
   ```typescript
   const nextConfig = { output: "standalone" };
   ```

2. **Create .dockerignore**
   ```
   node_modules
   .next
   .git
   .env*
   !.env.example
   docker-compose*.yml
   Dockerfile
   README.md
   plans/
   docs/
   ```

3. **Create Dockerfile** — Multi-stage build
   - **Stage 1 (deps)**: FROM node:20-alpine, WORKDIR /app, COPY package*.json, RUN npm ci
   - **Stage 2 (builder)**: FROM deps, COPY prisma/, RUN npx prisma generate, COPY src/ next.config.ts tsconfig.json tailwind.config.ts postcss.config.mjs, RUN npm run build
   - **Stage 3 (runner)**: FROM node:20-alpine, create nextjs user, COPY --from=builder standalone + static + public, COPY prisma/ for migrations, COPY scripts/docker-entrypoint.sh, EXPOSE 3000, ENTRYPOINT entrypoint script

4. **Create docker-entrypoint.sh** `scripts/docker-entrypoint.sh`
   ```bash
   #!/bin/sh
   set -e
   echo "Waiting for database..."
   npx prisma migrate deploy
   echo "Starting application..."
   exec node server.js
   ```

5. **Create docker-compose.prod.yml**
   ```yaml
   services:
     postgres:
       image: postgres:16-alpine
       environment:
         POSTGRES_USER: ${DB_USER}
         POSTGRES_PASSWORD: ${DB_PASSWORD}
         POSTGRES_DB: ${DB_NAME}
       volumes:
         - pgdata:/var/lib/postgresql/data
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
         interval: 10s
         timeout: 5s
         retries: 5
       restart: unless-stopped

     app:
       build: .
       ports:
         - "${APP_PORT:-3000}:3000"
       environment:
         DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
         BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
         BETTER_AUTH_URL: ${BETTER_AUTH_URL}
         NODE_ENV: production
       depends_on:
         postgres:
           condition: service_healthy
       restart: unless-stopped

   volumes:
     pgdata:
   ```

6. **Update docker-compose.yml** (dev) — Add health check to postgres, mount source code for hot reload

7. **Create .env.production.example**
   ```
   DB_USER=minicrm
   DB_PASSWORD=CHANGE_ME_STRONG_PASSWORD
   DB_NAME=minicrm
   APP_PORT=3000
   BETTER_AUTH_SECRET=CHANGE_ME_RANDOM_32_CHARS
   BETTER_AUTH_URL=https://crm.yourdomain.com
   NODE_ENV=production
   ```

8. **Create backup script** `scripts/backup-database.sh`
   ```bash
   #!/bin/bash
   TIMESTAMP=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="/backups"
   docker compose -f docker-compose.prod.yml exec -T postgres \
     pg_dump -U ${DB_USER} ${DB_NAME} | gzip > "${BACKUP_DIR}/minicrm_${TIMESTAMP}.sql.gz"
   # Keep last 30 backups
   ls -t ${BACKUP_DIR}/minicrm_*.sql.gz | tail -n +31 | xargs rm -f 2>/dev/null
   ```

9. **Create deployment guide** `docs/deployment-guide.md`
   - Prerequisites: VPS with Docker + Docker Compose
   - Clone repo, copy .env.production.example to .env, configure values
   - Build and start: `docker compose -f docker-compose.prod.yml up -d --build`
   - Run initial seed (optional): `docker compose exec app npx prisma db seed`
   - Setup backup cron: `0 2 * * * /path/to/scripts/backup-database.sh`
   - Monitoring: `docker compose logs -f app`
   - Update: `git pull && docker compose up -d --build`

10. **Test deployment locally**
    - Build production image: `docker compose -f docker-compose.prod.yml build`
    - Start: `docker compose -f docker-compose.prod.yml up -d`
    - Verify: app accessible at localhost:3000
    - Verify: DB data persists across container restart
    - Verify: health checks pass (`docker compose ps`)
    - Test backup script execution

## Todo List
- [ ] Add output: "standalone" to next.config.ts
- [ ] Create .dockerignore file
- [ ] Create multi-stage Dockerfile (deps -> build -> runner)
- [ ] Create docker-entrypoint.sh startup script
- [ ] Create docker-compose.prod.yml with health checks and named volumes
- [ ] Update docker-compose.yml (dev) with health checks
- [ ] Create .env.production.example template
- [ ] Create backup-database.sh script
- [ ] Create deployment-guide.md documentation
- [ ] Test: docker compose build succeeds
- [ ] Test: docker compose up starts both services
- [ ] Test: app accessible at localhost:3000
- [ ] Test: health checks pass (docker compose ps shows healthy)
- [ ] Test: data persists across container restart
- [ ] Test: backup script produces valid dump file
- [ ] Test: fresh deploy from scratch works (clone -> build -> up)

## Success Criteria
- `docker compose -f docker-compose.prod.yml up -d --build` deploys full stack
- App responds at configured port
- PostgreSQL health check passes
- Data persists across container restarts (named volume)
- Migrations run automatically on startup
- Production image < 500MB
- Backup script produces compressed pg_dump
- Deployment guide is clear enough for fresh VPS setup

## Risk Assessment
- **Prisma migration on startup**: If migration fails, container crashes; add error handling in entrypoint
- **Database connection timing**: depends_on with service_healthy handles this, but add retry logic
- **Secret management**: .env.production must never be committed; document this clearly
- **Disk space**: PostgreSQL volume grows over time; backup rotation + monitoring needed
- **SSL/TLS**: Not in MVP scope; document reverse proxy (nginx/Caddy) for HTTPS in deployment guide

## Security Considerations
- Strong, unique passwords in .env.production (never use defaults)
- BETTER_AUTH_SECRET must be 32+ character random string
- PostgreSQL only accessible from Docker network (not exposed to host in prod)
- .env.production in .gitignore (never committed)
- Backup files encrypted at rest (stretch goal)
- Container runs as non-root user (nextjs user in Dockerfile)
- No SSH into containers in production

## Next Steps
- Post-MVP: SSL via reverse proxy (Caddy/nginx), monitoring, log aggregation
- Post-MVP: CI/CD pipeline for automated builds and deploys
- Post-MVP: Import/export CSV, email integration, i18n
