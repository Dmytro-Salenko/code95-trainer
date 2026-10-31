/* Optional language suggestion only: never redirects or changes trainer progress. */
(function () {
  'use strict';
  var KEY = 'driver95_landing_suggest';
  var page = document.body.getAttribute('data-landing');
  var box = document.getElementById('lpSuggest');
  var choices = {
    uk: { appLang: 'uk', text: 'Ваш браузер налаштований українською. Відкрити сторінку українською мовою?', saved: 'Відкрити обрану сторінку українською мовою?', go: 'Українська', close: 'Закрити' },
    pl: { appLang: 'pl', text: 'Twoja przeglądarka używa języka polskiego. Przejść do wersji polskiej?', saved: 'Otworzyć wybraną wersję polską?', go: 'Polski', close: 'Zamknij' },
    'de-at': { appLang: 'de', text: 'Ihr Browser ist auf Deutsch (Österreich) eingestellt. Zur österreichischen Version wechseln?', saved: 'Die gewählte österreichische Version öffnen?', go: 'Deutsch (Österreich)', close: 'Schließen' }
  };
  function supported(slug) { return Object.prototype.hasOwnProperty.call(choices, slug); }
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function read() {
    try {
      var state = JSON.parse(get(KEY) || '{}');
      return state && typeof state === 'object' && !Array.isArray(state) ? state : {};
    } catch (e) { return {}; }
  }
  function save(state) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function choose(slug) {
    if (!supported(slug)) return;
    // A new explicit choice supersedes an earlier dismissal or preference.
    save({ pref: slug });
  }
  function detect() {
    var prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (var i = 0; i < prefs.length; i++) {
      var lang = String(prefs[i] || '').toLowerCase();
      if (lang === 'uk' || lang.indexOf('uk-') === 0) return 'uk';
      if (lang === 'pl' || lang.indexOf('pl-') === 0) return 'pl';
      if (lang === 'de-at') return 'de-at';
    }
    return null;
  }
  function refresh() {
    if (!box) return;
    box.hidden = true;
    box.classList.remove('show');
    var state = read();
    if (state.dismissed) return;
    var saved = supported(state.pref) ? state.pref : null;
    var target = saved || detect();
    if (!target || target === page) return;
    var cfg = choices[target];
    // A CTA already selected the trainer language: do not send the visitor back.
    if (!page && get('driver95_lang') === cfg.appLang) return;
    box.setAttribute('lang', target === 'de-at' ? 'de-AT' : target);
    box.querySelector('p').textContent = saved ? cfg.saved : cfg.text;
    var link = box.querySelector('a');
    link.textContent = cfg.go;
    link.setAttribute('href', '/' + target + '/');
    link.setAttribute('data-language-choice', target);
    var close = box.querySelector('button');
    close.setAttribute('aria-label', cfg.close);
    close.setAttribute('title', cfg.close);
    box.hidden = false;
    box.classList.add('show');
  }
  // Delegation covers navigation and the dynamically populated banner.
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented) return;
    var link = e.target.closest('a[data-language-choice]');
    if (link) { choose(link.getAttribute('data-language-choice')); refresh(); }
    // The SPA commits its language in its existing onclick handler first.
    var button = e.target.closest('button');
    if (!page && button && (button.id === 'onboardingContinue' || /^settingsLang/.test(button.id))) {
      var lang = get('driver95_lang');
      var slug = lang === 'de' ? 'de-at' : lang;
      save(supported(slug) ? { pref: slug } : { dismissed: true });
      if (box) { box.hidden = true; box.classList.remove('show'); }
    }
  });
  document.addEventListener('auxclick', function (e) {
    var link = e.target.closest('a[data-language-choice]');
    if (e.button === 1 && !e.defaultPrevented && link) choose(link.getAttribute('data-language-choice'));
  });
  if (box) box.querySelector('button').addEventListener('click', function () {
    var state = read();
    state.dismissed = true;
    save(state);
    box.hidden = true;
    box.classList.remove('show');
  });
  window.addEventListener('pageshow', function () { try { refresh(); } catch (e) {} });
  window.addEventListener('storage', function (e) { if (e.key === KEY || e.key === 'driver95_lang') { try { refresh(); } catch (err) {} } });
  try { refresh(); } catch (e) { /* static page remains usable */ }
})();
