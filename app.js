const DATA = window.DRIVER95_DATA || {de: [], ru: []};
const BASE_STORAGE_KEY = 'driver95_mvp_v2';

const I18N = {
  de: {
    code: 'DE', subtitle: 'Code 95 Trainer', continue: 'Lernen', exam: 'Prüfung (40 Fragen)',
    mistakes: 'Fehler wiederholen', random: 'Zufällige Fragen', reset: 'Fortschritt zurücksetzen',
    learnTitle: 'Lernen', examTitle: 'Prüfung (40 Fragen)', mistakesTitle: 'Fehler wiederholen', randomTitle: 'Zufällige Fragen',
    correctWord: 'richtig', question: 'Frage', of: 'von', check: 'Prüfen', next: 'Weiter →',
    noMistakes: 'Noch keine Fehler vorhanden.', resetConfirm: 'Fortschritt zurücksetzen?',
    right: 'Richtig', wrong: 'Falsch. Richtige Antwort:', done: 'Fertig.', correct: 'Richtig', errors: 'Fehler',
    multi: 'Mehrere Antworten möglich.',
    welcomeTitle: 'Willkommen!', welcomeSubtitle: 'Trainiere weiter und verbessere dein Wissen.',
    menuRandomTitle: 'Zufällige Fragen', menuRandomSub: 'Training in zufälliger Reihenfolge',
    menuTopicsTitle: 'Training', menuTopicsSub: 'Lernen, Prüfung und Fortschritt',
    menuMistakesTitle: 'Fehler', menuMistakesSub: 'Deine falschen Antworten',
    menuStatsTitle: 'Statistik', menuStatsSub: 'Deine Ergebnisse und Fortschritt',
    statsTitle: 'Statistik', statsTotalLabel: 'Fragen insgesamt', statsSeenLabel: 'Gesehene Fragen', statsProgressLabel: 'Fortschritt', statsMistakesLabel: 'Fehler'
  },
  ru: {
    code: 'RU', subtitle: 'Тренажёр Code 95', continue: 'Обучение', exam: 'Экзамен (40 вопросов)',
    mistakes: 'Повторить ошибки', random: 'Случайные вопросы', reset: 'Сбросить прогресс',
    learnTitle: 'Обучение', examTitle: 'Экзамен (40 вопросов)', mistakesTitle: 'Повтор ошибок', randomTitle: 'Случайные вопросы',
    correctWord: 'правильно', question: 'Вопрос', of: 'из', check: 'Проверить', next: 'Дальше →',
    noMistakes: 'Ошибок пока нет.', resetConfirm: 'Сбросить прогресс?',
    right: 'Правильно', wrong: 'Неправильно. Правильный ответ:', done: 'Готово.', correct: 'Правильно', errors: 'Ошибок',
    multi: 'Возможны несколько правильных ответов.',
    welcomeTitle: 'Добро пожаловать!', welcomeSubtitle: 'Продолжайте обучение и повышайте свои знания.',
    menuRandomTitle: 'Случайные вопросы', menuRandomSub: 'Тренировка в случайном порядке',
    menuTopicsTitle: 'Тренировка', menuTopicsSub: 'Обучение, экзамен и прогресс',
    menuMistakesTitle: 'Ошибки', menuMistakesSub: 'Ваши неправильные ответы',
    menuStatsTitle: 'Статистика', menuStatsSub: 'Ваши результаты и прогресс',
    statsTitle: 'Статистика', statsTotalLabel: 'Всего вопросов', statsSeenLabel: 'Изучено вопросов', statsProgressLabel: 'Прогресс', statsMistakesLabel: 'Ошибки'
  }
};

const $ = (id) => document.getElementById(id);
let lang = localStorage.getItem('driver95_lang') || null;
let onboardingLang = lang || 'de';
let theme = localStorage.getItem('driver95_theme') || 'light';
let QUESTIONS = [];
let state = null;
let session = null;
let selected = new Set();

function storageKey(){ return `${BASE_STORAGE_KEY}_${lang}`; }
function t(key){ return I18N[lang][key]; }

