# CoCo’s Partner (MVP)

Партнёрская программа для бренда CoCo’s: личные ссылки → трафик из Instagram/TikTok → покупки в Kaspi → учёт комиссии.

Стек: **Next.js 15 + TypeScript + Postgres (Prisma)**.

## Что уже есть (Этап 1)

| Зона | Готово |
|------|--------|
| `/` | Витрина из `cocos-landing` |
| `/partner` | Заявка партнёра |
| `/p/{nick}`, `/p/{nick}/{product}` | Страницы партнёра + клик + cookie 30 дней |
| `/go/{nick}/{product}` | Редирект в Kaspi с записью клика |
| Форма телефона → Lead | Перед уходом в Kaspi |
| `/cabinet` | Вход, ссылки, QR, статистика, реквизиты + bio |
| `/admin` | Партнёры (ставка), **CRUD каталога**, заказы, статус, Excel, «выплачено» |
| Kaspi probe | `npm run kaspi:probe` (когда дадут токен) |
| Модель данных | Partner, Product, Click, Lead, KaspiOrder, Attribution, Commission |

## Быстрый старт (локально)

```bash
# 1. Postgres
docker compose up -d   # Postgres на порту 5433

# 2. Env
cp .env.example .env

# 3. Миграции + seed
npm install
npx prisma migrate dev --name init
npm run db:seed

# 4. Dev-сервер
npm run dev
```

Прод сейчас через **Vercel + Neon**: см. [DEPLOY.md](./DEPLOY.md).  
Блокеры для ПМ: [docs/PM-BLOCKERS.md](./docs/PM-BLOCKERS.md).

Открыть:

- Сайт: http://localhost:3000  
- Demo партнёр: http://localhost:3000/p/aigerim  
- Кабинет: http://localhost:3000/cabinet/login (телефон `77001112233`, код `000000`)  
- Админка: http://localhost:3000/admin/login (`admin@cocos.kz` / `cocos-admin`)

## Критерий MVP (чек)

1. Партнёр регистрируется на `/partner`
2. Админ одобряет в `/admin/partners`
3. Ссылка `/p/{nick}` работает, клик пишется
4. Лид с телефоном сохраняется
5. Заказ Kaspi вводится вручную в `/admin/orders` и привязывается
6. Excel: `/admin/payouts` → «Скачать Excel»

## Этапы

- **Этап 0** (до 27.11.2026) — токен Kaspi API, тест `customer.cellPhone`, 6 вопросов Kaspi  
- **Этап 1** (до 11.12.2026) — этот MVP  
- **Этап 2** (до 15.01.2027) — cron заказов раз в час, автопривязка, кабинет статистики  
- **Этап 3** (до 29.01.2027) — конкурсы, материалы, KZ, дашборд  

Старт партнёров в клинике «Рахат»: **5 декабря 2026**.

## Важно

- Своей корзины/оплаты/доставки нет — всё в Kaspi.
- Переход ≠ покупка. Комиссия только после `COMPLETED`.
- `KASPI_API_TOKEN` — только server env, никогда в клиент.
- Ставка комиссии по умолчанию `15%` (пока не утвердил заказчик).

## Структура

```text
public/landing/     # готовый static лендинг
prisma/             # schema + seed
src/app/            # роуты Next.js
src/lib/            # prisma, auth, attribution, commission
```
