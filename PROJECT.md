# Описание проекта Driver95 (Code 95 Trainer)

Проект **Driver95** представляет собой Single Page Application (SPA), созданное для подготовки водителей к сдаче экзамена на квалификационную карту Driver Code 95 в странах ЕС. Приложение работает на стороне клиента (без бэкенда) и сохраняет весь прогресс в локальном хранилище браузера.

---

## 🛠️ Стек технологий

- **HTML5**: Базовая семантическая разметка экранов и модулей.
- **CSS3**: Адаптивный дизайн, CSS-переменные для переключения тем, гибкие сетки Flexbox/Grid, SVG-иконки для элементов интерфейса.
- **Vanilla JavaScript**: Логика тестирования, переключение экранов, локализация (DE/RU) и работа с LocalStorage.
- **LocalStorage**: Сохранение прогресса, просмотренных вопросов, тем и ошибок пользователя.
- **PWA (Progressive Web App)**: Добавлена поддержка manifest.json для установки приложения на экраны смартфонов и оффлайн-работы.

---

## 📂 Основные файлы проекта

- [index.html](file:///Users/salenkodimitry/.gemini/antigravity/scratch/code95-trainer/index.html) — разметка экранов приложения: Onboarding, Главное меню, Тестирование (Quiz), Экран результатов.
- [style.css](file:///Users/salenkodimitry/.gemini/antigravity/scratch/code95-trainer/style.css) — файл стилей с поддержкой светлой/тёмной темы и адаптацией под различные размеры экранов.
- [app.js](file:///Users/salenkodimitry/.gemini/antigravity/scratch/code95-trainer/app.js) — ядро логики приложения.
- [data.js](file:///Users/salenkodimitry/.gemini/antigravity/scratch/code95-trainer/data.js) — база вопросов и ответов на немецком и русском языках.
- [manifest.json](file:///Users/salenkodimitry/.gemini/antigravity/scratch/code95-trainer/manifest.json) — конфигурационный файл PWA.

---

## 📊 Режимы обучения (Sessions)

1. **Случайные вопросы (Random)**: Вопросы перемешиваются и выводятся в случайном порядке.
2. **Тренировка (Lernen)**: Последовательный разбор базы вопросов с сохранением последней позиции.
3. **Ошибки (Mistakes)**: Повторение только тех вопросов, на которые были даны неверные ответы.
4. **Экзамен (Exam)**: Имитация реального теста — 40 случайных вопросов с ограничением по количеству ошибок.