function loadState(){
  const fallback = {seen:{}, correct:{}, wrong:{}, mistakes:[], lastIndex:0};
  try { return Object.assign(fallback, JSON.parse(localStorage.getItem(storageKey()) || '{}')); }
  catch { return fallback; }
}
function saveState(){ localStorage.setItem(storageKey(), JSON.stringify(state)); }
function shuffle(arr){ return [...arr].sort(() => Math.random() - 0.5); }
function show(id){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); $(id).classList.add('active'); }
function applyTheme(nextTheme){
  theme = nextTheme === 'dark' ? 'dark' : 'light';
  document.body.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('driver95_theme', theme);
  updateOnboardingButtons();
}
function updateOnboardingButtons(){
  $('langDe')?.classList.toggle('selected', onboardingLang === 'de');
  $('langRu')?.classList.toggle('selected', onboardingLang === 'ru');
  $('themeLight')?.classList.toggle('selected', theme === 'light');
  $('themeDark')?.classList.toggle('selected', theme === 'dark');
}
function pct(n,d){ return d ? Math.round((n/d)*100) : 0; }
function sameSet(a,b){ return a.size === b.length && b.every(x => a.has(x)); }
function cleanText(value){
  const el = document.createElement('textarea');
  el.innerHTML = String(value ?? '');
  return el.value.replace(/\u00a0/g, ' ').trim();
}

function selectLanguage(nextLang){
  lang = nextLang;
  localStorage.setItem('driver95_lang', lang);
  QUESTIONS = DATA[lang] || [];
  state = loadState();
  applyLanguage();
  updateHome();
  show('mainMenu');
}

function applyLanguage(){
  document.documentElement.lang = lang === 'ru' ? 'ru' : 'de';
  $('langBadge').textContent = t('code');
  $('homeSubtitle').textContent = t('subtitle');
  $('continueBtn').textContent = t('continue');
  $('examBtn').textContent = t('exam');
  $('mistakesBtn').textContent = t('mistakes');
  $('randomBtn').textContent = t('random');
  $('resetBtn').textContent = t('reset');
  $('checkBtn').textContent = t('check');
  $('nextBtn').textContent = t('next');
  $('welcomeTitle').textContent = t('welcomeTitle');
  $('welcomeSubtitle').textContent = t('welcomeSubtitle');
  $('menuRandomTitle').textContent = t('menuRandomTitle');
  $('menuRandomSub').textContent = t('menuRandomSub');
  $('menuTopicsTitle').textContent = t('menuTopicsTitle');
  $('menuTopicsSub').textContent = t('menuTopicsSub');
  $('menuMistakesTitle').textContent = t('menuMistakesTitle');
  $('menuMistakesSub').textContent = t('menuMistakesSub');
  $('menuStatsTitle').textContent = t('menuStatsTitle');
  $('menuStatsSub').textContent = t('menuStatsSub');
}


function updateHome(){
  const seenCount = Object.keys(state.seen).length;
  const correctCount = Object.keys(state.correct).length;
  const p = pct(seenCount, QUESTIONS.length);
  $('homeProgressText').textContent = `${p}%`;
  $('homeScoreText').textContent = `${correctCount} ${t('correctWord')} / ${QUESTIONS.length}`;
  $('homeBar').style.width = `${p}%`;

  const progLabel = lang === 'ru' ? 'Прогресс:' : 'Fortschritt:';
  const errWord = lang === 'ru' ? (state.mistakes.length === 1 ? 'ошибка' : ([2,3,4].includes(state.mistakes.length % 10) && ![12,13,14].includes(state.mistakes.length % 100) ? 'ошибки' : 'ошибок')) : t('errors');

  if ($('menuRandomProgress')) $('menuRandomProgress').textContent = `${progLabel} ${p}%`;
  if ($('menuTopicsProgress')) $('menuTopicsProgress').textContent = `${progLabel} ${p}%`;
  if ($('menuMistakesProgress')) $('menuMistakesProgress').textContent = `${state.mistakes.length} ${errWord}`;
}

function updateStats(){
  const seenCount = Object.keys(state.seen).length;
  const total = QUESTIONS.length;
  const p = pct(seenCount, total);
  const mistakesCount = state.mistakes.length;

  $('statsTitle').textContent = t('statsTitle');
  $('statsTotalLabel').textContent = t('statsTotalLabel');
  $('statsSeenLabel').textContent = t('statsSeenLabel');
  $('statsProgressLabel').textContent = t('statsProgressLabel');
  $('statsMistakesLabel').textContent = t('statsMistakesLabel');

  $('statsTotal').textContent = total;
  $('statsSeen').textContent = seenCount;
  $('statsProgress').textContent = `${p}%`;
  $('statsMistakes').textContent = mistakesCount;
}

