/* Driver95: contextual links, no tracking calls and no redirects. */
(function () {
  'use strict';
  const youtube = 'https://www.youtube.com/channel/UCfaC2IlYwnpM9hJ2M738J3w';
  const facebook = 'https://www.facebook.com/dmitry.dosik';
  const blogs = {
    ru: 'https://dmytro-salenko.blogspot.com/2026/11/pdf-driver95.html',
    uk: 'https://dmytro-salenko.blogspot.com/2026/11/pdf-driver95_01754471196.html',
    pl: 'https://dmytro-salenko.blogspot.com/2026/11/chciaem-pomoc-koledze-z-pdf-em-teraz.html',
    de: 'https://dmytro-salenko.blogspot.com/2026/11/ich-wollte-einem-freund-mit-einer-pdf.html',
    en: 'https://dmytro-salenko.blogspot.com/2026/11/i-wanted-to-help-friend-with-pdf-now-i.html'
  };
  const copy = {
    ru: { blog: 'Как создаётся Driver95', facebook: 'Автор в Facebook', title: 'Один видеовопрос в день', text: 'Продолжайте практику в нашем русскоязычном Telegram-канале.', subscribe: 'Подписаться в Telegram' },
    uk: { blog: 'Як створюється Driver95', facebook: 'Автор у Facebook', title: 'Одне відеозапитання щодня', text: 'Продовжуйте практику в нашому українськомовному Telegram-каналі.', subscribe: 'Підписатися в Telegram' },
    pl: { blog: 'Jak powstaje Driver95', facebook: 'Autor na Facebooku' },
    de: { blog: 'Wie Driver95 entsteht', facebook: 'Autor auf Facebook' },
    en: { blog: 'How Driver95 is built', facebook: 'Author on Facebook' },
    es: { blog: 'Cómo se crea Driver95 (English)', facebook: 'Autor en Facebook' },
    it: { blog: 'Come nasce Driver95 (English)', facebook: 'Autore su Facebook' },
    tr: { blog: 'Driver95 nasıl geliştiriliyor (English)', facebook: "Facebook'ta geliştirici" }
  };
  const normalize = language => String(language || 'en').toLowerCase().split('-')[0];
  const subscriptionForLang = language => ({ ru: 'https://t.me/driver95eu', uk: 'https://t.me/driver95ua' })[normalize(language)] || null;
  const blogForLang = language => blogs[normalize(language)] || blogs.en;
  if (typeof module !== 'undefined' && module.exports) module.exports = { subscriptionForLang, blogForLang, youtube, facebook };
  if (typeof document === 'undefined') return;
  function link(label, href) { const a = document.createElement('a'); a.textContent = label; a.href = href; a.target = '_blank'; a.rel = 'noopener'; return a; }
  function render() {
    const language = normalize(document.documentElement.lang);
    const words = copy[language] || copy.en;
    document.querySelectorAll('[data-project-links]').forEach(nav => {
      nav.replaceChildren(link(words.blog, blogForLang(language)), link('YouTube', youtube), link(words.facebook, facebook));
      const telegram = subscriptionForLang(language);
      if (telegram) nav.append(link('Telegram', telegram));
    });
    const card = document.getElementById('practiceSubscription');
    if (!card) return;
    const telegram = subscriptionForLang(language);
    card.hidden = !telegram;
    card.replaceChildren();
    if (telegram) {
      const title = document.createElement('strong'); title.textContent = words.title;
      const text = document.createElement('p'); text.textContent = words.text;
      card.append(title, text, link(words.subscribe, telegram));
    }
  }
  render();
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
