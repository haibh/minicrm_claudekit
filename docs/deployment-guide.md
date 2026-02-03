# Docker Deployment Guide

**Updated:** 2026-02-02

This guide covers deploying MiniCRM using Docker and Docker Compose in production.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose V2
- Git
- 2GB RAM minimum
- 10GB disk space

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd minicrm_claudekit
```

### 2. Configure Environment

```bash
# Copy production environment template
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

**Required configuration:**

```env
DB_USER=minicrm
DB_PASSWORD=<strong-password-here>
DB_NAME=minicrm
APP_PORT=3000
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
BETTER_AUTH_URL=https://crm.yourdomain.com
NODE_ENV=production
```

**Generate secrets:**

```bash
# Generate BETTER_AUTH_SECRET
openssl rand -base64 32
```

### 3. Build Application

```bash
docker compose -f docker-compose.prod.yml build
```

### 4. Start Services

```bash
docker compose -f docker-compose.prod.yml up -d
```

Check status:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f app
```

### 5. Verify Deployment

```bash
# Check application health
curl http://localhost:3000

# Check database connection
docker compose -f docker-compose.prod.yml exec postgres psql -U minicrm -d minicrm -c '\l'
```

## Optional: Seed Database

```bash
# Access app container
docker compose -f docker-compose.prod.yml exec app sh

# Run seed script (if available)
npx prisma db seed
```

## Backup & Restore

### Automated Backups

```bash
# Run backup script
./scripts/backup-database.sh
```

**Setup daily cron job:**

```bash
# Edit crontab
crontab -e

# Add line (runs daily at 2 AM)
0 2 * * * cd /path/to/minicrm_claudekit && ./scripts/backup-database.sh >> ./logs/backup.log 2>&1
```

Backups stored in `./backups/` directory (keeps last 30).

### Manual Backup

```bash
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U minicrm -d minicrm | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restore from Backup

```bash
# Stop application
docker compose -f docker-compose.prod.yml stop app

# Restore database
gunzip -c backup_20260131.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U minicrm -d minicrm

# Start application
docker compose -f docker-compose.prod.yml start app
```

## Monitoring

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Application only
docker compose -f docker-compose.prod.yml logs -f app

# Database only
docker compose -f docker-compose.prod.yml logs -f postgres
```

### Resource Usage

```bash
docker stats minicrm-app-prod minicrm-postgres-prod
```

### Health Checks

```bash
# Database health
docker compose -f docker-compose.prod.yml exec postgres \
  pg_isready -U minicrm -d minicrm

# Application health
curl -f http://localhost:3000 || echo "App not responding"
```

## Updates & Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml build app
docker compose -f docker-compose.prod.yml up -d app
```

### Database Migrations

Migrations run automatically on container start via `docker-entrypoint.sh`.

**Manual migration:**

```bash
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

### Stop Services

```bash
# Stop all services
docker compose -f docker-compose.prod.yml down

# Stop and remove volumes (WARNING: deletes database)
docker compose -f docker-compose.prod.yml down -v
```

## Production Recommendations

### Security (Phase 1 Optimized)

1. **Use strong passwords** for DB_PASSWORD
2. **Generate unique secrets** for BETTER_AUTH_SECRET
3. **Enable HTTPS** via reverse proxy (nginx/Traefik)
4. **Restrict database access** to app container only
5. **Regular backups** via cron
6. **Security headers enabled** — Phase 1 middleware adds X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
7. **Next.js config hardening** — `poweredByHeader: false`, `reactStrictMode: true` in next.config.ts

### Reverse Proxy (nginx example)

```nginx
server {
    listen 80;
    server_name crm.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name crm.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Performance (Phase 1 Optimized)

- **Use volumes** for persistent data (already configured)
- **Optimized package imports** — next.config.ts enables `experimental.optimizePackageImports: ["lucide-react"]`
- **Limit container resources** if needed:

```yaml
app:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 1G
```

## Troubleshooting

### Application won't start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs app

# Common issues:
# - Database not ready: Wait 30s for migrations
# - Missing env vars: Check .env.production
# - Port conflict: Change APP_PORT
```

### Database connection failed

```bash
# Check postgres is running
docker compose -f docker-compose.prod.yml ps postgres

# Check DATABASE_URL format
docker compose -f docker-compose.prod.yml exec app printenv DATABASE_URL
```

### Migration errors

```bash
# Reset migrations (WARNING: destructive)
docker compose -f docker-compose.prod.yml exec app npx prisma migrate reset --force
```

## Support

For issues, check:
- Application logs: `docker compose -f docker-compose.prod.yml logs app`
- Database logs: `docker compose -f docker-compose.prod.yml logs postgres`
- System resources: `docker stats`
