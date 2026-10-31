/* Landing analytics and trainer links. Language suggestions are shared with /. */
(function () {
  'use strict';
  var page = document.body.getAttribute('data-landing');
  var appLang = document.body.getAttribute('data-app-lang');
  if (!page || !appLang) return;
  function track(name, params, options) {
    try {
      if (window.Analytics && typeof window.Analytics.track === 'function') {
        window.Analytics.track(name, params, options);
      }
    } catch (e) { /* navigation must work without analytics */ }
  }
  track('page_view', { language: appLang, landing_page: page, page_type: 'seo_landing' });
  var ctas = document.querySelectorAll('a[data-cta]');
  var navigating = false;
  var generation = 0;
  var pendingTimer = null;
  var CTA_TIMEOUT = 1200;
  // Restored documents retain variables and DOM attributes. Invalidate old
  // callbacks too, so a late GA callback cannot navigate after Back.
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    generation++;
    navigating = false;
    clearTimeout(pendingTimer);
    pendingTimer = null;
    for (var i = 0; i < ctas.length; i++) ctas[i].removeAttribute('data-cta-busy');
  });
  function onCta(e) {
    if (e.defaultPrevented) return;
    var a = e.currentTarget;
    var modified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1;
    if (navigating || a.getAttribute('data-cta-busy') === '1') {
      e.preventDefault();
      return;
    }
    try { localStorage.setItem('driver95_lang', appLang); } catch (err) {}
    a.setAttribute('data-cta-busy', '1');
    var params = { language: appLang, landing_page: page, cta_location: a.getAttribute('data-cta') || 'cta' };
    if (modified) {
      // Preserve native new-tab/new-window behaviour.
      track('landing_cta_click', params);
      setTimeout(function () { a.removeAttribute('data-cta-busy'); }, 600);
      return;
    }
    e.preventDefault();
    navigating = true;
    var token = generation;
    var completed = false;
    var href = a.href;
    function finish() {
      if (completed || token !== generation) return;
      completed = true;
      clearTimeout(pendingTimer);
      pendingTimer = null;
      window.location.href = href;
    }
    // Independent fallback covers blocked GA, a never-loaded gtag queue and
    // transport errors. A processing callback is not a GA delivery receipt.
    pendingTimer = setTimeout(finish, CTA_TIMEOUT);
    track('landing_cta_click', params, { onComplete: finish, timeout: CTA_TIMEOUT });
  }
  for (var i = 0; i < ctas.length; i++) {
    ctas[i].addEventListener('click', onCta);
    ctas[i].addEventListener('auxclick', function (e) { if (e.button === 1) onCta(e); });
  }
})();
