# Футбольная школа «Импульс»

Монорепо: публичный сайт (Nuxt 4), NestJS API и Vue-админка.

## Стек

- **Nuxt 4** — сайт, SEO, анимации
- **NestJS + Prisma + PostgreSQL** — API, авторизация, заявки, медиа
- **MinIO** — хранение загрузок (S3 API), конвертация в WebP на сервере (sharp)
- **Vue 3 + Vite + Element Plus** — админка (формы, таблицы, диалоги)
- **Tailwind CSS** — стили сайта и лэйаут админки

## Структура

```
app/                 # Nuxt-приложение (страницы, компоненты, data)
server/              # Nuxt server routes (прокси заявок)
apps/
├── api/             # NestJS API (:3001)
└── admin/           # Vue админка (:5173)
docker-compose.yml   # PostgreSQL + MinIO
```

## Локальный запуск

Одной командой (Docker + migrate/seed + API + админка + сайт):

```bash
npm install
npm run dev:all
```

Скрипт поднимет PostgreSQL и MinIO, применит миграции, засеет админа и запустит всё в одном терминале.  
Остановка: `Ctrl+C` (контейнеры останутся — `npm run db:down`).

Вручную, по шагам:

```bash
npm install
npm run db:up                 # PostgreSQL :5432 + MinIO :9000 (console :9001)
cp apps/api/.env.example apps/api/.env   # если ещё нет
npm run db:migrate            # миграции Prisma
npm run db:seed               # создаёт админа, если его ещё нет (по умолчанию admin@impuls.local / admin123)

# в трёх терминалах:
npm run dev:api               # http://localhost:3001
npm run dev:admin             # http://localhost:5173
npm run dev                   # http://localhost:3000
```

Переменная `NUXT_API_URL=http://localhost:3001` нужна сайту, чтобы сохранять заявки в Nest (по умолчанию уже так).

Загрузки: админка шлёт файл на `POST /api/admin/media/upload` → API конвертирует в **WebP** (sharp) и кладёт в **MinIO**. Отдача на сайт/админку — через `GET /uploads/:key` (прокси API, старые локальные файлы тоже отдаются).

## Админка

- Dev URL: http://localhost:5173 (проксирует `/api` и `/uploads` на Nest `:3001`)
- Логин по умолчанию (только при первом seed): `admin@impuls.local` / `admin123` (роль `ADMIN`). Повторный seed пароль не меняет; сброс — `SEED_RESET_ADMIN_PASSWORD=1`. В production-сборке поля логина пустые.
- Роли: `ADMIN` (всё + пользователи), `MANAGER` (контент и заявки)
- Auth: access JWT (15m) + refresh token (7d); при истечении сессии — редирект на `/login`
- Разделы: дашборд, заявки (поиск), каталог, новости (TipTap), отзывы, настройки (блоки главной, корзина/избранное), пользователи (только админ)

### Деплой на один сервер (витрина + API + админка)

На проде витрина — **Nuxt Node** (`npm run build`), не «голая» статика: браузер бьёт в `/api/catalog`, `/api/lead` и т.д. — это Nitro-роуты Nuxt, они проксируют в Nest. Картинки — `/uploads/*` с Nest.

```
интернет
   ├─ impuls.…      → Caddy → Nuxt :3000  (+ /uploads → Nest :3001)
   └─ admin.impuls.… → Caddy → статика админки (+ /api,/uploads → Nest :3001)
                                    Nest :3001 ← PostgreSQL / MinIO
```

```bash
cp deploy/env.example .env.deploy   # DEPLOY_HOST, URL-ы
npm run deploy:all                  # сборка + rsync + migrate + restart unit-ов
```

На сервере один раз:

1. Node 20+, PostgreSQL, MinIO (или docker compose)
2. `apps/api/.env` с `NODE_ENV=production`, сильным `JWT_SECRET`, `CORS_ORIGIN=https://impuls.…,https://admin.impuls.…`
3. Unit-файлы: `deploy/systemd/impuls-api.service`, `impuls-site.service`
4. Caddy: `deploy/caddy-impuls.snippet` (или Nginx: `deploy/nginx-impuls.conf`)
5. DNS: `impuls.…` и `admin.impuls.…` → сервер

Старый `npm run deploy` заливает только `nuxt generate` (статика без Nitro `/api`) — для полного стека используйте `deploy:all`.

## Заявки с сайта

Форма на сайте бьёт в `POST /api/lead` (Nuxt). Хендлер:

1. сохраняет заявку в Nest (`POST /api/leads`);
2. опционально шлёт уведомление в Telegram.

## API (кратко)

Публично:

- `POST /api/leads`
- `GET /api/media?type=CATALOG|NEWS|REVIEW`

Админ (Bearer JWT):

- `POST /api/auth/login`, `GET /api/auth/me`
- CRUD `/api/admin/media` + `POST /api/admin/media/upload`
- `GET/PATCH/DELETE /api/admin/leads`, `GET /api/admin/leads/:id` (поиск `?q=`)
- `GET /api/admin/stats`

## Сайт — скрипты

```bash
npm run generate   # статическая сборка
npm run preview    # превью production-сборки
```
