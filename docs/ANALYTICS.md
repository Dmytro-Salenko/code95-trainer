# Driver95 Analytics — Документация v2.1

> Последнее обновление: 2026-07-19 · Коммит `5ba1b8b`  
> Прошла финальный аудит перед публикацией.

---

## Архитектура

```
analytics.js   ← единственный модуль аналитики (IIFE, window.Analytics)
    │
    ├── GA4 transport     → gtag('event', name, params)   ← фильтрованные параметры
    ├── Local queue       → localStorage                  ← полный payload
    └── Backend (опц.)   → POST /api/analytics            ← полный payload

Правило: app.js вызывает только Analytics.*
Никакой прямой работы с gtag / localStorage / fetch вне analytics.js.
```

**Как заменить GA4 на свой backend:** изменить только функцию `_sendToGA4()` в `analytics.js`. Код `app.js` менять не нужно.

---

## Smoke Test (DevTools)

```javascript
// 1. Запустить все события с тестовыми данными:
Analytics.smokeTest()

// 2. Проверить локальную очередь:
JSON.parse(localStorage.getItem('driver95_analytics_events'))

// 3. Включить GA4 DebugView (временно, без правки кода):
Analytics.enableDebug()   // → перезагрузить страницу → проверить GA4 DebugView
Analytics.disableDebug()  // → перезагрузить страницу → выключить
```

> **Важно:** `enableDebug()` использует `sessionStorage` — флаг автоматически сбрасывается при закрытии вкладки. В production-код не попадает.

---

## События (Event Inventory)

### 1. `app_open`
Запуск приложения.

| Параметр в GA4 | Тип | Описание |
|---|---|---|
| `language` | string | Язык интерфейса |
| `app_version` | string | Версия приложения |
| `device_type` | string | `mobile` / `tablet` / `desktop` |

---

### 2. `test_started`
Старт любой сессии (Learn, Exam, Mistakes, Favorites, Random).

| Параметр в GA4 | Тип | Описание |
|---|---|---|
| `mode` | string | `learn`, `exam`, `mistakes`, `random`, `favorites`, `lastCorrect`, `lastIncorrect` |
| `language` | string | Язык |
| `total_questions` | number | Кол-во вопросов в сессии |

> `session_id` **не передаётся в GA4** (высокая кардинальность — уникальный UUID на каждую сессию). Хранится в локальной очереди.

---

### 3. `test_finished`
Завершение сессии (пользователь дошёл до экрана результатов).

| Параметр в GA4 | Тип | Описание |
|---|---|---|
| `mode` | string | |
| `language` | string | |
| `total_questions` | number | |
| `correct_count` | number | ✦ Custom Metric |
| `incorrect_count` | number | ✦ Custom Metric |
| `score_pct` | number | ✦ Custom Metric (0–100) |
| `duration_sec` | number | ✦ Custom Metric |

---

### 4. `test_abandoned`
Выход из сессии до завершения (кнопка «Назад» или закрытие вкладки).

| Параметр в GA4 | Тип | Описание |
|---|---|---|
| `mode` | string | |
| `language` | string | |
| `questions_seen` | number | ✦ Custom Metric — сколько вопросов успел увидеть |
| `elapsed_sec` | number | ✦ Custom Metric — время до выхода |

---

### 5. `question_view`
Просмотр вопроса — срабатывает при каждом рендере.

| Параметр в GA4 | Тип | Описание |
|---|---|---|
| `question_id` | number | ✧ Custom Dimension — см. примечание о кардинальности |
| `language` | string | |
| `category` | string\|null | ✧ Custom Dimension |
| `mode` | string | |
| `position` | number | ✦ Custom Metric (позиция в сессии) |

---

### 6. `answer_selected`
Ответ пользователя. Основное событие воронки обучения.

