# Деплой

Сейчас основной путь — **Vercel + Neon** (без покупки VPS). Docker/VPS остаётся запасным вариантом для `cocos.kz` в Казахстане.

## A. Vercel + Neon (рекомендуется сейчас)

### 1. База Neon (бесплатно)

1. Зайти на [neon.tech](https://neon.tech) → Create project.
2. Скопировать две строки:
   - **Pooled** → `DATABASE_URL`
   - **Direct** → `DIRECT_URL`

### 2. GitHub

Репозиторий: `https://github.com/ITAcceleratorNX/cocos`

Закоммитить и запушить актуальный код на `main`.

### 3. Vercel

1. [vercel.com/new](https://vercel.com/new) → Import `ITAcceleratorNX/cocos`.
2. Framework: Next.js (авто).
3. Environment Variables (Production):

| Key | Значение |
|-----|----------|
| `DATABASE_URL` | Neon pooled |
| `DIRECT_URL` | Neon direct |
| `NEXT_PUBLIC_APP_URL` | `https://<ваш-проект>.vercel.app` (потом обновить) |
| `ADMIN_EMAIL` | `admin@cocos.kz` |
| `ADMIN_PASSWORD` | сильный пароль |
| `CRON_SECRET` | длинный random |
| `MOCK_SMS` | `true` |
| `MOCK_SMS_CODE` | `000000` |
| `DEFAULT_COMMISSION_RATE` | `15` |
| `ATTRIBUTION_PHONE_DAYS` | `30` |
| `KASPI_API_TOKEN` | пока пусто |
| `KASPI_API_BASE` | `https://kaspi.kz/shop/api/v2` |

4. Deploy. На билде уйдёт `prisma migrate deploy`.

### 4. Seed (один раз)

После первого деплоя локально (с Neon URL в `.env`):

```bash
export DATABASE_URL="…neon pooled…"
export DIRECT_URL="…neon direct…"
npm run db:seed
```

Или через Vercel CLI:

```bash
vercel env pull .env.vercel
# подставить в shell и
npm run db:seed
```

### 5. Проверка

- `https://<app>.vercel.app/api/health`
- `/p/aigerim`, `/cabinet/login`, `/admin/login`

### 6. Домен cocos.kz (когда будет DNS)

В Vercel → Project → Settings → Domains → добавить `cocos.kz` и `www`.  
В PS.kz DNS: CNAME `www` → `cname.vercel-dns.com`, для корня — A/ALIAS по подсказке Vercel.  
Обновить `NEXT_PUBLIC_APP_URL=https://cocos.kz`.

### 7. Cron Kaspi

В `vercel.json` — раз в час `/api/cron/kaspi-sync`.  
На **Hobby** Vercel может ограничить частоту (часто 1×/день) — на Pro будет почасовой.  
Нужен `CRON_SECRET` и позже `KASPI_API_TOKEN`.

---

## B. VPS + Docker (позже, PS.kz)

См. git history / оставить файлы `Dockerfile`, `docker-compose.prod.yml`, `deploy/nginx.conf`.  
Имеет смысл, если потребуют хостинг строго в KZ.

1. VPS Ubuntu + Docker  
2. DNS A → IP  
3. `docker compose -f docker-compose.prod.yml up -d --build`
