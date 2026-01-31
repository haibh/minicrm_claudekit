#!/bin/bash
set -e

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/minicrm_backup_${TIMESTAMP}.sql.gz"
KEEP_BACKUPS=30

# Load environment variables
if [ -f .env.production ]; then
  export $(cat .env.production | grep -v '^#' | xargs)
fi

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "Starting database backup..."

# Perform backup using docker compose
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U "${DB_USER:-minicrm}" -d "${DB_NAME:-minicrm}" | gzip > "${BACKUP_FILE}"

echo "Backup created: ${BACKUP_FILE}"

# Rotate old backups - keep only last KEEP_BACKUPS files
BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}"/minicrm_backup_*.sql.gz 2>/dev/null | wc -l)
if [ "${BACKUP_COUNT}" -gt "${KEEP_BACKUPS}" ]; then
  echo "Rotating old backups (keeping last ${KEEP_BACKUPS})..."
  ls -1t "${BACKUP_DIR}"/minicrm_backup_*.sql.gz | tail -n +$((KEEP_BACKUPS + 1)) | xargs rm -f
  echo "Old backups removed."
fi

echo "Backup completed successfully!"