| Параметр в GA4 | Тип | Описание |
|---|---|---|
| `question_id` | number | ✧ Custom Dimension |
| `is_correct` | string | ✧ Custom Dimension — `"true"` / `"false"` |
| `answer_time_ms` | number | ✦ Custom Metric — время обдумывания в мс |
| `language` | string | |
| `mode` | string | |

> `is_correct` передаётся как **строка** (`"true"` / `"false"`), не boolean. GA4 Custom Dimensions — текстовые; boolean-значения должны быть строками для корректной работы фильтров.

---

### 7. `question_passed`
Правильный ответ. Удобный фильтр для funnel/retention-анализа.

| Параметр в GA4 | Тип |
|---|---|
| `question_id` | number |
| `language` | string |
| `mode` | string |

---

### 8. `question_failed`
Неправильный ответ. Позволяет найти топ трудных вопросов.

| Параметр в GA4 | Тип |
|---|---|
| `question_id` | number |
| `language` | string |
| `mode` | string |

---

### 9. `favorite_added` / `favorite_removed`
Работа с избранным. Сигнал вовлечённости.

| Параметр в GA4 | Тип |
|---|---|
| `question_id` | number |
| `language` | string |

---

### 10. `learning_progress`
Агрегированный снимок прогресса. Не чаще 1 раза в сутки + после каждого `test_finished`.

| Параметр в GA4 | Тип | Описание |
|---|---|---|
| `learned_count` | number | ✦ Custom Metric |
| `favorite_count` | number | ✦ Custom Metric |
| `incorrect_count` | number | ✦ Custom Metric |
| `language` | string | |
| `total_questions` | number | Всего вопросов в базе |

---

### 11. Прочие события (legacy)

| Событие | Когда |
|---|---|
| `first_question_answered` | Первый ответ в сессии |
| `question_5_reached` | Пользователь дошёл до 5-го вопроса |
| `question_10_reached` | Пользователь дошёл до 10-го вопроса |
| `result_screen_viewed` | Экран результатов открыт |
| `language_selected` | Смена языка |
| `pwa_installed` | Установка PWA |

---

## Пользовательские свойства (User Properties)

Устанавливаются один раз при инициализации GA4.

| Свойство | Значение |
|---|---|
| `app_version` | `0.3.0` |
| `device_type` | `mobile` / `tablet` / `desktop` |
| `db_version` | `v2.0` |

---

## GA4: Что регистрировать

### ✧ Custom Dimensions (текстовые параметры)

| Название в GA4 | Параметр события | Область | Примечание |
|---|---|---|---|
| App Mode | `mode` | Event | 7 значений |
| Answer Correct | `is_correct` | Event | `"true"` / `"false"` |
| Question ID | `question_id` | Event | ⚠️ ~300 значений сейчас — приемлемо; пересмотреть при базе >500 |
| Question Category | `category` | Event | Если категории добавлены в data.js |

### ✦ Custom Metrics (числовые параметры для AVG/SUM)

| Название в GA4 | Параметр события | Единица |
|---|---|---|
| Correct Answers | `correct_count` | Штуки |
| Incorrect Answers | `incorrect_count` | Штуки |
| Score Percent | `score_pct` | Процент |
| Duration (sec) | `duration_sec` | Секунды |
| Answer Time (ms) | `answer_time_ms` | Миллисекунды |
| Questions Seen | `questions_seen` | Штуки |
| Elapsed Seconds | `elapsed_sec` | Секунды |
| Learned Count | `learned_count` | Штуки |
| Favorite Count | `favorite_count` | Штуки |
| Incorrect Count | `incorrect_count` | Штуки |

### ✗ НЕ регистрировать как Custom Dimension

| Параметр | Причина |
|---|---|
| `session_id` | UUID — неограниченная кардинальность, разрушает GA4 отчёты |
| `anonymous_user_id` | UUID — аналогично; передаётся через `user_id` в gtag config, не как event param |
| `timestamp` | GA4 ставит своё время; наша строка — дублирование |
| `event_name` | Уже является именем события в gtag |
| `question_database_version` | Внутренняя версия; регистрировать нет смысла |
| `total_questions` | Константа (298) — бесполезно как Dimension |
| `position` | Число 1–40; полезна только как Metric для AVG |
| `app_version` | Регистрируется как User Property — достаточно |
| `device_type` | Регистрируется как User Property |

