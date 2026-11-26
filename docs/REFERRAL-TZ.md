# Реферальная система (ТЗ MVP)

Сайт: https://cocos-nu.vercel.app/

## Реализовано

- Регистрация клиента → роль client (`Partner` APPROVED) + `referralCode` (COCO001…)
- Вход клиента: телефон (SMS/Mobizon или mock `000000`) или email
- Вход админа: `/admin/login`
- Ссылки: `/product/{slug}?ref=COCO001`
- События: `OPEN` (открытие), `KASPI_CLICK` (до редиректа через `/go/kaspi/{slug}`)
- Last-touch cookie `cocos_ref_code`; уникальность по `visitorId`
- Кабинет клиента: ссылки, статистика, бонусы
- Админ: `/admin/clients`, `/admin/analytics`, ручное начисление бонусов + история
- Исключение self-click и простых ботов; дедуп 3 сек

## Mobizon

Ключ: `MOBIZON_API_KEY` (спросить Дамира / Жубаныша).  
Пока пусто + `MOCK_SMS=true` — код в ответе API / консоли.

Fallback: вкладка Email на `/cabinet/login` + опционально `RESEND_API_KEY`.

## Не в объёме ТЗ

Авто-% с покупок Kaspi, автовыплаты, Excel, модерация регистрации.