function startSession(mode){
  let list = [];
  let title = t('learnTitle');
  if(mode === 'exam') { list = shuffle(QUESTIONS).slice(0,40); title = t('examTitle'); }
  else if(mode === 'mistakes') { list = QUESTIONS.filter(q => state.mistakes.includes(q.id)); title = t('mistakesTitle'); }
  else if(mode === 'random') { list = shuffle(QUESTIONS); title = t('randomTitle'); }
  else { list = QUESTIONS.slice(); title = t('learnTitle'); }

  if(!list.length){
    alert(t('noMistakes'));
    return;
  }
  session = {mode, title, list, index:0, good:0, bad:0, answered:false};
  $('modeTitle').textContent = title;
  show('quiz');
  renderQuestion();
}

function renderQuestion(){
  const q = session.list[session.index];
  selected = new Set();
  session.answered = false;
  $('counter').textContent = `${t('question')} ${session.index + 1} ${t('of')} ${session.list.length}`;
  $('score').textContent = `✓ ${session.good} ✕ ${session.bad}`;
  $('quizBar').style.width = `${pct(session.index, session.list.length)}%`;
  const meta = [q.id ? `${t('question')} ${q.id}` : '', q.category || '', q.class || ''].filter(Boolean).join(' · ');
  $('questionMeta').textContent = meta;
  $('questionText').textContent = cleanText(q.question);
  $('feedback').className = 'feedback hidden';
  $('feedback').textContent = '';
  $('nextBtn').classList.add('hidden');
  $('checkBtn').classList.add('hidden');
  $('multiHint').classList.add('hidden');
  $('questionImage').classList.add('hidden');

  if(q.image){
    $('questionImage').src = q.image;
    $('questionImage').classList.remove('hidden');
  }

  const isMulti = (q.correctIndexes || []).length > 1;
  if(isMulti){
    $('multiHint').textContent = t('multi');
    $('multiHint').classList.remove('hidden');
    $('checkBtn').classList.remove('hidden');
  }

  const answers = $('answers');
  answers.innerHTML = '';
  q.answers.forEach((text, idx) => {
    const btn = document.createElement('button');
    btn.className = 'answer';
    btn.textContent = cleanText(text) || '—';
    btn.onclick = () => isMulti ? toggleAnswer(idx, btn) : chooseAnswer(idx);
    answers.appendChild(btn);
  });
}

function toggleAnswer(idx, btn){
  if(session.answered) return;
  if(selected.has(idx)){
    selected.delete(idx);
    btn.classList.remove('selected');
  } else {
    selected.add(idx);
    btn.classList.add('selected');
  }
}

function chooseAnswer(idx){
  selected = new Set([idx]);
  finishAnswer();
}

function finishAnswer(){
  if(session.answered) return;
  session.answered = true;
  const q = session.list[session.index];
  const correctIndexes = q.correctIndexes || [];
  const buttons = [...document.querySelectorAll('.answer')];
  buttons.forEach(b=>b.classList.add('disabled'));
  correctIndexes.forEach(i => buttons[i]?.classList.add('correct'));

  state.seen[q.id] = true;
  if(sameSet(selected, correctIndexes)){
    session.good++;
    state.correct[q.id] = true;
    delete state.wrong[q.id];
    state.mistakes = state.mistakes.filter(id => id !== q.id);
    $('feedback').className = 'feedback ok';
    $('feedback').textContent = q.explanation ? `${t('right')}. ${cleanText(q.explanation)}` : t('right');
  } else {
    session.bad++;
    [...selected].forEach(i => { if(!correctIndexes.includes(i)) buttons[i]?.classList.add('wrong'); });
    state.wrong[q.id] = true;
    delete state.correct[q.id];
    if(!state.mistakes.includes(q.id)) state.mistakes.push(q.id);
    const correctText = correctIndexes.map(i => cleanText(q.answers[i])).join('; ');
    $('feedback').className = 'feedback bad';
    $('feedback').textContent = `${t('wrong')} ${correctText}${q.explanation ? ' — ' + cleanText(q.explanation) : ''}`;
  }
  $('score').textContent = `✓ ${session.good} ✕ ${session.bad}`;
  $('checkBtn').classList.add('hidden');
  $('nextBtn').classList.remove('hidden');
  saveState();
  updateHome();
}


