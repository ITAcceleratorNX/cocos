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

### 6. Домен cocos.kz (PS.kz → Vercel)

Проект сейчас: `https://cocos-nu.vercel.app`

**A. Vercel**

1. Project **cocos** → **Settings → Domains**
2. Add: `cocos.kz` и `www.cocos.kz`
3. Primary: `cocos.kz` (www → redirect на корень)

**B. DNS в PS.kz** (зона `cocos.kz`, NS уже `ns1/ns2/ns3.ps.kz`)

| Тип | Имя / Host | Значение |
|-----|------------|----------|
| **A** | `@` (или пусто / cocos.kz) | `76.76.21.21` |
| **CNAME** | `www` | `cname.vercel-dns.com` |

Если Vercel покажет другие IP/значения в Domains — ставьте **их**.  
Удалите старые конфликтующие A/CNAME на `@` и `www`.

**C. Env на Vercel**

`NEXT_PUBLIC_APP_URL` = `https://cocos.kz` → Save → **Redeploy** Production.

Проверка: `https://cocos.kz` и `https://www.cocos.kz` (SSL выпустит Vercel сам, 5–30 мин после DNS).

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
