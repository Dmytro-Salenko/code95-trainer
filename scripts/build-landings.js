#!/usr/bin/env node
/**
 * Driver95 — static SEO landing page generator (no dependencies).
 *
 *   node scripts/build-landings.js
 *
 * Writes uk/index.html, pl/index.html and de-at/index.html.
 * Question counts and the 7 sample questions per page come straight from data.js
 * (hand-picked ids, validated below), so numbers on the pages cannot drift from the app.
 * The homepage (index.html) is NOT touched by this script.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
global.window = {};
require(path.join(ROOT, 'data.js'));
const DATA = global.window.DRIVER95_DATA;

const ORIGIN = 'https://driver95.eu';
const OG_IMAGE = ORIGIN + '/assets/icon-512.png';

// ── helpers ──────────────────────────────────────────────────────────────────
function decode(s) {   // same idea as cleanText() in app.js
  return String(s == null ? '' : s)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/\u00a0/g, ' ').trim();
}
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ── curated sample questions (real items from data.js; verified: no image, single answer) ──
const SAMPLE_IDS = {
  uk: [159057, 159107, 159195, 158945, 159454, 159102, 158937],
  pl: [159522, 159106, 159194, 158944, 159452, 159279, 158940],
  de: [33, 66, 184, 281, 324, 388, 571]
};

function samples(dbLang) {
  return SAMPLE_IDS[dbLang].map(id => {
    const q = DATA[dbLang].find(x => x.id === id);
    if (!q) throw new Error(`question ${id} not found in ${dbLang}`);
    if (q.image) throw new Error(`question ${id} has an image`);
    if ((q.correctIndexes || []).length !== 1) throw new Error(`question ${id} is multi-answer`);
    return {
      id: q.id, category: q.category || '', text: decode(q.question),
      answers: q.answers.map(decode), correct: q.correctIndexes[0]
    };
  });
}

// ── per-language copy ────────────────────────────────────────────────────────
const N = { uk: DATA.uk.length, pl: DATA.pl.length, de: DATA.de.length };
const deBlocks = [1, 2, 3].map(b => DATA.de.filter(q => String(q.category).startsWith(String(b))).length);

const NAV = [
  { slug: 'de-at', label: 'Deutsch (Österreich)', hreflangLang: 'de-AT' },
  { slug: 'pl', label: 'Polski', hreflangLang: 'pl' },
  { slug: 'uk', label: 'Українська', hreflangLang: 'uk' }
];

const PAGES = {
  'uk': {
    htmlLang: 'uk', ogLocale: 'uk_UA', dbLang: 'uk', appLang: 'uk', count: N.uk,
    title: `Код 95 тести українською онлайн — ${N.uk} питань | Driver95`,
    description: `Безкоштовні тести Код 95 українською: ${N.uk} питань, іспит із 40 питань, повторення помилок. Без реєстрації, працює без інтернету після першого завантаження.`,
    h1: 'Тести Код 95 українською онлайн',
    lead: `Driver95 — безкоштовний тренажер для водіїв вантажівок і автобусів, які готуються до Code 95. Усі ${N.uk} питань доступні українською: вчіть теми, складайте пробний іспит і повторюйте помилки прямо в браузері чи на телефоні.`,
    cta: 'Розпочати тест українською', cta2: 'Відкрити тренажер',
    ctaNote: 'Відкриється тренажер, де вже вибрано українську мову.',
    facts: [[String(N.uk), 'питань українською'], ['40', 'питань у пробному іспиті'], ['0 €', 'без реєстрації та реклами'], ['Offline', 'після першого завантаження']],
    navLabel: 'Мова сторінки', allLangs: 'Усі мови (8)', home: 'Driver95',
    aboutH: 'Що таке Код 95',
    about: [
      'Код 95 — це позначка у водійському посвідченні, яка підтверджує професійну кваліфікацію водія вантажного автомобіля чи автобуса в країнах ЄС (директива 2003/59/ЄС). Вона стосується категорій C1, C1E, C, CE, D1, D1E, D і DE.',
      'Кваліфікацію здобувають під час початкової підготовки, а потім підтримують періодичним навчанням — 35 годин кожні п’ять років. Конкретні вимоги та порядок іспиту визначає компетентний орган вашої країни.'
    ],
    topicsH: 'Які теми охоплюють питання',
    topicsIntro: `У тренажері ${N.uk} питань українською. Серед тем:`,
    topics: ['режими праці та відпочинку водія', 'тахограф і водійські карти', 'кріплення та перевезення вантажів', 'гальмівні системи та шини', 'перша допомога та дії після ДТП', 'перевезення небезпечних вантажів (ADR)', 'штрафи та контроль'],
    modesH: 'Як працює тренажер',
    modes: [
      ['Навчання', 'показує лише ті питання, які ви ще не засвоїли.'],
      ['Іспит (40 питань)', 'пробний іспит із 40 випадкових питань.'],
      ['Повторити помилки', 'повертає питання, на які ви відповіли неправильно.'],
      ['Випадкові питання', 'тренування в довільному порядку.'],
      ['Обране', 'збережіть складні питання кнопкою ♡ та повертайтеся до них.'],
      ['Статистика', 'кількість переглянутих питань, прогрес і помилки.']
    ],
    samplesH: 'Приклади питань із тренажера',
    samplesIntro: 'Так виглядають справжні питання. Правильну відповідь позначено галочкою ✓.',
    qLabel: 'Питання',
    faqH: 'Часті запитання',
    faq: [
      ['Чи безкоштовний тренажер?', 'Так. Driver95 безкоштовний, не потребує реєстрації й не показує рекламу.'],
      ['Скільки питань і якою мовою?', `У тренажері ${N.uk} питань українською. Інтерфейс і питання також доступні німецькою, польською, російською, англійською, іспанською, італійською та турецькою.`],
      ['Чи можна вчитися без інтернету?', 'Так. Після першого завантаження тренажер працює офлайн, а його можна додати на головний екран телефона як застосунок.'],
      ['Де зберігається мій прогрес?', 'Прогрес зберігається локально у вашому браузері, акаунт не потрібен. Якщо очистити дані сайту, прогрес буде втрачено.'],
      ['Чи збігаються питання з офіційним іспитом?', 'Driver95 — незалежний навчальний тренажер, а не офіційний ресурс. Питання допомагають вивчити теми Code 95, але не гарантують результат іспиту, а окремі з них можуть стосуватися правил конкретної країни ЄС. Актуальні вимоги уточнюйте в компетентному органі вашої країни.']
    ],
    bottomH: 'Готові потренуватися?',
    bottomP: `Відкрийте тренажер і почніть із ${N.uk} питань українською — без реєстрації.`,
    footer: 'Driver95 — незалежний навчальний ресурс для підготовки до Code 95.',
    sampleDb: 'uk'
  },

  'pl': {
    htmlLang: 'pl', ogLocale: 'pl_PL', dbLang: 'pl', appLang: 'pl', count: N.pl,
    title: `Kod 95 testy online po polsku — ${N.pl} pytań | Driver95`,
    description: `Darmowe testy na kod 95 po polsku: ${N.pl} pytań, egzamin próbny z 40 pytań, powtórka błędów. Bez rejestracji, działa offline po pierwszym uruchomieniu.`,
    h1: 'Testy na kod 95 online po polsku',
    lead: `Driver95 to bezpłatny trener dla kierowców ciężarówek i autobusów, którzy przygotowują się do kodu 95. Wszystkie ${N.pl} pytań są dostępne po polsku: ucz się tematami, rozwiązuj egzamin próbny i wracaj do popełnionych błędów w przeglądarce lub na telefonie.`,
    cta: 'Zacznij test po polsku', cta2: 'Otwórz trenera',
    ctaNote: 'Otworzy się trener z wybranym językiem polskim.',
    facts: [[String(N.pl), 'pytań po polsku'], ['40', 'pytań w egzaminie próbnym'], ['0 €', 'bez rejestracji i reklam'], ['Offline', 'po pierwszym uruchomieniu']],
    navLabel: 'Język strony', allLangs: 'Wszystkie języki (8)', home: 'Driver95',
    aboutH: 'Czym jest kod 95',
    about: [
      'Kod 95 to wpis w prawie jazdy potwierdzający kwalifikację zawodową kierowcy samochodu ciężarowego lub autobusu w Unii Europejskiej (dyrektywa 2003/59/WE). Dotyczy kategorii C1, C1E, C, CE, D1, D1E, D i DE.',
      'Kwalifikację zdobywa się podczas szkolenia wstępnego, a następnie utrzymuje szkoleniem okresowym — 35 godzin co pięć lat. Szczegółowe wymagania i przebieg egzaminu określa właściwy organ w Twoim kraju.'
    ],
    topicsH: 'Jakie tematy obejmują pytania',
    topicsIntro: `W trenerze znajdziesz ${N.pl} pytań po polsku. Wśród tematów:`,
    topics: ['czas pracy i odpoczynku kierowców', 'tachograf i karty kierowcy', 'mocowanie i przewóz ładunków', 'układy hamulcowe i opony', 'pierwsza pomoc i postępowanie po wypadku', 'przewóz towarów niebezpiecznych (ADR)', 'kary i kontrole'],
    modesH: 'Jak działa trener',
    modes: [
      ['Nauka', 'pokazuje tylko te pytania, których jeszcze nie opanowałeś.'],
      ['Egzamin (40 pytań)', 'egzamin próbny z 40 losowych pytań.'],
      ['Powtórz błędy', 'wraca do pytań, na które odpowiedziałeś błędnie.'],
      ['Losowe pytania', 'trening w dowolnej kolejności.'],
      ['Ulubione', 'zapisuj trudne pytania przyciskiem ♡ i wracaj do nich.'],
      ['Statystyki', 'liczba obejrzanych pytań, postęp i błędy.']
    ],
    samplesH: 'Przykładowe pytania z trenera',
    samplesIntro: 'Tak wyglądają prawdziwe pytania. Poprawną odpowiedź oznaczono znakiem ✓.',
    qLabel: 'Pytanie',
    faqH: 'Najczęstsze pytania',
    faq: [
      ['Czy trener jest darmowy?', 'Tak. Driver95 jest bezpłatny, nie wymaga rejestracji i nie wyświetla reklam.'],
      ['Ile jest pytań i w jakim języku?', `W trenerze jest ${N.pl} pytań po polsku. Interfejs i pytania są dostępne także po niemiecku, angielsku, rosyjsku, ukraińsku, hiszpańsku, włosku i turecku.`],
      ['Czy mogę się uczyć bez internetu?', 'Tak. Po pierwszym uruchomieniu trener działa offline, a na telefonie możesz dodać go do ekranu głównego jak aplikację.'],
      ['Gdzie zapisywany jest mój postęp?', 'Postęp zapisuje się lokalnie w Twojej przeglądarce, konto nie jest potrzebne. Wyczyszczenie danych witryny usunie postęp.'],
      ['Czy pytania pokrywają się z oficjalnym egzaminem?', 'Driver95 to niezależny trener, a nie oficjalny serwis. Pytania pomagają poznać zagadnienia kodu 95, ale nie gwarantują wyniku egzaminu, a część z nich może dotyczyć przepisów konkretnego kraju UE. Aktualne wymagania sprawdź w właściwym urzędzie w swoim kraju.']
    ],
    bottomH: 'Gotowy na trening?',
    bottomP: `Otwórz trenera i zacznij od ${N.pl} pytań po polsku — bez rejestracji.`,
    footer: 'Driver95 — niezależny serwis edukacyjny do nauki kodu 95.',
    sampleDb: 'pl'
  },

  'de-at': {
    htmlLang: 'de-AT', ogLocale: 'de_AT', dbLang: 'de', appLang: 'de', count: N.de,
    title: `Code 95 Test Österreich online — ${N.de} Fragen | Driver95`,
    description: `Kostenlose Code-95-Übungsfragen für Österreich: ${N.de} Fragen, Prüfungsmodus mit 40 Fragen, Fehler wiederholen. Ohne Registrierung, auch offline nutzbar.`,
    h1: 'Code 95 Test Österreich online üben',
    lead: `Driver95 ist ein kostenloser Trainer für Berufskraftfahrer, die sich auf Code 95 vorbereiten. Alle ${N.de} Fragen beziehen sich auf Österreich: Lernen nach Themen, Prüfungssimulation mit 40 Fragen und gezielte Wiederholung Ihrer Fehler – im Browser oder am Smartphone.`,
    cta: 'Code-95-Test starten', cta2: 'Trainer öffnen',
    ctaNote: 'Der Trainer öffnet sich mit vorausgewählter Sprache Deutsch.',
    facts: [[String(N.de), 'Fragen für Österreich'], ['40', 'Fragen im Prüfungsmodus'], ['0 €', 'ohne Registrierung und Werbung'], ['Offline', 'nach dem ersten Laden']],
    navLabel: 'Sprache der Seite', allLangs: 'Alle Sprachen (8)', home: 'Driver95',
    aboutH: 'Was ist Code 95?',
    about: [
      'Code 95 ist die Schlüsselzahl im Führerschein, die die berufliche Qualifikation von Lkw- und Busfahrerinnen und -fahrern in der EU bestätigt (Richtlinie 2003/59/EG). Sie betrifft die Klassen C1, C1E, C, CE, D1, D1E, D und DE.',
      'Die Qualifikation wird durch die Grundqualifikation erworben und durch Weiterbildung aufrechterhalten – 35 Stunden alle fünf Jahre. Maßgeblich sind die aktuellen Vorgaben der zuständigen österreichischen Behörde.'
    ],
    topicsH: 'Welche Themen die Fragen abdecken',
    topicsIntro: `Die ${N.de} Fragen sind in drei Themenblöcke (1, 2 und 3) mit Unterkategorien von 1a bis 3h gegliedert – Block 1: ${deBlocks[0]} Fragen, Block 2: ${deBlocks[1]} Fragen, Block 3: ${deBlocks[2]} Fragen. Beispiele für Themen:`,
    topics: ['Lenk- und Ruhezeiten', 'Fahrtenschreiber und Fahrerkarte', 'Ladungssicherung und Zurrgurte', 'Bremsanlagen von Nutzfahrzeugen', 'GO-Box und Lkw-Maut', 'Verhalten bei Unfällen und Notrufnummern in Österreich'],
    modesH: 'So funktioniert der Trainer',
    modes: [
      ['Lernen', 'zeigt nur Fragen, die Sie noch nicht beherrschen.'],
      ['Prüfung (40 Fragen)', 'Probeprüfung mit 40 zufälligen Fragen.'],
      ['Fehler wiederholen', 'bringt Fragen zurück, die Sie falsch beantwortet haben.'],
      ['Zufällige Fragen', 'Training in beliebiger Reihenfolge.'],
      ['Favoriten', 'schwierige Fragen mit ♡ merken und später wiederholen.'],
      ['Statistik', 'gesehene Fragen, Fortschritt und Fehler im Überblick.']
    ],
    samplesH: 'Beispielfragen aus dem Trainer',
    samplesIntro: 'So sehen echte Fragen aus. Die richtige Antwort ist mit ✓ markiert.',
    qLabel: 'Frage',
    faqH: 'Häufige Fragen',
    faq: [
      ['Ist der Trainer kostenlos?', 'Ja. Driver95 ist kostenlos, braucht keine Registrierung und zeigt keine Werbung.'],
      ['Wie viele Fragen gibt es und in welcher Sprache?', `Der Fragenkatalog für Österreich umfasst ${N.de} Fragen auf Deutsch. Der Trainer selbst ist in 8 Sprachen verfügbar: Deutsch, Englisch, Russisch, Ukrainisch, Polnisch, Spanisch, Italienisch und Türkisch.`],
      ['Kann ich ohne Internet üben?', 'Ja. Nach dem ersten Laden funktioniert der Trainer offline, und Sie können ihn am Smartphone wie eine App zum Startbildschirm hinzufügen.'],
      ['Wo wird mein Lernfortschritt gespeichert?', 'Der Fortschritt wird lokal in Ihrem Browser gespeichert, ein Konto ist nicht nötig. Wenn Sie die Website-Daten löschen, geht er verloren.'],
      ['Entsprechen die Fragen der offiziellen Prüfung?', 'Driver95 ist ein unabhängiges Übungsangebot und keine offizielle Stelle. Die Fragen helfen beim Lernen der Code-95-Themen, garantieren aber kein Prüfungsergebnis. Aktuelle Anforderungen erfahren Sie bei der zuständigen Behörde in Österreich.']
    ],
    bottomH: 'Bereit zum Üben?',
    bottomP: `Öffnen Sie den Trainer und starten Sie mit ${N.de} Fragen für Österreich – ohne Registrierung.`,
    footer: 'Driver95 — unabhängiges Lernangebot zur Vorbereitung auf Code 95.',
    sampleDb: 'de'
  }
};

// ── rendering ────────────────────────────────────────────────────────────────
function render(slug, P) {
  const url = `${ORIGIN}/${slug}/`;
  const qs = samples(P.sampleDb);
  const langNav = NAV.map(n => n.slug === slug
    ? `<li><span aria-current="page" lang="${n.hreflangLang}">${esc(n.label)}</span></li>`
    : `<li><a href="/${n.slug}/" lang="${n.hreflangLang}" data-language-choice="${n.slug}">${esc(n.label)}</a></li>`).join('\n          ');

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': url + '#webpage', url, name: P.title, description: P.description,
        inLanguage: P.htmlLang, isPartOf: { '@type': 'WebSite', name: 'Driver95', url: ORIGIN + '/' },
        about: { '@type': 'Thing', name: 'Code 95' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Driver95', item: ORIGIN + '/' },
          { '@type': 'ListItem', position: 2, name: P.h1, item: url }
        ]
      }
    ]
  };

  const questionsHtml = qs.map((q, i) => `
        <article class="lpQ">
          <p class="lpQMeta">${esc(P.qLabel)} ${i + 1}${q.category ? ' · ' + esc(q.category) : ''}</p>
          <h3>${esc(q.text)}</h3>
          <ul class="lpA">
${q.answers.map((a, j) => `            <li${j === q.correct ? ' class="ok"' : ''}>${esc(a)}</li>`).join('\n')}
          </ul>
        </article>`).join('\n');

  return `<!doctype html>
<html lang="${P.htmlLang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(P.title)}</title>
  <meta name="description" content="${esc(P.description)}" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <meta name="author" content="Driver95" />
  <meta name="theme-color" content="#060b13" />
  <link rel="canonical" href="${url}" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Driver95" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${esc(P.title)}" />
  <meta property="og:description" content="${esc(P.description)}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta property="og:image:width" content="512" />
  <meta property="og:image:height" content="512" />
  <meta property="og:image:alt" content="Driver95 — Code 95" />
  <meta property="og:locale" content="${P.ogLocale}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${esc(P.title)}" />
  <meta name="twitter:description" content="${esc(P.description)}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />

  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" href="/assets/icon-192.png" type="image/png" />
  <link rel="apple-touch-icon" href="/assets/icon-192.png" />
  <link rel="preconnect" href="https://www.googletagmanager.com" />

  <script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
  </script>

  <link rel="stylesheet" href="/landing.css" />
  <link rel="stylesheet" href="/language-suggestion.css" />
</head>
<body data-landing="${slug}" data-app-lang="${P.appLang}">
  <script>try{if(localStorage.getItem('driver95_theme')==='dark')document.body.classList.add('dark')}catch(e){}</script>
  <div class="lp">
    <header class="lpBrand">
      <a class="lpLogo" href="/" aria-label="${esc(P.home)}">
        <img src="/assets/logo-light.png" class="logoLight" alt="Driver95" width="385" height="342" />
        <img src="/assets/logo-dark.png" class="logoDark" alt="" width="385" height="342" />
      </a>
      <nav aria-label="${esc(P.navLabel)}">
        <ul class="lpLangs">
          ${langNav}
          <li><a href="/">${esc(P.allLangs)}</a></li>
        </ul>
      </nav>
    </header>

    <div class="lpSuggest" id="lpSuggest" hidden>
      <p></p>
      <a href="#"></a>
      <button type="button" aria-label="×">×</button>
    </div>

    <main>
      <section class="lpCard lpHero">
        <h1>${esc(P.h1)}</h1>
        <p class="lpLead">${esc(P.lead)}</p>
        <a class="lpBtn" href="/" data-cta="hero">${esc(P.cta)}</a>
        <p class="lpNote">${esc(P.ctaNote)}</p>
        <ul class="lpFacts">
${P.facts.map(f => `          <li><b>${esc(f[0])}</b><span>${esc(f[1])}</span></li>`).join('\n')}
        </ul>
      </section>

      <section class="lpCard">
        <h2>${esc(P.aboutH)}</h2>
${P.about.map(p => `        <p>${esc(p)}</p>`).join('\n')}
      </section>

      <section class="lpCard">
        <h2>${esc(P.topicsH)}</h2>
        <p>${esc(P.topicsIntro)}</p>
        <ul class="lpList">
${P.topics.map(t => `          <li>${esc(t)}</li>`).join('\n')}
        </ul>
      </section>

      <section class="lpCard">
        <h2>${esc(P.modesH)}</h2>
        <ul class="lpList">
${P.modes.map(m => `          <li><strong>${esc(m[0])}</strong> — ${esc(m[1])}</li>`).join('\n')}
        </ul>
      </section>

      <section class="lpCard">
        <h2>${esc(P.samplesH)}</h2>
        <p class="lpLead">${esc(P.samplesIntro)}</p>
${questionsHtml}
      </section>

      <section class="lpCard">
        <h2>${esc(P.faqH)}</h2>
${P.faq.map(f => `        <h3>${esc(f[0])}</h3>\n        <p>${esc(f[1])}</p>`).join('\n')}
      </section>

      <section class="lpCard lpHero">
        <h2>${esc(P.bottomH)}</h2>
        <p class="lpLead">${esc(P.bottomP)}</p>
        <a class="lpBtn" href="/" data-cta="bottom">${esc(P.cta2)}</a>
      </section>
    </main>

    <footer class="lpFooter">
      <p>${esc(P.footer)}</p>
      <p>© 2026 Driver95 · <a href="mailto:driver95.eu@gmail.com">driver95.eu@gmail.com</a></p>
    </footer>
  </div>

  <script src="/analytics.js"></script>
  <script src="/landing.js"></script>
  <script src="/language-suggestion.js"></script>
</body>
</html>
`;
}

Object.keys(PAGES).forEach(slug => {
  const dir = path.join(ROOT, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), render(slug, PAGES[slug]));
  console.log('written', path.join(slug, 'index.html'));
});
