const DATA = window.DRIVER95_DATA || {de: [], ru: []};
const BASE_STORAGE_KEY = 'driver95_mvp_v2';
const LANG_KEY = 'driver95_lang';
const THEME_KEY = 'driver95_theme';
const ONBOARDED_KEY = 'driver95_onboarded';

const I18N = {
  de: {
    code: 'DE', subtitle: 'Code 95 Trainer.', continue: 'Lernen fortsetzen', exam: 'Prüfung (40 Fragen)',
    mistakes: 'Fehler wiederholen', random: 'Zufällige Fragen', reset: 'Fortschritt zurücksetzen',
    learnTitle: 'Lernen', examTitle: 'Prüfung (40 Fragen)', mistakesTitle: 'Fehler wiederholen', randomTitle: 'Zufällige Fragen',
    correctWord: 'richtig', question: 'Frage', of: 'von', check: 'Prüfen', next: 'Weiter →',
    noMistakes: 'Noch keine Fehler vorhanden.', resetConfirm: 'Fortschritt zurücksetzen?',
    right: 'Richtig', wrong: 'Falsch. Richtige Antwort:', done: 'Fertig.', correct: 'Richtig', errors: 'Fehler',
    multi: 'Mehrere Antworten möglich.',
    language: 'Sprache', theme: 'Design', themeLight: 'Hell', themeDark: 'Dunkel',
    onboardingContinue: 'Weiter', settings: 'Einstellungen', settingsSubtitle: 'Sprache und Design.'
  },
  ru: {
    code: 'RU', subtitle: 'Тренажёр Code 95.', continue: 'Продолжить обучение', exam: 'Экзамен (40 вопросов)',
    mistakes: 'Повторить ошибки', random: 'Случайные вопросы', reset: 'Сбросить прогресс',
    learnTitle: 'Обучение', examTitle: 'Экзамен (40 вопросов)', mistakesTitle: 'Повтор ошибок', randomTitle: 'Случайные вопросы',
    correctWord: 'правильно', question: 'Вопрос', of: 'из', check: 'Проверить', next: 'Дальше →',
    noMistakes: 'Ошибок пока нет.', resetConfirm: 'Сбросить прогресс?',
    right: 'Правильно', wrong: 'Неправильно. Правильный ответ:', done: 'Готово.', correct: 'Правильно', errors: 'Ошибок',
    multi: 'Возможны несколько правильных ответов.',
    language: 'Язык', theme: 'Тема', themeLight: 'Светлая', themeDark: 'Тёмная',
    onboardingContinue: 'Продолжить', settings: 'Настройки', settingsSubtitle: 'Язык и тема.'
  }
};

const $ = (id) => document.getElementById(id);
let lang = localStorage.getItem(LANG_KEY) || 'de';
let theme = localStorage.getItem(THEME_KEY) || 'light';
let QUESTIONS = [];
let state = null;
let session = null;
let selected = new Set();

function storageKey(){ return `${BASE_STORAGE_KEY}_${lang}`; }
function t(key){ return I18N[lang][key]; }
function isOnboarded(){
  if(localStorage.getItem(ONBOARDED_KEY) === '1') return true;
  const savedLang = localStorage.getItem(LANG_KEY);
  return Boolean(savedLang && DATA[savedLang]);
}

function loadState(){
  const fallback = {seen:{}, correct:{}, wrong:{}, mistakes:[], lastIndex:0};
  try { return Object.assign(fallback, JSON.parse(localStorage.getItem(storageKey()) || '{}')); }
  catch { return fallback; }
}
function saveState(){ localStorage.setItem(storageKey(), JSON.stringify(state)); }
function shuffle(arr){ return [...arr].sort(() => Math.random() - 0.5); }
function show(id){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); $(id).classList.add('active'); }
function pct(n,d){ return d ? Math.round((n/d)*100) : 0; }
function sameSet(a,b){ return a.size === b.length && b.every(x => a.has(x)); }
function cleanText(value){
  const el = document.createElement('textarea');
  el.innerHTML = String(value ?? '');
  return el.value.replace(/\u00a0/g, ' ').trim();
}

function applyTheme(nextTheme){
  theme = nextTheme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.content = theme === 'dark' ? '#111827' : '#f3f4f6';
  syncChoiceButtons('theme', theme);
}

function syncChoiceButtons(kind, value){
  document.querySelectorAll(`[data-${kind}]`).forEach(btn => {
    btn.classList.toggle('selected', btn.dataset[kind] === value);
  });
}

function setLanguage(nextLang, { persist = true } = {}){
  if(!DATA[nextLang]) return false;
  lang = nextLang;
  if(persist) localStorage.setItem(LANG_KEY, lang);
  QUESTIONS = DATA[lang] || [];
  state = loadState();
  document.documentElement.lang = lang === 'ru' ? 'ru' : 'de';
  syncChoiceButtons('lang', lang);
  applyLanguage();
  updateHome();
  return true;
}

function applyLanguage(){
  $('langBadge').textContent = t('code');
  $('homeSubtitle').textContent = t('subtitle');
  $('continueBtn').textContent = t('continue');
  $('examBtn').textContent = t('exam');
  $('mistakesBtn').textContent = t('mistakes');
  $('randomBtn').textContent = t('random');
  $('resetBtn').textContent = t('reset');
  $('checkBtn').textContent = t('check');
  $('nextBtn').textContent = t('next');
  applyPreferenceLabels();
}

