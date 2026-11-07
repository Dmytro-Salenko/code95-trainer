/**
 * Driver95 Analytics Module v2.2
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all product analytics.
 * Backed by Google Analytics 4 (GA4) via gtag.js.
 *
 * PUBLIC API (used by app.js):
 *   Analytics.track(eventName, params)
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
 *   Analytics.sharePromptShown(params)
 *   Analytics.shareClicked(params)
 *   Analytics.shareDismissed(params)
 *   Analytics.shareLinkCopied(params)
 *
 * DEBUG MODE (temporary, without code changes):
 *   Open DevTools Console and run:  Analytics.enableDebug()
 *   Then reload. Events will appear in GA4 DebugView for 60 min.
 *   To disable:  Analytics.disableDebug()
 *
 * All methods are fire-and-forget. Errors are swallowed silently.
 * Replace GA4 with another backend: change _sendToGA4() only.
 */

'use strict';

(function (global) {

  // ─── Configuration ────────────────────────────────────────────────────────
  const CONFIG = {
    gaMeasurementId: 'G-78SW1YDT85',
    appVersion:      '0.3.2',
    dbVersion:       'v2.0',
    // debug_mode controlled by sessionStorage flag — never hardcoded true
    debugMode:       sessionStorage.getItem('driver95_debug_analytics') === '1',
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

  // Explicit opt-in on this browser only; never infer staff from IP/country.
  const query = new URLSearchParams(global.location.search);
  if (query.get('analytics_test') === '1') _safeSet('driver95_analytics_test', '1');
  if (query.get('analytics_test') === '0') {
    try { localStorage.removeItem('driver95_analytics_test'); } catch (_) {}
  }
  const isTestTraffic = query.get('analytics_test') === '1' ||
    (query.get('analytics_test') !== '0' && _safeGet('driver95_analytics_test') === '1') ||
    ['localhost', '127.0.0.1', '::1'].includes(global.location.hostname);
  const attempts = new Map();
  function claimAttempt(id, terminal) {
    if (!id) return true;
    const previous = attempts.get(id);
    if (previous === 'ended' || (!terminal && previous)) return false;
    attempts.set(id, terminal ? 'ended' : 'started');
    if (attempts.size > 1000) attempts.delete(attempts.keys().next().value);
    return true;
  }
  // Local calendar days. No cross-device or pre-install history is inferred.
  function recordPractice(finished) {
    if (isTestTraffic || CONFIG.debugMode) return {};
    try {
      const now = new Date();
      const today = [now.getFullYear(), String(now.getMonth()+1).padStart(2,'0'), String(now.getDate()).padStart(2,'0')].join('-');
      const dates = JSON.parse(_safeGet('driver95_practice_days', '[]'));
      const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate()-29);
      const recent = dates.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && new Date(d+'T00:00:00') >= cutoff);
      const newDay = !recent.includes(today);
      if (newDay) recent.push(today);
      _safeSet('driver95_practice_days', JSON.stringify(recent));
      let completed = Number(_safeGet('driver95_completed_exams', '0')) || 0;
      if (finished) { completed++; _safeSet('driver95_completed_exams', String(completed)); }
      const summary = {
        practice_frequency: recent.length > 1 ? 'multiple_days_30d' : 'one_day_30d',
        exam_completion_frequency: completed > 1 ? 'multiple' : completed === 1 ? 'one' : 'none'
      };
      if (newDay) _dispatch('practice_day', summary);
      return summary;
    } catch (_) { return {}; }
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
    if (!measurementId || isTestTraffic) return;
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
        user_id:        userId   // anonymous UUID — not PII
      };
      // debug_mode only when explicitly enabled via sessionStorage
      if (CONFIG.debugMode || isTestTraffic) cfg.debug_mode = true;
      if (isTestTraffic) cfg.traffic_type = 'internal';

      global.gtag('config', measurementId, cfg);

      // User-scoped properties (persist across sessions in GA4)
      global.gtag('set', 'user_properties', {
        app_version:  CONFIG.appVersion,
        device_type:  _deviceType(),
        db_version:   CONFIG.dbVersion
      });
    } catch (_) {
      // Silent — analytics must never crash the app
    }
  }

  // ─── Local queue (offline fallback + smoke testing) ──────────────────────
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

  // GA4 reserved parameter names that must never be used as custom params.
  // Full list: https://support.google.com/analytics/answer/9234069
  const _GA4_RESERVED = new Set([
    'firebase_event_origin','firebase_screen','firebase_screen_class',
    'firebase_screen_id','firebase_previous_class','firebase_previous_id',
    'firebase_previous_screen','ep.','epn.',
    'session_id', 'test_session_id', // attempt UUIDs stay local, never override GA session IDs
    'event_name',               // dispatched via gtag('event', name) — no need to repeat
    'timestamp',                // GA4 adds its own timestamp — our ISO string is redundant
    'anonymous_user_id',        // user identity handled via user_id config, not event param
    'question_database_version',// internal; not a registered GA4 Dimension
    'device_type'               // GA4 collects Device Category automatically from UA string
  ]);

  function _sendToGA4(eventName, params, options) {
    if (isTestTraffic || !CONFIG.gaMeasurementId || typeof global.gtag !== 'function') return;
    try {
      const clean = {};
      Object.entries(params).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        if (_GA4_RESERVED.has(k)) return;          // strip reserved/noisy params
        if (typeof v === 'string' && v.length > 100) return; // GA4 string limit is 100 chars
        clean[k === 'language' ? 'app_language' : k] = v;
      });
      // Transport controls must never enter the persisted event queue.
      if (options && typeof options.onComplete === 'function') {
        clean.event_callback = options.onComplete;
        clean.event_timeout = options.timeout || 1200;
      }
      global.gtag('event', eventName, clean);
    } catch (_) {}
  }

  function _sendToBackend(payload) {
    if (isTestTraffic || !CONFIG.useBackend) return;
    try {
      fetch(CONFIG.backendEndpoint, {
        method:    'POST',
        headers:   { 'Content-Type': 'application/json' },
        body:      JSON.stringify(payload),
        keepalive: true    // survives page close
      }).catch(() => {});
    } catch (_) {}
  }

  // ─── Core dispatch ────────────────────────────────────────────────────────
  const _userId = _initUserId();
  const _device = _deviceType();

  _initGA4(CONFIG.gaMeasurementId, _userId);

  function _dispatch(eventName, extra = {}, options) {
    // Queue to gtag synchronously so pagehide is not lost to a deferred timer.
    (() => {
      try {
        // Base payload for local queue / backend (full data)
        const payload = Object.assign({
          event_name:               eventName,
          anonymous_user_id:        _userId,        // local queue + backend only
          app_version:              CONFIG.appVersion,
          question_database_version: CONFIG.dbVersion,
          device_type:              _device,
          timestamp:                new Date().toISOString()
        }, extra);

        if (isTestTraffic || CONFIG.debugMode) payload.traffic_type = 'internal';
        if (isTestTraffic || CONFIG.debugMode) payload.debug_mode = true;
        _enqueue(payload);          // local queue (full payload, fine for own backend)
        _sendToGA4(eventName, payload, options);  // GA4 (filtered — strips PII/reserved fields)
        _sendToBackend(payload);
      } catch (_) {}
    })();
  }

  // ─── Named event helpers ──────────────────────────────────────────────────

  /**
   * test_started
   * Fired when user starts any quiz session.
   *
   * GA4 params sent:
   *   mode, language, total_questions, app_version, device_type
   */
  function testStarted(p) {
    if (!claimAttempt(p.session_id, false)) return;
    const practice = recordPractice(false);
    _dispatch('test_started', {
      ...practice,
      session_id: p.session_id,
      mode:            p.mode,
      language:        p.language,
      total_questions: p.total_questions
      // session_id intentionally excluded — high cardinality UUID,
      // retained in the local queue, not sent as a GA4 event parameter.
    });
  }

  /**
   * test_finished
   * Fired when user completes the full session (reaches result screen).
   *
   * GA4 params sent:
   *   mode, language, total_questions, correct_count, incorrect_count,
   *   score_pct, duration_sec
   *
   * Numeric params (correct_count, incorrect_count, score_pct, duration_sec)
   * → register as Custom Metrics in GA4 for SUM/AVG aggregations.
   */
  function testFinished(p) {
    if (!claimAttempt(p.session_id, true)) return;
    const practice = recordPractice(p.mode === 'exam');
    _dispatch('test_finished', {
      ...practice,
      session_id: p.session_id,
      completion_reason: 'all_questions_answered',
      test_result: p.mode === 'exam' ? (p.correct >= Math.ceil(p.total_questions * 0.8) ? 'passed' : 'failed') : 'completed',
      mode:            p.mode,
      language:        p.language,
      total_questions: p.total_questions,
      correct_count:   p.correct,     // renamed: 'correct' alone is ambiguous
      incorrect_count: p.incorrect,
      score_pct:       p.percent,     // renamed: 'percent' alone is ambiguous
      duration_seconds: p.duration_sec
    });
  }

  /**
   * test_abandoned
   * Fired when user exits session before completing it.
   *
   * GA4 params sent:
   *   mode, language, questions_seen, elapsed_sec
   */
  function testAbandoned(p) {
    if (!claimAttempt(p.session_id, true)) return;
    _dispatch('test_abandoned', {
      session_id: p.session_id,
      exit_reason: p.reason || 'navigation',
      mode:          p.mode,
      language:      p.language,
      questions_seen: p.current_question,   // renamed: more descriptive
      elapsed_sec:   p.elapsed_time_sec
    });
  }

  /**
   * question_view
   * Fired every time a question is rendered to the user.
   *
   * GA4 params sent:
   *   question_id, language, category, mode, position
   *
   * question_id: ~300 values — acceptable as event-scoped Custom Dimension
   * with a note to revisit if question bank exceeds 500.
   */
  function questionViewed(p) {
    _dispatch('question_view', {
      question_id: p.question_id,
      language:    p.language,
      category:    p.category || null,
      mode:        p.mode,
      position:    p.position
    });
  }

  /**
   * answer_selected
   * Fired when user submits an answer. Core learning funnel event.
   *
   * GA4 params sent:
   *   question_id, is_correct, answer_time_ms, language, mode
   *
   * is_correct: boolean → register as Custom Dimension (text: "true"/"false")
   * answer_time_ms: number → register as Custom Metric for AVG calculation
   */
  function answerSelected(p) {
    _dispatch('answer_selected', {
      question_id:    p.question_id,
      is_correct:     p.correct ? 'true' : 'false',  // GA4 booleans sent as strings
      answer_time_ms: p.answer_time_ms,
      language:       p.language,
      mode:           p.mode
    });
  }

  /**
   * question_passed / question_failed
   * Convenience events for easy funnel analysis without filtering answer_selected.
   */
  function questionPassed(p) {
    _dispatch('question_passed', {
      question_id: p.question_id,
      language:    p.language,
      mode:        p.mode
    });
  }

  function questionFailed(p) {
    _dispatch('question_failed', {
      question_id: p.question_id,
      language:    p.language,
      mode:        p.mode
    });
  }

  /**
   * favorite_added / favorite_removed
   * Engagement signal — users who bookmark are retained longer.
   */
  function favoriteAdded(p) {
    _dispatch('favorite_added', {
      question_id: p.question_id,
      language:    p.language
    });
  }

  function favoriteRemoved(p) {
    _dispatch('favorite_removed', {
      question_id: p.question_id,
      language:    p.language
    });
  }

  /**
   * learning_progress
   * Aggregated daily snapshot of user's learning state.
   * Called at most once per day and after each test_finished.
   *
   * All number params → register as Custom Metrics.
   */
  function learningProgress(p) {
    _dispatch('learning_progress', {
      learned_count:   p.learned_questions,    // renamed for clarity
      favorite_count:  p.favorite_questions,
      incorrect_count: p.incorrect_questions,
      language:        p.language,
      total_questions: p.total_questions
    });
  }

  /**
   * Share prompt funnel events:
   *   share_prompt_shown — when card becomes visible
   *   share_clicked      — when user clicks Share
   *   share_dismissed    — when user closes/dismisses card
   *   share_link_copied  — only after successful link copy to clipboard
   */
  function sharePromptShown(p = {}) {
    _dispatch('share_prompt_shown', {
      language: p.language,
      mode:     p.mode
    });
  }

  function shareClicked(p = {}) {
    _dispatch('share_clicked', {
      language: p.language,
      mode:     p.mode
    });
  }

  function shareDismissed(p = {}) {
    _dispatch('share_dismissed', {
      language: p.language,
      mode:     p.mode
    });
  }

  function shareLinkCopied(p = {}) {
    _dispatch('share_link_copied', {
      language: p.language,
      mode:     p.mode
    });
  }

  // ─── Daily progress snapshot ──────────────────────────────────────────────
  function _maybeTrackDailyProgress(language, totalQuestions) {
    const today       = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
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

  // ─── Debug mode helpers ───────────────────────────────────────────────────
  // Temporary testing mechanism: sets a sessionStorage flag.
  // Survives page reload within the same tab. Cleared on tab close.
  // Usage: Analytics.enableDebug() → reload → check GA4 DebugView.

  function enableDebug() {
    try {
      sessionStorage.setItem('driver95_debug_analytics', '1');
      console.info(
        '[Analytics] Debug mode ENABLED.\n' +
        'Reload the page — events will appear in GA4 DebugView for this tab session.\n' +
        'Run Analytics.disableDebug() + reload to turn off.'
      );
    } catch (_) {}
  }

  function disableDebug() {
    try {
      sessionStorage.removeItem('driver95_debug_analytics');
      console.info('[Analytics] Debug mode DISABLED. Reload to apply.');
    } catch (_) {}
  }

  // ─── Smoke test runner (DevTools only) ───────────────────────────────────
  // Usage: Analytics.smokeTest()
  // Fires all events with synthetic data. Check local queue in DevTools or GA4 DebugView.
  function smokeTest() {
    if (!CONFIG.debugMode && !isTestTraffic) {
      console.warn('Enable debug/test mode and reload before synthetic testing.');
      return;
    }
    console.group('[Analytics] Smoke Test');
    const fakeSessionId = _uuid();
    const fakeQId       = 42;

    const steps = [
      ['app_open',           () => _dispatch('app_open',           { language: 'de' })],
      ['test_started',       () => testStarted({ session_id: fakeSessionId, mode: 'exam', language: 'de', total_questions: 40 })],
      ['question_view',      () => questionViewed({ session_id: fakeSessionId, question_id: fakeQId, language: 'de', category: 'Verkehrsrecht', mode: 'exam', position: 1 })],
      ['answer_selected ✓',  () => answerSelected({ session_id: fakeSessionId, question_id: fakeQId, correct: true,  answer_time_ms: 4200, language: 'de', mode: 'exam' })],
      ['question_passed',    () => questionPassed({ session_id: fakeSessionId, question_id: fakeQId, language: 'de', mode: 'exam' })],
      ['answer_selected ✗',  () => answerSelected({ session_id: fakeSessionId, question_id: 55,      correct: false, answer_time_ms: 8100, language: 'de', mode: 'exam' })],
      ['question_failed',    () => questionFailed({ session_id: fakeSessionId, question_id: 55,      language: 'de', mode: 'exam' })],
      ['favorite_added',     () => favoriteAdded({ question_id: fakeQId, language: 'de' })],
      ['favorite_removed',   () => favoriteRemoved({ question_id: fakeQId, language: 'de' })],
      ['test_finished',      () => testFinished({ session_id: fakeSessionId, mode: 'exam', language: 'de', total_questions: 40, correct: 35, incorrect: 5, percent: 88, duration_sec: 312 })],
      ['test_abandoned',     () => testAbandoned({ session_id: _uuid(), mode: 'learn', language: 'ru', current_question: 7, elapsed_time_sec: 145 })],
      ['learning_progress',  () => learningProgress({ learned_questions: 120, favorite_questions: 18, incorrect_questions: 34, language: 'de', total_questions: 298 })],
      ['share_prompt_shown', () => sharePromptShown({ language: 'de', mode: 'exam' })],
      ['share_clicked',      () => shareClicked({ language: 'de', mode: 'exam' })],
      ['share_dismissed',    () => shareDismissed({ language: 'de', mode: 'exam' })],
      ['share_link_copied',  () => shareLinkCopied({ language: 'de', mode: 'exam' })],
    ];

    steps.forEach(([name, fn]) => {
      try {
        fn();
        console.log('  ✅', name);
      } catch (err) {
        console.error('  ❌', name, err);
      }
    });

    console.log('\nLocal queue now has', (() => {
      try { return JSON.parse(localStorage.getItem('driver95_analytics_events') || '[]').length; } catch (_) { return '?'; }
    })(), 'events.');
    console.log('Check GA4 DebugView if debug mode is enabled (Analytics.enableDebug() + reload).');
    console.groupEnd();
  }

  // ─── Legacy shim: Analytics.track() ──────────────────────────────────────
  function track(eventName, params = {}, options) {
    _dispatch(eventName, params, options);
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
    sharePromptShown,
    shareClicked,
    shareDismissed,
    shareLinkCopied,

    // Utilities
    maybeTrackDailyProgress: _maybeTrackDailyProgress,
    generateSessionId:       _uuid,

    // Debug tools (DevTools use only, not called from app.js)
    enableDebug,
    disableDebug,
    smokeTest,

    // Legacy shim
    track,

    // Readonly: user identity (for debugging)
    get userId() { return _userId; },
    get isDebugMode() { return CONFIG.debugMode; },
    get isTestTraffic() { return isTestTraffic; }
  };

}(window));
