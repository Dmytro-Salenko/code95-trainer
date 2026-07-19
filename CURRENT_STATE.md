# Current State (Driver95)

## Последнее обновление
* **Дата**: 19 июля 2026 г.
* **Последние коммиты**: `13d00f3` (analytics v2.2), `1165aea`, `5ba1b8b`, `0c973c0` (analytics v2.0), `e813592`, `0f27037` (SEO)
* **Статус**: v0.3.0 — публичный MVP. Сбор продуктовой аналитики. Функциональный код заморожен.

---

## Статус проекта

Проект находится в стадии публичного MVP.

Основная задача текущего этапа — не добавление нового функционала, а накопление качественной продуктовой аналитики и первых реальных пользовательских данных.

SEO настроено. Google начал индексировать сайт. Продолжается публикация контента в YouTube Shorts и TikTok.

---

## Что завершено

### Технический SEO-аудит (2026-07-18)

1. Создан `robots.txt` с директивами Allow/Disallow и ссылкой на Sitemap.
2. Создан `sitemap.xml` с правильным `<loc>` для SPA.
3. Добавлен `favicon.ico`.
4. Полностью переписан `<head>` в `index.html`:
   - `<link rel="canonical">`
   - hreflang для 8 языков + `x-default`
   - Open Graph (og:type, og:title, og:description, og:image, og:url, og:locale)
   - Twitter Cards (summary)
   - Schema.org `WebApplication` (JSON-LD) с featureList и offers
   - `<meta name="robots" content="index, follow, ...">` с параметрами max-snippet
   - preconnect к Google Tag Manager
5. Удалён скрытый cloaking div (`left:-9999px`) — нарушение Google Webmaster Guidelines.
6. Обновлён `manifest.json`: добавлены `id`, `description`, `lang`, `scope`, `categories`, screenshots, shortcuts; split any/maskable icons.
7. `server.js`: добавлены явные маршруты для `/robots.txt`, `/sitemap.xml`, `/favicon.ico` с правильными Content-Type; `X-Robots-Tag: noindex` для `/admin`; `Cache-Control: immutable` для статики.
8. `<html lang="de">` исправлен на `lang="mul"` (ISO 639-2: multiple languages).
9. `aggregateRating` с фиктивными данными удалён во избежание мануальных санкций Google.

### Полностью переработана аналитическая система (2026-07-19)

Создан отдельный модуль `analytics.js` (v2.2).

Архитектура полностью отделена от бизнес-логики приложения. Замена Google Analytics на собственный backend потребует изменения только одного модуля.

**Исправлены архитектурные проблемы предыдущей реализации:**
- отключён `debug_mode` в production (управляется через `sessionStorage`);
- добавлен `keepalive: true` для отправки событий при закрытии вкладки;
- исправлена генерация `session_id`;
- аналитика полностью асинхронная (`setTimeout(0)`);
- аналитика не влияет на работу приложения даже при ошибках (try/catch на всех уровнях);
- высококардинальные параметры (`session_id`, `anonymous_user_id`, `timestamp`) исключены из GA4-транспорта;
- `device_type` исключён — GA4 собирает Device Category автоматически.

**Добавлены новые события:**
- `question_view` — просмотр каждого вопроса с `question_id`, `category`, `position`
- `answer_selected` — ответ с `answer_time_ms`, `is_correct`
- `question_passed` / `question_failed` — отдельные события для funnel-анализа
- `favorite_added` / `favorite_removed` — сигнал вовлечённости
- `learning_progress` — дневной снимок прогресса (learned/favorite/incorrect counts)

**Добавлены инструменты разработки:**
- `Analytics.enableDebug()` / `disableDebug()` — временный DebugView без правки кода
- `Analytics.smokeTest()` — запуск всех 12 событий с тестовыми данными из DevTools

**Реализована анонимная идентификация:**
- постоянный `anonymous_user_id` (UUID в localStorage)
- персональные данные не собираются, GDPR-safe

---

## Полный список событий GA4

| Событие | Когда |
|---|---|
| `app_open` | Запуск приложения |
| `test_started` | Старт сессии |
| `test_finished` | Завершение сессии |
| `test_abandoned` | Выход до завершения |
| `question_view` | Каждый показ вопроса |
| `answer_selected` | Ответ пользователя |
| `question_passed` | Правильный ответ |
| `question_failed` | Неправильный ответ |
| `favorite_added` | Добавление в избранное |
| `favorite_removed` | Удаление из избранного |
| `learning_progress` | Дневной снимок прогресса |
| `first_question_answered` | Первый ответ в сессии |
| `question_5_reached` | Milestone: 5-й вопрос |
| `question_10_reached` | Milestone: 10-й вопрос |
| `result_screen_viewed` | Экран результатов |
| `language_selected` | Смена языка |
| `pwa_installed` | Установка PWA |

---

## GA4: Custom Dimensions и Metrics

### Custom Dimensions (5)
- `mode` — режим теста (7 значений)
- `is_correct` — `"true"` / `"false"`
- `question_id` — ID вопроса (~300, ⚠️ следить при росте базы)
- `category` — категория вопроса
- `app_version` — версия приложения (низкая кардинальность)

### Custom Metrics (9)
- `correct_count`, `incorrect_count`, `score_pct`, `duration_sec`
- `answer_time_ms`, `questions_seen`, `elapsed_sec`
- `learned_count`, `favorite_count`

### НЕ регистрировать
`session_id`, `anonymous_user_id`, `timestamp`, `event_name`, `device_type`, `question_database_version`

Подробная документация: `docs/ANALYTICS.md`

---

## Production Status

✔ `analytics.js` — syntax check пройден  
✔ `app.js` — syntax check пройден  
✔ Smoke Test успешно выполнен (11/11 событий)  
✔ Все события соответствуют требованиям GA4  
✔ Service Worker v18 — кэш обновлён  
✔ Production Ready

---

## Принятые решения

**НЕ реализовывать до анализа первых данных:**
- таймер экзамена;
- новые игровые механики;
- регистрацию пользователей;
- собственный backend.

До накопления достаточной статистики основной приоритет — сбор данных.

---

## Следующие шаги

1. Push изменений в GitHub.
2. Настроить Custom Dimensions и Custom Metrics в Google Analytics (пошаговая инструкция в `docs/ANALYTICS.md`).
3. Проверить события через `Analytics.enableDebug()` и GA4 DebugView.
4. Начать накопление продуктовой аналитики.
5. Через несколько недель провести первый анализ поведения пользователей.

---

## Идеи в бэклог

- Таймер режима «Экзамен».
- Анализ сложности вопросов на основе собранных данных `question_failed`.
- Карта прогресса обучения пользователей.
- Определение среднего пути до успешной сдачи экзамена.
- Экосистема проектов с перекрёстными ссылками (Driver95 ↔ AVTOPLAKAT ↔ будущие проекты).
- Собственный backend для хранения аналитики (архитектура готова — достаточно изменить `_sendToGA4()`).

---

## История ключевых этапов

| Версия | Дата | Ключевое событие |
|---|---|---|
| v0.1.0 | Май 2026 | Первый запуск, 8 языков, базовые режимы |
| v0.2.0 | Июнь 2026 | Рефакторинг Избранного, Ошибок, Learn |
| v0.3.0 | Июль 2026 | Production hotfix I18N, SEO-аудит, Analytics v2.2 |
