/**
 * Driver95 Analytics Module v2.0
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all product analytics.
 * Backed by Google Analytics 4 (GA4) via gtag.js.
 *
 * PUBLIC API (used by app.js):
 *   Analytics.track(eventName, params)       — raw event
 *   Analytics.testStarted(params)
 *   Analytics.testFinished(params)
 *   Analytics.testAbandoned(params)
 *   Analytics.questionViewed(params)
 *   Analytics.answerSelected(params)
 *   Analytics.favoriteAdded(params)
 *   Analytics.favoriteRemoved(params)
 *   Analytics.questionFailed(params)
 *   Analytics.questionPassed(params)
 *   Analytics.learningProgress(params)
 *
 * All methods are fire-and-forget. Errors are swallowed silently.
 * Replace GA4 with another backend: change _sendToGA4() only.
 */

'use strict';

(function (global) {

  // ─── Configuration ────────────────────────────────────────────────────────
  const CONFIG = {
    gaMeasurementId: 'G-78SW1YDT85',
    appVersion:      '0.3.0',
    dbVersion:       'v2.0',
    // Set true only in local development to see events in GA4 DebugView
    debugMode:       false,
    // Set true to also POST events to own backend (legacy path)
    useBackend:      false,
    backendEndpoint: '/api/analytics',
    // Local queue cap (guards against localStorage bloat)
    localQueueCap:   500
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function _uuid() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    // Fallback: RFC-4122 v4 compatible
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function _deviceType() {
    const ua = navigator.userAgent || '';
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  function _safeGet(key, fallback = null) {
    try { return localStorage.getItem(key) || fallback; } catch (_) { return fallback; }
  }

  function _safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  }

  // ─── Identity ─────────────────────────────────────────────────────────────
  function _initUserId() {
    let uid = _safeGet('driver95_anon_user_id');
    if (!uid) {
      uid = _uuid();
      _safeSet('driver95_anon_user_id', uid);
    }
    return uid;
  }

  // ─── GA4 bootstrap ────────────────────────────────────────────────────────
  function _initGA4(measurementId, userId) {
    if (!measurementId) return;
    try {
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(s);

      global.dataLayer = global.dataLayer || [];
      global.gtag = function () { global.dataLayer.push(arguments); };
      global.gtag('js', new Date());

      const cfg = {
        send_page_view: false,   // we track manually
        user_id: userId
      };
      if (CONFIG.debugMode) cfg.debug_mode = true;

      global.gtag('config', measurementId, cfg);

      // Persist cross-session user properties
      global.gtag('set', 'user_properties', {
        app_version:   CONFIG.appVersion,
        device_type:   _deviceType(),
        db_version:    CONFIG.dbVersion
      });
    } catch (err) {
      // Silent — analytics must never crash the app
    }
  }

  // ─── Local queue (offline fallback + debugging) ───────────────────────────
  function _enqueue(payload) {
    try {
      const raw   = localStorage.getItem('driver95_analytics_events') || '[]';
      const queue = JSON.parse(raw);
      queue.push(payload);
      if (queue.length > CONFIG.localQueueCap) queue.shift();
      localStorage.setItem('driver95_analytics_events', JSON.stringify(queue));
    } catch (_) {}
  }

  // ─── Transport ────────────────────────────────────────────────────────────
  function _sendToGA4(eventName, params) {
    if (!CONFIG.gaMeasurementId || typeof global.gtag !== 'function') return;
    try {
      // GA4 custom dimensions are limited to 25 per event.
      // We pass only meaningful params; strip nulls.
      const clean = {};
      Object.entries(params).forEach(([k, v]) => {
        if (v !== null && v !== undefined) clean[k] = v;
      });
      global.gtag('event', eventName, clean);
    } catch (_) {}
  }

  function _sendToBackend(payload) {
    if (!CONFIG.useBackend) return;
    try {
      fetch(CONFIG.backendEndpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
        keepalive: true    // fires even if page is closing
      }).catch(() => {});
    } catch (_) {}
  }

  // ─── Core dispatch ────────────────────────────────────────────────────────
  const _userId    = _initUserId();
  const _device    = _deviceType();

  _initGA4(CONFIG.gaMeasurementId, _userId);

  function _dispatch(eventName, extra = {}) {
    // Run async so it never blocks the UI
    setTimeout(() => {
      try {
        const base = {
          anonymous_user_id:        _userId,
          app_version:              CONFIG.appVersion,
          question_database_version: CONFIG.dbVersion,
          device_type:              _device,
          timestamp:                new Date().toISOString()
        };

        const payload = Object.assign(base, extra, { event_name: eventName });

        _enqueue(payload);
        _sendToGA4(eventName, payload);
        _sendToBackend(payload);
      } catch (_) {}
    }, 0);
  }

  // ─── Named event helpers ──────────────────────────────────────────────────

  /**
   * test_started
   * Fired when user starts any quiz session.
   * @param {object} p
   * @param {string} p.session_id
   * @param {string} p.mode         — 'learn'|'exam'|'mistakes'|'random'|'favorites'|'lastCorrect'|'lastIncorrect'
   * @param {string} p.language
   * @param {number} p.total_questions
   */
  function testStarted(p) {
    _dispatch('test_started', {
      session_id:      p.session_id,
      mode:            p.mode,
      language:        p.language,
      total_questions: p.total_questions
    });
  }

  /**
   * test_finished
   * Fired when user completes the full session (reaches result screen).
   * @param {object} p
   * @param {string} p.session_id
   * @param {string} p.mode
   * @param {string} p.language
   * @param {number} p.total_questions
   * @param {number} p.correct
   * @param {number} p.incorrect
   * @param {number} p.percent       — 0–100 integer
   * @param {number} p.duration_sec  — total seconds
   */
  function testFinished(p) {
    _dispatch('test_finished', {
      session_id:      p.session_id,
      mode:            p.mode,
      language:        p.language,
      total_questions: p.total_questions,
      correct:         p.correct,
      incorrect:       p.incorrect,
      percent:         p.percent,
      duration_sec:    p.duration_sec
    });
  }

  /**
   * test_abandoned
   * Fired when user exits session before completing it (back button / page close).
   * @param {object} p
   * @param {string} p.session_id
   * @param {string} p.mode
   * @param {string} p.language
   * @param {number} p.current_question  — 0-based index
   * @param {number} p.elapsed_time_sec
   */
  function testAbandoned(p) {
    _dispatch('test_abandoned', {
      session_id:       p.session_id,
      mode:             p.mode,
      language:         p.language,
      current_question: p.current_question,
      elapsed_time_sec: p.elapsed_time_sec
    });
  }

  /**
   * question_view
   * Fired every time a question is rendered to the user.
   * @param {object} p
   * @param {string} p.session_id
   * @param {number} p.question_id
   * @param {string} p.language
   * @param {string} p.category
   * @param {string} p.mode
   * @param {number} p.position     — 1-based position in session list
   */
  function questionViewed(p) {
    _dispatch('question_view', {
      session_id:  p.session_id,
      question_id: p.question_id,
      language:    p.language,
      category:    p.category || null,
      mode:        p.mode,
      position:    p.position
    });
  }

  /**
   * answer_selected
   * Fired when user submits an answer.
   * @param {object} p
   * @param {string}  p.session_id
   * @param {number}  p.question_id
   * @param {boolean} p.correct
   * @param {number}  p.answer_time_ms  — milliseconds from question render to answer
   * @param {string}  p.language
   * @param {string}  p.mode
   */
  function answerSelected(p) {
    _dispatch('answer_selected', {
      session_id:     p.session_id,
      question_id:    p.question_id,
      correct:        p.correct,
      answer_time_ms: p.answer_time_ms,
      language:       p.language,
      mode:           p.mode
    });
  }

  /**
   * question_passed
   * Fired when user answers a question correctly.
   * Subset of answer_selected for easy funnel analysis.
   */
  function questionPassed(p) {
    _dispatch('question_passed', {
      session_id:  p.session_id,
      question_id: p.question_id,
      language:    p.language,
      mode:        p.mode
    });
  }

  /**
   * question_failed
   * Fired when user answers a question incorrectly.
   */
  function questionFailed(p) {
    _dispatch('question_failed', {
      session_id:  p.session_id,
      question_id: p.question_id,
      language:    p.language,
      mode:        p.mode
    });
  }

  /**
   * favorite_added
   * Fired when user bookmarks a question.
   */
  function favoriteAdded(p) {
    _dispatch('favorite_added', {
      question_id: p.question_id,
      language:    p.language
    });
  }

  /**
   * favorite_removed
   * Fired when user removes a question from bookmarks.
   */
  function favoriteRemoved(p) {
    _dispatch('favorite_removed', {
      question_id: p.question_id,
      language:    p.language
    });
  }

  /**
   * learning_progress
   * Aggregated snapshot of user's learning state.
   * Called once per session completion and once per day (via _maybeTrackDailyProgress).
   * @param {object} p
   * @param {number} p.learned_questions   — lastResult === 'correct'
   * @param {number} p.favorite_questions
   * @param {number} p.incorrect_questions — lastResult === 'incorrect'
   * @param {string} p.language
   * @param {number} p.total_questions
   */
  function learningProgress(p) {
    _dispatch('learning_progress', {
      learned_questions:   p.learned_questions,
      favorite_questions:  p.favorite_questions,
      incorrect_questions: p.incorrect_questions,
      language:            p.language,
      total_questions:     p.total_questions
    });
  }

  // ─── Daily progress snapshot ──────────────────────────────────────────────
  /**
   * Reads driver95_progress from localStorage and dispatches learning_progress.
   * Called at most once per day per user.
   */
  function _maybeTrackDailyProgress(language, totalQuestions) {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const lastTracked = _safeGet('driver95_analytics_progress_date');
    if (lastTracked === today) return;

    try {
      const prog = JSON.parse(localStorage.getItem('driver95_progress') || '{}');
      let learned   = 0;
      let favorites = 0;
      let incorrect = 0;

      Object.values(prog).forEach(card => {
        if (card.lastResult === 'correct')   learned++;
        if (card.lastResult === 'incorrect') incorrect++;
        if (card.favorite === true)          favorites++;
      });

      learningProgress({
        learned_questions:   learned,
        favorite_questions:  favorites,
        incorrect_questions: incorrect,
        language:            language,
        total_questions:     totalQuestions
      });

      _safeSet('driver95_analytics_progress_date', today);
    } catch (_) {}
  }

  // ─── Legacy shim: Analytics.track() ──────────────────────────────────────
  // Keeps backwards compatibility with any existing Analytics.track() calls
  // in app.js that have not yet been migrated to named helpers.
  function track(eventName, params = {}) {
    _dispatch(eventName, params);
  }

  // ─── Expose public API ────────────────────────────────────────────────────
  global.Analytics = {
    // Named helpers (preferred)
    testStarted,
    testFinished,
    testAbandoned,
    questionViewed,
    answerSelected,
    questionPassed,
    questionFailed,
    favoriteAdded,
    favoriteRemoved,
    learningProgress,

    // Utilities accessible from app.js
    maybeTrackDailyProgress: _maybeTrackDailyProgress,
    generateSessionId: _uuid,

    // Legacy shim — keep working while app.js is gradually migrated
    track,

    // Expose userId for debugging
    get userId() { return _userId; }
  };

}(window));
