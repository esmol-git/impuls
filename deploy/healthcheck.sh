#!/usr/bin/env bash
# Локальная проверка API/сайта; при падении — restart unit + запись в лог.
set -euo pipefail

LOG="${HEALTH_LOG:-/var/log/impuls-health.log}"
API_URL="${API_URL:-http://127.0.0.1:3001/api/health}"
SITE_URL="${SITE_URL:-http://127.0.0.1:3000/}"
TIMEOUT="${TIMEOUT:-8}"

ts="$(date -Is)"
ok=1

check() {
  local name="$1" url="$2"
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' --connect-timeout "$TIMEOUT" --max-time "$TIMEOUT" "$url" || echo 000)"
  if [[ "$code" != "200" ]]; then
    echo "${ts} FAIL ${name} code=${code} url=${url}" | tee -a "$LOG"
    ok=0
    return 1
  fi
  echo "${ts} OK ${name} code=${code}" >> "$LOG"
  return 0
}

api_ok=0
site_ok=0
check api "$API_URL" && api_ok=1 || true
check site "$SITE_URL" && site_ok=1 || true

if [[ "$api_ok" -eq 0 ]]; then
  echo "${ts} action=restart impuls-api" | tee -a "$LOG"
  systemctl restart impuls-api || true
fi
if [[ "$site_ok" -eq 0 ]]; then
  echo "${ts} action=restart impuls-site" | tee -a "$LOG"
  systemctl restart impuls-site || true
fi

# ротация лога ~1MB
if [[ -f "$LOG" ]] && [[ "$(wc -c < "$LOG")" -gt 1000000 ]]; then
  mv "$LOG" "${LOG}.1"
fi

exit "$ok"
