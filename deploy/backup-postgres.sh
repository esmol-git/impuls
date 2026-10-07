#!/usr/bin/env bash
# Ежедневный дамп Postgres (Docker) с ротацией.
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/impuls-data/backups/postgres}"
KEEP_DAYS="${KEEP_DAYS:-14}"
COMPOSE_DIR="${COMPOSE_DIR:-/opt/impuls-data}"
CONTAINER="${POSTGRES_CONTAINER:-}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="${BACKUP_DIR}/impuls-${STAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

if [[ -z "$CONTAINER" ]]; then
  CONTAINER="$(docker ps --format '{{.Names}}' | grep -E 'postgres' | head -n1 || true)"
fi
: "${CONTAINER:?Postgres container not found}"

echo "[$(date -Is)] backup → ${OUT} (container=${CONTAINER})"

docker exec "$CONTAINER" \
  pg_dump -U impuls -d impuls --clean --if-exists --no-owner --no-privileges \
  | gzip -c > "$OUT"

chmod 600 "$OUT"
# удалить старше KEEP_DAYS
find "$BACKUP_DIR" -type f -name 'impuls-*.sql.gz' -mtime "+${KEEP_DAYS}" -delete

BYTES="$(wc -c < "$OUT" | tr -d ' ')"
echo "[$(date -Is)] ok size=${BYTES} keep_days=${KEEP_DAYS}"