---

## Пошаговая настройка GA4

### Шаг 1. Custom Dimensions

**GA4 → Администрирование → Пользовательские определения → Пользовательские параметры**

Нажать «Создать пользовательский параметр» для каждой строки:

| Название | Область | Параметр события |
|---|---|---|
| App Mode | Событие | `mode` |
| Answer Correct | Событие | `is_correct` |
| Question ID | Событие | `question_id` |
| Question Category | Событие | `category` |

---

### Шаг 2. Custom Metrics

**GA4 → Администрирование → Пользовательские определения → Пользовательские метрики**

| Название | Параметр события | Единица измерения |
|---|---|---|
| Correct Answers | `correct_count` | Стандартное (число) |
| Incorrect Answers | `incorrect_count` | Стандартное |
| Score Percent | `score_pct` | Стандартное |
| Test Duration (sec) | `duration_sec` | Стандартное |
| Answer Time (ms) | `answer_time_ms` | Стандартное |
| Questions Seen | `questions_seen` | Стандартное |
| Elapsed Seconds | `elapsed_sec` | Стандартное |
| Learned Count | `learned_count` | Стандартное |
| Favorite Count | `favorite_count` | Стандартное |
| Incorrect Count (progress) | `incorrect_count` | Стандартное |

> **Лимит GA4:** 50 Custom Dimensions + 50 Custom Metrics на Property.  
> Мы используем 4 Dimensions и 10 Metrics — запаса достаточно.

---

### Шаг 3. Отправить Sitemap в GSC

**Google Search Console → Sitemaps → Добавить sitemap:**  
`https://driver95.eu/sitemap.xml`

---

### Шаг 4. Проверить DebugView

```javascript
// В DevTools Console на driver95.eu:
Analytics.enableDebug()
// Перезагрузить страницу
// GA4 → DebugView — события появятся через ~10 секунд
Analytics.disableDebug()  // после проверки
```

---

### Шаг 5. Настроить Explorations

#### 5.1 Воронка обучения
`GA4 → Исследования → Воронка`
```
Шаг 1: test_started
Шаг 2: question_view
Шаг 3: answer_selected
Шаг 4: test_finished
```
Разбить по `mode`.

#### 5.2 Топ трудных вопросов
`GA4 → Исследования → Free Form`
- Строки: Custom Dimension `Question ID`
- Метрика: `event_count` для `question_failed`
- Сортировка: убывание

#### 5.3 Среднее время ответа
- Метрика: Custom Metric `Answer Time (ms)` → среднее
- Разбивка по `language` и `mode`

#### 5.4 Completion Rate
- `event_count(test_finished)` / `event_count(test_started)` × 100
- Строки: `mode`

#### 5.5 Вовлечённые пользователи
- Аудитория: пользователи с хотя бы 1 `favorite_added`
- Сравнить Retention с остальными

---

## Идентификация пользователей

- `anonymous_user_id` — постоянный UUID в `localStorage('driver95_anon_user_id')`
- Передаётся как `user_id` в `gtag('config', ...)` — используется GA4 для cross-session identity
- **Не передаётся как event-параметр в GA4** — только в локальную очередь и собственный backend
- Не содержит email, имени или других персональных данных — GDPR-safe

---

## Производительность

- Все события: `setTimeout(0)` — не блокируют UI
- Ошибки: `try/catch` на всех уровнях — аналитика не может сломать приложение
- GA4 transport: null-фильтрация + удаление зарезервированных/избыточных полей
- `keepalive: true` на backend fetch — событие отправляется даже при закрытии страницы
- Локальная очередь: cap 500 событий (~50 KB)
- `debug_mode`: только через `sessionStorage` — никогда не попадает в production-код