function showResult(){
  const total = session?.list?.length || 0;
  const good = session?.good || 0;
  const bad = session?.bad || 0;
  $('resultTitle').textContent = lang === 'ru' ? 'Результат' : 'Ergebnis';
  $('resultScoreBig').textContent = good;
  $('resultScoreTotal').textContent = lang === 'ru' ? `из ${total}` : `von ${total}`;
  $('resultMessage').textContent = good >= Math.ceil(total * 0.8) ? (lang === 'ru' ? 'Отлично!' : 'Sehr gut!') : (lang === 'ru' ? 'Нужно повторить' : 'Wiederholen');
  $('resultSummary').textContent = lang === 'ru'
    ? `Вы ответили правильно на ${good} из ${total}.`
    : `Du hast ${good} von ${total} richtig beantwortet.`;
  $('resultGoodLabel').textContent = t('correct');
  $('resultBadLabel').textContent = t('errors');
  $('resultGood').textContent = good;
  $('resultBad').textContent = bad;
  $('resultAgainBtn').textContent = lang === 'ru' ? 'Повторить' : 'Wiederholen';
  $('resultHomeBtn').textContent = lang === 'ru' ? 'Главное меню' : 'Hauptmenü';
  show('result');
  updateHome();
}

function nextQuestion(){
  session.index++;
  if(session.index >= session.list.length){
    $('quizBar').style.width = '100%';
    showResult();
    return;
  }
  renderQuestion();
}

$('langDe').onclick = () => { onboardingLang = 'de'; updateOnboardingButtons(); };
$('langRu').onclick = () => { onboardingLang = 'ru'; updateOnboardingButtons(); };
$('themeLight').onclick = () => applyTheme('light');
$('themeDark').onclick = () => applyTheme('dark');
$('onboardingContinue').onclick = () => selectLanguage(onboardingLang);
$('settingsBtn').onclick = () => { onboardingLang = lang || 'de'; updateOnboardingButtons(); show('onboarding'); };
$('menuRandomBtn').onclick = () => startSession('random');
$('menuTopicsBtn').onclick = () => show('home');
$('menuMistakesBtn').onclick = () => startSession('mistakes');
$('menuStatsBtn').onclick = () => { show('stats'); updateStats(); };
$('changeLangBtn').onclick = () => { onboardingLang = lang || 'de'; updateOnboardingButtons(); show('onboarding'); };
$('continueBtn').onclick = () => startSession('learn');
$('examBtn').onclick = () => startSession('exam');
$('mistakesBtn').onclick = () => startSession('mistakes');
$('randomBtn').onclick = () => startSession('random');
$('nextBtn').onclick = nextQuestion;
$('checkBtn').onclick = finishAnswer;
$('backBtn').onclick = () => { show('mainMenu'); updateHome(); };
$('statsBackBtn').onclick = () => { show('mainMenu'); updateHome(); };
$('resultBackBtn').onclick = () => { show('mainMenu'); updateHome(); };
$('resultHomeBtn').onclick = () => { show('mainMenu'); updateHome(); };
$('resultAgainBtn').onclick = () => { if(session?.mode) startSession(session.mode); else show('mainMenu'); };
$('resetBtn').onclick = () => {
  if(confirm(t('resetConfirm'))){
    localStorage.removeItem(storageKey());
    state = loadState();
    updateHome();
  }
};

document.querySelectorAll('.logoMark, .miniLogo').forEach(el => {
  el.onclick = () => {
    onboardingLang = lang || 'de';
    updateOnboardingButtons();
    show('onboarding');
  };
});

applyTheme(theme);
updateOnboardingButtons();
// The first screen must always be language + theme selection.
// We may preselect saved values, but we never skip this screen on startup.
show('onboarding');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Service Worker registered', reg))
      .catch(err => console.error('Service Worker registration failed', err));
  });
}
