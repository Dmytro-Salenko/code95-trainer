# Changelog

All notable changes to Driver95 are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.3.1] — 2026-10-06

### Added
- Local storage for all 10 question images in `images/questions/`
- Restored 4 previously missing question images across all 7 languages:
  - 157833 (belt pretension measuring device)
  - 157790 (Limited Quantities / LQ mark)
  - 157941 (LQ aviation mark with Y)
  - 157865 (Center of Gravity mark)
- Added all 10 question images to Service Worker offline cache (`ASSETS`)

### Changed
- Replaced all external image URLs in `data.js` with local paths across all 7 language databases (70 references)
- Service Worker cache bumped to `v20`
- Question image rendering in `app.js`: reset src before rendering, add onerror handler, add meaningful alt text

---

## [0.3.0] — 2026-07-19

### Added
- Full GA4 analytics module (`analytics.js`) — isolated from application logic
- 17 product events: `test_started`, `test_finished`, `test_abandoned`, `question_view`, `answer_selected`, `question_passed`, `question_failed`, `favorite_added`, `favorite_removed`, `learning_progress`, and more
- Anonymous persistent user ID (`driver95_anon_user_id`) — no PII collected
- Daily learning progress snapshot (`learning_progress` event, max once/day)
- `Analytics.enableDebug()` / `disableDebug()` — temporary GA4 DebugView toggle via `sessionStorage`
- `Analytics.smokeTest()` — fires all events with synthetic data from DevTools
- Technical SEO audit: `robots.txt`, `sitemap.xml`, canonical tags, hreflang (8 languages), Open Graph, Twitter Cards, Schema.org JSON-LD
- `favicon.ico`
- Updated `manifest.json`: added `id`, `description`, screenshots, shortcuts, maskable icons
- Non-intrusive share prompt card on result screen (Web Share API + clipboard fallback)
- Share prompt: shown once after successful session (≥80% correct, ≥20 questions answered); state persisted in `localStorage`

### Fixed
- `debug_mode` was always `true` in production — now correctly `false`
- `session_id` (UUID) was sent as a GA4 event parameter — removed (high cardinality)
- `anonymous_user_id` was sent as event param — moved to `user_id` in GA4 config only
- `timestamp` duplicated GA4's own timestamp — removed from event params
- Removed fake `aggregateRating` from Schema.org (would cause Google manual action)
- Removed hidden cloaking `div` (violated Google Webmaster Guidelines)
- `<html lang="de">` corrected to `lang="mul"` (ISO 639-2: multiple languages)
- `Analytics._generateUUID()` (private method) replaced with public `Analytics.generateSessionId()`
- `keepalive: true` added to backend fetch so events survive page close
- Production hotfix (commit `12aa858`): missing `};` in I18N object caused `SyntaxError` blocking all of `app.js`

### Changed
- Analytics event parameter names unified (`correct_count` instead of `correct`, `score_pct` instead of `percent`, etc.)
- `is_correct` boolean sent as string `"true"/"false"` (required by GA4 Custom Dimensions)
- Service Worker cache bumped to `v18`

---

## [0.2.0] — 2026-06-29

### Added
- Multilingual support: 8 languages (de, en, ru, uk, pl, es, it, tr)
- Favorites system — unified `driver95_progress` object (migrated from legacy `driver95_favorites`)
- Dynamic Favorites badge count in bottom navigation
- Learn mode: shows only unanswered/incorrect questions; completed questions removed on the fly
- Home screen progress cards (correct / incorrect counts)
- Smooth CSS toast notifications (replaced all `alert()` calls)
- Stats screen
- Settings screen (language + theme switcher)
- Navigation isolation: back arrow (`←`) separated from prev/next chevrons (`‹ ›`)
- Self-documenting project structure (`.agents/` directory with AGENTS.md, DECISIONS.md, etc.)

### Changed
- Complete UI redesign with design system (CSS variables, dark/light themes)
- App-like onboarding screen for language and theme selection
- Phone shell layout for quiz and result screens

---

## [0.1.0] — 2026-06-01

### Added
- Initial release
- 298 questions from official Code 95 source material (German)
- Exam mode (40 random questions)
- Mistakes mode
- Random mode
- Progress saved in `localStorage`
- PWA (Service Worker, Web App Manifest)
- GitHub Pages deployment