function applyPreferenceLabels(){
  const ids = [
    ['onboardingLangLabel', 'language'],
    ['onboardingThemeLabel', 'theme'],
    ['onboardingSubtitle', 'subtitle'],
    ['onboardingContinueBtn', 'onboardingContinue'],
    ['settingsTitle', 'settings'],
    ['settingsSubtitle', 'settingsSubtitle'],
    ['settingsLangLabel', 'language'],
    ['settingsThemeLabel', 'theme']
  ];
  ids.forEach(([id, key]) => {
    const el = $(id);
    if(el) el.textContent = t(key);
  });
  const themeLabels = [
    ['onboardThemeLight', 'settingsThemeLight', 'themeLight'],
    ['onboardThemeDark', 'settingsThemeDark', 'themeDark']
  ];
  themeLabels.forEach(([onboardId, settingsId, key]) => {
    const label = t(key);
    if($(onboardId)) $(onboardId).textContent = label;
    if($(settingsId)) $(settingsId).textContent = label;
  });
  const settingsBtn = $('settingsBtn');
  if(settingsBtn) settingsBtn.setAttribute('aria-label', t('settings'));
}

function enterHome(){
  if(!setLanguage(lang)) return;
  show('home');
}

function finishOnboarding(){
  localStorage.setItem(ONBOARDED_KEY, '1');
  applyTheme(theme);
  enterHome();
}

function openSettings(){
  syncChoiceButtons('lang', lang);
  syncChoiceButtons('theme', theme);
  applyPreferenceLabels();
  show('settings');
}

function bindChoiceGroup(kind, onPick){
  document.querySelectorAll(`[data-${kind}]`).forEach(btn => {
    btn.onclick = () => {
      onPick(btn.dataset[kind]);
      syncChoiceButtons(kind, btn.dataset[kind]);
    };
  });
}

function updateHome(){
  if(!state || !QUESTIONS.length) return;
  const seenCount = Object.keys(state.seen).length;
  const correctCount = Object.keys(state.correct).length;
  const p = pct(seenCount, QUESTIONS.length);
  $('homeProgressText').textContent = `${p}%`;
  $('homeScoreText').textContent = `${correctCount} ${t('correctWord')} / ${QUESTIONS.length}`;
  $('homeBar').style.width = `${p}%`;
}

function startSession(mode){
  let list = [];
  let title = t('learnTitle');
  if(mode === 'exam') { list = shuffle(QUESTIONS).slice(0,40); title = t('examTitle'); }
  else if(mode === 'mistakes') { list = QUESTIONS.filter(q => state.mistakes.includes(q.id)); title = t('mistakesTitle'); }
  else if(mode === 'random') { list = shuffle(QUESTIONS); title = t('randomTitle'); }
  else { list = QUESTIONS.slice(state.lastIndex).concat(QUESTIONS.slice(0,state.lastIndex)); title = t('learnTitle'); }

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
  const originalIndex = QUESTIONS.findIndex(x => x.id === q.id);
  state.lastIndex = originalIndex >= 0 ? originalIndex + 1 : 0;
  if(state.lastIndex >= QUESTIONS.length) state.lastIndex = 0;

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

function nextQuestion(){
  session.index++;
  if(session.index >= session.list.length){
    $('quizBar').style.width = '100%';
    alert(`${t('done')} ${t('correct')}: ${session.good}. ${t('errors')}: ${session.bad}.`);
    show('home');
    updateHome();
    return;
  }
  renderQuestion();
}

function bindLangChoices(prefix, persist){
  document.querySelectorAll(`#${prefix === 'onboard' ? 'onboarding' : 'settings'} [data-lang]`).forEach(btn => {
    btn.onclick = () => {
      const value = btn.dataset.lang;
      if(persist) setLanguage(value);
      else {
        lang = value;
        syncChoiceButtons('lang', lang);
        applyPreferenceLabels();
      }
    };
  });
}

bindLangChoices('onboard', false);
bindLangChoices('settings', true);

bindChoiceGroup('theme', (value) => {
  applyTheme(value);
});

$('onboardingContinueBtn').onclick = finishOnboarding;
$('settingsBtn').onclick = openSettings;
$('settingsBackBtn').onclick = () => show('home');
$('continueBtn').onclick = () => startSession('learn');
$('examBtn').onclick = () => startSession('exam');
$('mistakesBtn').onclick = () => startSession('mistakes');
$('randomBtn').onclick = () => startSession('random');
$('nextBtn').onclick = nextQuestion;
$('checkBtn').onclick = finishAnswer;
$('backBtn').onclick = () => { show('home'); updateHome(); };
$('resetBtn').onclick = () => {
  if(confirm(t('resetConfirm'))){
    localStorage.removeItem(storageKey());
    state = loadState();
    updateHome();
  }
};

applyTheme(theme);

if(isOnboarded() && DATA[lang]){
  if(localStorage.getItem(ONBOARDED_KEY) !== '1') localStorage.setItem(ONBOARDED_KEY, '1');
  setLanguage(lang, { persist: false });
  show('home');
} else {
  if(DATA[lang]) lang = localStorage.getItem(LANG_KEY) || lang;
  syncChoiceButtons('lang', lang);
  syncChoiceButtons('theme', theme);
  applyPreferenceLabels();
  show('onboarding');
}
