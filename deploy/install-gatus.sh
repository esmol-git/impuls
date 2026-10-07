#!/usr/bin/env bash
# Установка / обновление Gatus status-page на сервере.
# Запуск на VPS: bash /opt/impuls/deploy/install-gatus.sh
set -euo pipefail

SRC="${GATUS_SRC:-/opt/impuls/deploy/gatus}"
DST="${GATUS_DST:-/opt/impuls-data/gatus}"

mkdir -p "$DST"
cp "$SRC/config.yaml" "$DST/config.yaml"
cp "$SRC/docker-compose.yml" "$DST/docker-compose.yml"
if [[ ! -f "$DST/.env" ]]; then
  cp "$SRC/.env.example" "$DST/.env"
  chmod 600 "$DST/.env"
fi

cd "$DST"
docker compose pull
docker compose up -d
docker compose ps
curl -sS -o /dev/null -w "gatus_local=%{http_code}\n" http://127.0.0.1:8080/ || true
echo "OK → откройте https://status.esmolakov.ru (нужна A-запись DNS)"
