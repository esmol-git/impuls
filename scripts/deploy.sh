#!/usr/bin/env bash
# Только статика витрины (nuxt generate). Без Nitro /api на сервере.
# Для витрины + API + админки на одном сервере: npm run deploy:all
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env.deploy ]]; then
  # shellcheck disable=SC1091
  set -a && source .env.deploy && set +a
fi

: "${DEPLOY_HOST:?Укажите DEPLOY_HOST в .env.deploy (см. deploy/env.example)}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/impuls.esmolakov.ru}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
NUXT_SITE_URL="${NUXT_SITE_URL:-https://impuls.esmolakov.ru}"

echo "→ Сборка статики (nuxt generate)..."
NUXT_SITE_URL="$NUXT_SITE_URL" npm run generate

echo "→ Загрузка на ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH} ..."
rsync -avz --delete \
  -e "ssh -p ${DEPLOY_PORT}" \
  .output/public/ \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"

echo ""
echo "✓ Статика залита: ${NUXT_SITE_URL}"
echo "  Внимание: без Nuxt Node на сервере не будут работать /api/* (заявки, каталог)."
echo "  Полный стек: npm run deploy:all + deploy/caddy-impuls.snippet"
