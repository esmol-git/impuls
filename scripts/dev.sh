#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
ok() { printf '\033[32m✓\033[0m %s\n' "$*"; }
info() { printf '\033[36m→\033[0m %s\n' "$*"; }
warn() { printf '\033[33m!\033[0m %s\n' "$*"; }
die() { printf '\033[31m✗\033[0m %s\n' "$*" >&2; exit 1; }

need() {
  command -v "$1" >/dev/null 2>&1 || die "Нужна команда «$1»"
}

wait_http() {
  local url="$1" name="$2" attempts="${3:-60}"
  local i
  for ((i = 1; i <= attempts; i++)); do
    if curl -sf "$url" >/dev/null 2>&1; then
      ok "$name готов ($url)"
      return 0
    fi
    sleep 1
  done
  die "$name не ответил за ${attempts}s: $url"
}

wait_tcp() {
  local host="$1" port="$2" name="$3" attempts="${4:-60}"
  local i
  for ((i = 1; i <= attempts; i++)); do
    if (echo >/dev/tcp/"$host"/"$port") >/dev/null 2>&1; then
      ok "$name слушает $host:$port"
      return 0
    fi
    sleep 1
  done
  die "$name не открыл порт $host:$port за ${attempts}s"
}

need docker
need npm
need curl
need node

if ! docker info >/dev/null 2>&1; then
  die "Docker не запущен или нет доступа к docker.sock"
fi

ENV_FILE="$ROOT/apps/api/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  info "Создаю apps/api/.env из .env.example"
  cp "$ROOT/apps/api/.env.example" "$ENV_FILE"
  ok "apps/api/.env"
fi

bold "1/4 Docker: PostgreSQL + MinIO"
info "docker compose up -d postgres minio"
docker compose up -d postgres minio

info "Жду PostgreSQL…"
wait_tcp 127.0.0.1 5432 "PostgreSQL"

info "Жду MinIO…"
wait_http "http://127.0.0.1:9000/minio/health/live" "MinIO"

bold "2/4 База: migrate + seed"
info "prisma migrate deploy"
npm run prisma:migrate:deploy -w @impuls/api

info "prisma seed (идемпотентно)"
npm run db:seed

bold "3/4 Запуск API, админки и сайта"
PIDS=()

cleanup() {
  local code=$?
  trap - EXIT INT TERM
  echo ""
  warn "Останавливаю процессы разработки…"
  if ((${#PIDS[@]})); then
    kill "${PIDS[@]}" 2>/dev/null || true
    wait "${PIDS[@]}" 2>/dev/null || true
  fi
  ok "Готово. Docker (postgres/minio) оставлен запущенным — остановить: npm run db:down"
  exit "$code"
}
trap cleanup EXIT INT TERM

npm run dev:api &
PIDS+=($!)

npm run dev:admin &
PIDS+=($!)

npm run dev:site &
PIDS+=($!)

info "Жду API…"
wait_http "http://127.0.0.1:3001/api/settings/sections" "API" 90

bold "4/4 Локально запущено"
cat <<EOF

  Сайт:     http://localhost:3000
  Админка:  http://localhost:5173
  API:      http://localhost:3001
  MinIO:    http://localhost:9001  (minioadmin / minioadmin)

  Логин админки: admin@impuls.local / admin123

  Ctrl+C — остановить API/админку/сайт (Docker останется).

EOF

wait
