const ANALYTICS_CONFIG = {
  useBackend: false, // Set to true when self-hosted backend is ready
  apiEndpoint: '/api/analytics',
  appVersion: '0.2.1',
  gaMeasurementId: 'G-78SW1YDT85'
};

class AnalyticsModule {
  constructor() {
    this.userId = this._initUserId();
    this.sessionId = this._generateUUID();
    this.deviceType = this._getDeviceType();
    this._initGA();
  }

  _initUserId() {
    let uid = localStorage.getItem('driver95_anon_user_id');
    if (!uid) {
      uid = this._generateUUID();
      localStorage.setItem('driver95_anon_user_id', uid);
    }
    return uid;
  }

  _generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  }

  _getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet";
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
      return "mobile";
    }
    return "desktop";
  }

  _initGA() {
    const id = ANALYTICS_CONFIG.gaMeasurementId;
    if (!id) {
      console.log('[Analytics] GA4 Measurement ID not configured. GA4 disabled.');
      return;
    }
    try {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function() { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', id, {
        send_page_view: false, // manual tracking
        user_id: this.userId,
        debug_mode: true // Force events to appear in GA4 DebugView
      });
      console.log('[Analytics] GA4 initialized with ID:', id);
    } catch (err) {
      console.error('[Analytics] Failed to initialize GA4:', err);
    }
  }

  track(eventName, eventData = {}) {
    try {
      const payload = {
        event_name: eventName,
        anonymous_user_id: this.userId,
        session_id: this.sessionId,
        timestamp: new Date().toISOString(),
        language: eventData.language || (window.lang || 'de'),
        mode: eventData.mode || null,
        question_id: eventData.question_id || null,
        selected_answer: eventData.selected_answer || null,
        correct_answer: eventData.correct_answer || null,
        is_correct: typeof eventData.is_correct === 'boolean' ? eventData.is_correct : null,
        time_spent: typeof eventData.time_spent === 'number' ? eventData.time_spent : null,
        device_type: this.deviceType,
        app_version: ANALYTICS_CONFIG.appVersion,
        question_database_version: eventData.question_database_version || 'v2.0',
        metadata: eventData.metadata || {}
      };

      console.log('[Analytics Event]', eventName, payload);

      // Save to local queue (always keep local queue for MVP fallback)
      this._saveToLocalQueue(payload);

      // Track via GA4 if configured
      if (ANALYTICS_CONFIG.gaMeasurementId && typeof window.gtag === 'function') {
        window.gtag('event', eventName, {
          language: payload.language,
          mode: payload.mode,
          question_id: payload.question_id,
          is_correct: payload.is_correct,
          time_spent: payload.time_spent,
          app_version: payload.app_version,
          question_database_version: payload.question_database_version,
          device_type: payload.device_type,
          session_id: payload.session_id
        });
      }

      // If backend is enabled, send to backend
      if (ANALYTICS_CONFIG.useBackend) {
        this._sendToBackend(payload);
      }
    } catch (err) {
      console.error('Analytics error (silent):', err);
    }
  }

  _saveToLocalQueue(payload) {
    try {
      const queue = JSON.parse(localStorage.getItem('driver95_analytics_events') || '[]');
      queue.push(payload);
      if (queue.length > 500) {
        queue.shift();
      }
      localStorage.setItem('driver95_analytics_events', JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to save event to local storage', e);
    }
  }

  _sendToBackend(payload) {
    fetch(ANALYTICS_CONFIG.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => {
      console.error('Failed to send event to backend, fallback to local storage', err);
    });
  }
}

window.Analytics = new AnalyticsModule();
