#!/usr/bin/env bash
# Загрузка локальных дампов Postgres в Cloudflare R2 (S3 API) через rclone.
# Вызывается из backup-postgres.sh, если есть offsite.env.
set -euo pipefail

ENV_FILE="${OFFSITE_ENV:-/opt/impuls-data/backups/offsite.env}"
BACKUP_DIR="${BACKUP_DIR:-/opt/impuls-data/backups/postgres}"
RCLONE_CONF="${RCLONE_CONFIG_FILE:-/opt/impuls-data/backups/rclone.conf}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[$(date -Is)] offsite skip: нет $ENV_FILE"
  exit 0
fi

# shellcheck disable=SC1090
set -a && source "$ENV_FILE" && set +a

if [[ -z "${R2_ACCOUNT_ID:-}" || -z "${R2_ACCESS_KEY_ID:-}" || -z "${R2_SECRET_ACCESS_KEY:-}" ]]; then
  echo "[$(date -Is)] offsite skip: заполните R2_* в $ENV_FILE"
  exit 0
fi

: "${R2_BUCKET:=impuls-backups}"
R2_PREFIX="${R2_PREFIX:-postgres}"
R2_KEEP_DAYS="${R2_KEEP_DAYS:-30}"

if ! command -v rclone >/dev/null 2>&1; then
  echo "[$(date -Is)] offsite ERROR: rclone не установлен"
  exit 1
fi

umask 077
cat > "$RCLONE_CONF" <<EOF
[impuls-r2]
type = s3
provider = Cloudflare
access_key_id = ${R2_ACCESS_KEY_ID}
secret_access_key = ${R2_SECRET_ACCESS_KEY}
endpoint = https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com
acl = private
no_check_bucket = true
EOF
chmod 600 "$RCLONE_CONF"

export RCLONE_CONFIG="$RCLONE_CONF"
REMOTE="impuls-r2:${R2_BUCKET}/${R2_PREFIX}"

# залить все локальные дампы (rclone сам пропустит уже существующие по размеру/имени)
echo "[$(date -Is)] offsite sync → ${REMOTE}"
rclone copy "$BACKUP_DIR" "$REMOTE" \
  --include 'impuls-*.sql.gz' \
  --transfers 2 \
  --checkers 4 \
  --s3-no-check-bucket \
  -v

# ротация на R2
echo "[$(date -Is)] offsite prune older than ${R2_KEEP_DAYS}d"
rclone delete "$REMOTE" \
  --include 'impuls-*.sql.gz' \
  --min-age "${R2_KEEP_DAYS}d" \
  --s3-no-check-bucket \
  -v || true

echo "[$(date -Is)] offsite ok"
rclone lsl "$REMOTE" --include 'impuls-*.sql.gz' --s3-no-check-bucket | tail -n 5 || true
