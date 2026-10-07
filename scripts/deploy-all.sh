#!/usr/bin/env bash
# Сборка и выкладка витрины (Nuxt Node) + API + админки на один сервер.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env.deploy ]]; then
  # shellcheck disable=SC1091
  set -a && source .env.deploy && set +a
fi

: "${DEPLOY_HOST:?Укажите DEPLOY_HOST в .env.deploy (см. deploy/env.example)}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_APP_PATH="${DEPLOY_APP_PATH:-/opt/impuls}"
DEPLOY_ADMIN_PATH="${DEPLOY_ADMIN_PATH:-/var/www/admin.impuls.esmolakov.ru}"
NUXT_SITE_URL="${NUXT_SITE_URL:-https://impuls.esmolakov.ru}"
NUXT_API_URL="${NUXT_API_URL:-http://127.0.0.1:3001}"

SSH_OPTS=(-p "${DEPLOY_PORT}" -o BatchMode=yes -o StrictHostKeyChecking=accept-new)
SSH=(ssh "${SSH_OPTS[@]}" "${DEPLOY_USER}@${DEPLOY_HOST}")
RSYNC=(rsync -avz --delete -e "ssh ${SSH_OPTS[*]}")

echo "→ Сборка Nest API..."
npm run build:api

echo "→ Сборка админки..."
npm run build:admin

echo "→ Сборка витрины (Nuxt Node, не generate)..."
NUXT_SITE_URL="$NUXT_SITE_URL" NUXT_API_URL="$NUXT_API_URL" npm run build

echo "→ Синхронизация приложения → ${DEPLOY_APP_PATH}"
"${SSH[@]}" "mkdir -p '${DEPLOY_APP_PATH}' '${DEPLOY_ADMIN_PATH}'"

# Код + сборки (без node_modules и секретов; .env на сервере не трогаем)
"${RSYNC[@]}" \
  --exclude node_modules \
  --exclude .git \
  --exclude .github \
  --exclude .nuxt \
  --exclude .env \
  --exclude '.env.*' \
  --exclude apps/api/.env \
  --exclude deploy/secrets \
  --exclude apps/admin/node_modules \
  --exclude apps/api/node_modules \
  --exclude apps/admin/dist \
  --exclude apps/api/uploads \
  --exclude .output \
  ./ "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_APP_PATH}/"

"${RSYNC[@]}" \
  .output/ "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_APP_PATH}/.output/"

"${RSYNC[@]}" \
  apps/api/dist/ "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_APP_PATH}/apps/api/dist/"

# Prisma schema + migrations нужны на сервере для migrate deploy
"${RSYNC[@]}" \
  apps/api/prisma/ "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_APP_PATH}/apps/api/prisma/"

echo "→ Статика админки → ${DEPLOY_ADMIN_PATH}"
"${RSYNC[@]}" \
  apps/admin/dist/ "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_ADMIN_PATH}/"

echo "→ Установка зависимостей и миграции на сервере..."
"${SSH[@]}" bash -s <<EOF
set -euo pipefail
cd '${DEPLOY_APP_PATH}'
# lockfile от npm 11; на сервере нужен npm >= 11
npm ci --omit=dev
cd apps/api
npx prisma migrate deploy
npx prisma generate
systemctl restart impuls-api impuls-site || true
EOF

echo ""
echo "✓ Выложено:"
echo "  Витрина:  ${NUXT_SITE_URL}  (Nuxt :3000, /uploads → Nest)"
echo "  Админка:  ${ADMIN_SITE_URL:-https://admin.…}  (статика, /api+/uploads → Nest)"
echo "  API:      127.0.0.1:3001"
echo ""
echo "  На сервере должны быть unit-файлы из deploy/systemd/ и Caddy/Nginx из deploy/."
echo "  Nest .env: CORS_ORIGIN должен включать оба публичных origin."
