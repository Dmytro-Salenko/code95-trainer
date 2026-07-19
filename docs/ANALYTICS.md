# Driver95 Analytics — Документация v2.0

> Последнее обновление: 2026-07-19 · Коммит `0c973c0`

---

## Архитектура

```
analytics.js   ← единственный модуль аналитики
    │
    └── window.Analytics (public API)
            │
            ├── testStarted()       \
            ├── testFinished()       |
            ├── testAbandoned()      |
            ├── questionViewed()     |  Named helpers
            ├── answerSelected()     |  (preferred)
            ├── questionPassed()     |
            ├── questionFailed()     |
            ├── favoriteAdded()      |
            ├── favoriteRemoved()    |
            ├── learningProgress()  /
            │
            ├── track()             ← legacy shim (backward compat)
            ├── generateSessionId() ← UUID generator
            └── maybeTrackDailyProgress()
```

**Правило:** app.js вызывает только `Analytics.*`. Никакой прямой работы с `gtag`, `localStorage`, `fetch` внутри app.js.

---

## События (Event Inventory)

### 1. `app_open`
Открытие приложения.

| Параметр | Тип | Описание |
|---|---|---|
| `language` | string | Текущий язык интерфейса |
| `anonymous_user_id` | string | Постоянный UUID пользователя |
| `device_type` | string | `mobile` / `tablet` / `desktop` |
| `app_version` | string | `0.3.0` |

---

### 2. `test_started`
Старт любой сессии (Learn, Exam, Mistakes, Favorites, Random).

| Параметр | Тип | Описание |
|---|---|---|
| `session_id` | string | UUID сессии |
| `mode` | string | `learn`, `exam`, `mistakes`, `random`, `favorites`, `lastCorrect`, `lastIncorrect` |
| `language` | string | Язык |
| `total_questions` | number | Кол-во вопросов в сессии |

---

### 3. `test_finished`
Завершение сессии (пользователь дошёл до экрана результатов).

| Параметр | Тип | Описание |
|---|---|---|
| `session_id` | string | |
| `mode` | string | |
| `language` | string | |
| `total_questions` | number | |
| `correct` | number | Правильных ответов |
| `incorrect` | number | Неправильных |
| `percent` | number | Процент правильных (0–100) |
| `duration_sec` | number | Длительность сессии в секундах |

---

### 4. `test_abandoned`
Выход из сессии до её завершения (кнопка «Назад» или закрытие вкладки).

| Параметр | Тип | Описание |
|---|---|---|
| `session_id` | string | |
| `mode` | string | |
| `language` | string | |
| `current_question` | number | Индекс вопроса (0-based) в момент выхода |
| `elapsed_time_sec` | number | Прошедшее время |

---

### 5. `question_view`
Просмотр вопроса — срабатывает при каждом рендере вопроса.

| Параметр | Тип | Описание |
|---|---|---|
| `session_id` | string | |
| `question_id` | number | ID вопроса |
| `language` | string | |
| `category` | string\|null | Категория вопроса (если задана в data.js) |
| `mode` | string | |
| `position` | number | Позиция в сессии (1-based) |

---

### 6. `answer_selected`
Ответ пользователя на вопрос. Основное событие воронки обучения.

| Параметр | Тип | Описание |
|---|---|---|
| `session_id` | string | |
| `question_id` | number | |
| `correct` | boolean | Правильный ли ответ |
| `answer_time_ms` | number | Время обдумывания в миллисекундах |
| `language` | string | |
| `mode` | string | |

---

### 7. `question_passed`
Правильный ответ. Удобный фильтр для построения retention-отчётов.

| Параметр | Тип | Описание |
|---|---|---|
| `session_id` | string | |
| `question_id` | number | |
| `language` | string | |
| `mode` | string | |

---

### 8. `question_failed`
Неправильный ответ. Позволяет найти самые трудные вопросы.

| Параметр | Тип | Описание |
|---|---|---|
| `session_id` | string | |
| `question_id` | number | |
| `language` | string | |
| `mode` | string | |

---

### 9. `favorite_added`
Пользователь добавил вопрос в избранное.

| Параметр | Тип | Описание |
|---|---|---|
| `question_id` | number | |
| `language` | string | |

---

### 10. `favorite_removed`
Пользователь убрал вопрос из избранного.

| Параметр | Тип | Описание |
|---|---|---|
| `question_id` | number | |
| `language` | string | |

---

### 11. `learning_progress`
Агрегированный снимок прогресса пользователя.  
Отправляется **не чаще 1 раза в сутки** и **после каждого завершения теста**.

