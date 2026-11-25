#!/usr/bin/env bash
# Старый `npm run deploy` заливал только nuxt generate (без Nitro /api).
# Канон для прода — deploy:all.
set -euo pipefail

echo "✗ npm run deploy больше не заливает прод."
echo ""
echo "  Полный стек (сайт + API + админка):"
echo "    npm run deploy:all"
echo ""
echo "  Только статика nuxt generate (без /api):"
echo "    npm run deploy:static"
echo ""
exit 1
