#!/bin/sh
set -e

echo "Waiting for database..."

# Simple retry loop for DB connection
for i in $(seq 1 30); do
  if npx prisma migrate deploy 2>/dev/null; then
    echo "Migrations applied successfully"
    break
  fi
  echo "Waiting for database... attempt $i/30"
  sleep 2
done

echo "Starting application..."
exec node server.js