| Параметр | Тип | Описание |
|---|---|---|
| `learned_questions` | number | Вопросов с `lastResult = 'correct'` |
| `favorite_questions` | number | Вопросов в избранном |
| `incorrect_questions` | number | Вопросов с `lastResult = 'incorrect'` |
| `language` | string | |
| `total_questions` | number | Всего вопросов в базе (298) |

---

### 12. Прочие события (legacy)

| Событие | Когда |
|---|---|
| `first_question_answered` | Первый ответ в сессии |
| `question_5_reached` | Пользователь дошёл до 5-го вопроса |
| `question_10_reached` | Пользователь дошёл до 10-го вопроса |
| `result_screen_viewed` | Экран результатов открыт |
| `language_selected` | Смена языка |
| `pwa_installed` | Приложение установлено как PWA |

---

## Пользовательские свойства (User Properties)

Устанавливаются один раз при инициализации GA4. Доступны во всех отчётах.

| Свойство | Значение |
|---|---|
| `app_version` | `0.3.0` |
| `device_type` | `mobile` / `tablet` / `desktop` |
| `db_version` | `v2.0` |

---

## Custom Dimensions — что нужно добавить вручную в GA4

Зайди: **GA4 → Администрирование → Пользовательские определения → Пользовательские параметры**

| Название | Область | Параметр события | Тип |
|---|---|---|---|
| Session ID | Событие | `session_id` | Текст |
| Question ID | Событие | `question_id` | Число |
| App Mode | Событие | `mode` | Текст |
| Answer Correct | Событие | `correct` | Булево |
| Answer Time (ms) | Событие | `answer_time_ms` | Число |
| Test Duration (sec) | Событие | `duration_sec` | Число |
| Test Percent | Событие | `percent` | Число |
| Learned Questions | Событие | `learned_questions` | Число |
| Favorite Questions | Событие | `favorite_questions` | Число |
| Incorrect Questions | Событие | `incorrect_questions` | Число |
| Question Position | Событие | `position` | Число |
| Question Category | Событие | `category` | Текст |

> **Важно:** GA4 позволяет до 50 пользовательских параметров (25 числовых + 25 текстовых). Регистрируй только те, по которым планируешь строить отчёты.

---

## Рекомендуемые отчёты и Explorations в GA4

### 1. Воронка обучения (Funnel Exploration)
```
test_started → question_view → answer_selected → test_finished
```
Показывает: на каком вопросе пользователи уходят. Сегментируй по `mode`.

---

### 2. Топ трудных вопросов (Free Form Exploration)
- Строки: `question_id`
- Метрики: `event_count` для `question_failed`
- Фильтр: event_name = `question_failed`
- Сортировка: по убыванию

→ Находишь конкретные вопросы с максимальным % ошибок.

---

### 3. Среднее время обдумывания (Free Form)
- Метрика: среднее `answer_time_ms` (через Custom Metric)
- Сегмент по `mode` и `language`

→ Видишь, какие языковые аудитории читают медленнее.

---

### 4. Completion Rate по режимам (Free Form)
- Метрика: `event_count` (test_finished) / `event_count` (test_started) × 100
- Строки: `mode`

→ Какие режимы пользователи бросают чаще.

---

### 5. Рост базы (Segment Overlap)
- Сегмент A: пользователи с `learning_progress` `learned_questions` < 50
- Сегмент B: пользователи с `learned_questions` > 150

→ Оцениваешь прогресс когорт.

---

### 6. Избранное как сигнал вовлечённости
- Пользователи с хотя бы 1 `favorite_added` — сегмент «вовлечённые»
- Сравни retention с пользователями без избранного

---

## Идентификация пользователя

- `anonymous_user_id` — постоянный UUID, хранится в `localStorage('driver95_anon_user_id')`
- Передаётся в `user_id` при инициализации GA4
- Не связан с email / именем — полная анонимность
- Одинаков между сессиями на одном браузере

---

## Производительность

- Все события отправляются через `setTimeout(0)` — никогда не блокируют UI
- Ошибки GA4 глотаются молча (try/catch на всех уровнях)
- Локальная очередь в `localStorage` (`driver95_analytics_events`, cap 500)
- `keepalive: true` на fetch к backend — событие отправляется даже при закрытии страницы
- `debug_mode` отключён в production

---

## Как заменить GA4 на свой backend

1. В `analytics.js` найди функцию `_sendToGA4()` — замени тело на `fetch(myEndpoint)`.
2. Установи `CONFIG.useBackend = true` и `CONFIG.backendEndpoint = '/api/analytics'`.
3. app.js менять не нужно.
