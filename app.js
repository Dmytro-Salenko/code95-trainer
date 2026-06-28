const DATA = window.DRIVER95_DATA || { de: [], ru: [] };
const BASE_STORAGE_KEY = 'driver95_mvp_v3';

const I18N = {
  de: {
    htmlLang: 'de', chooseLanguage: 'Sprache wählen', theme: 'Thema', start: 'Weiter',
    welcomeTitle: 'Willkommen!', welcomeText: 'Trainieren Sie weiter und verbessern Sie Ihr Wissen.',
    randomTitle: 'Zufällige Fragen', randomDesc: 'Training in zufälliger Reihenfolge',
    learnTitle: 'Lernen', learnDesc: 'Fragen der Reihe nach lernen',
    mistakesTitle: 'Fehler', mistakesDesc: 'Ihre falschen Antworten',
    examTitle: 'Prüfung', examDesc: '40 zufällige Fragen', examReady: 'Bereitschaft prüfen',
    progress: 'Fortschritt', mistakesCount: 'Fehler', training: 'Training', stats: 'Statistik', favorites: 'Favoriten', settings: 'Einstellungen',
    learnMode: 'Lernen', examMode: 'Prüfung', mistakesMode: 'Fehler wiederholen', randomMode: 'Zufällige Fragen',
    question: 'Frage', of: 'von', check: 'Antwort prüfen', next: 'Nächste Frage',
    multi: 'Mehrere Antworten möglich.', noMistakes: 'Noch keine Fehler vorhanden.',
    right: 'Richtig', wrong: 'Falsch. Richtige Antwort:', doneTitle: 'Ergebnis', excellent: 'Sehr gut! 🎉', good: 'Gut gemacht!', morePractice: 'Weiter üben',
    resultSummary: 'Sie haben {good} von {total} richtig beantwortet', correct: 'Richtig', incorrect: 'Falsch', repeat: 'Wiederholen', nextBlock: 'Nächster Block',
    settingsLang: 'Sprache', settingsTheme: 'Thema', reset: 'Fortschritt zurücksetzen', resetConfirm: 'Fortschritt zurücksetzen?',
    light: '☀️ Hell', dark: '🌙 Dunkel', statsAlert: 'Statistik kommt in der nächsten Version.'
  },
  ru: {
    htmlLang: 'ru', chooseLanguage: 'Выберите язык', theme: 'Тема', start: 'Продолжить',
    welcomeTitle: 'Добро пожаловать!', welcomeText: 'Продолжайте обучение и повышайте свои знания.',
    randomTitle: 'Случайные вопросы', randomDesc: 'Тренировка в случайном порядке',
    learnTitle: 'Темы', learnDesc: 'Вопросы по порядку',
    mistakesTitle: 'Ошибки', mistakesDesc: 'Ваши неправильные ответы',
    examTitle: 'Экзамен', examDesc: '40 случайных вопросов', examReady: 'Проверьте готовность',
    progress: 'Прогресс', mistakesCount: 'ошибок', training: 'Тренировка', stats: 'Статистика', favorites: 'Избранное', settings: 'Настройки',
    learnMode: 'Обучение', examMode: 'Экзамен', mistakesMode: 'Повтор ошибок', randomMode: 'Случайные вопросы',
    question: 'Вопрос', of: 'из', check: 'Проверить ответ', next: 'Следующий вопрос',
    multi: 'Возможны несколько правильных ответов.', noMistakes: 'Ошибок пока нет.',
    right: 'Правильно', wrong: 'Неправильно. Правильный ответ:', doneTitle: 'Результат', excellent: 'Отлично! 🎉', good: 'Хорошо!', morePractice: 'Нужно повторить',
    resultSummary: 'Вы ответили правильно на {good} из {total}', correct: 'Правильные', incorrect: 'Неправильные', repeat: 'Повторить', nextBlock: 'Следующий блок',
    settingsLang: 'Язык', settingsTheme: 'Тема', reset: 'Сбросить прогресс', resetConfirm: 'Сбросить прогресс?',
    light: '☀️ Светлая', dark: '🌙 Тёмная', statsAlert: 'Статистика будет в следующей версии.'
  }
};

const $ = (id) => document.getElementById(id);
let lang = localStorage.getItem('driver95_lang') || 'de';
let theme = localStorage.getItem('driver95_theme') || 'dark';
let QUESTIONS = [];
let state = null;
let session = null;
let lastMode = 'random';
let selected = new Set();

function storageKey(){ return `${BASE_STORAGE_KEY}_${lang}`; }
function t(key){ return (I18N[lang] || I18N.de)[key] || key; }
function pct(n,d){ return d ? Math.round((n/d)*100) : 0; }
function sameSet(a,b){ return a.size === b.length && b.every(x => a.has(x)); }
function shuffle(arr){ return [...arr].sort(() => Math.random() - 0.5); }
function cleanText(value){
  const el = document.createElement('textarea');
  el.innerHTML = String(value ?? '');
  return el.value.replace(/\u00a0/g, ' ').trim();
}
function show(id){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); $(id).classList.add('active'); }

function loadState(){
  const fallback = {seen:{}, correct:{}, wrong:{}, mistakes:[], lastIndex:0};
  try { return Object.assign(fallback, JSON.parse(localStorage.getItem(storageKey()) || '{}')); }
  catch { return fallback; }
}
function saveState(){ localStorage.setItem(storageKey(), JSON.stringify(state)); }

function applyTheme(nextTheme = theme){
  theme = nextTheme;
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('driver95_theme', theme);
  document.querySelectorAll('[data-theme]').forEach(btn => btn.classList.toggle('active', btn.dataset.theme === theme));
}

function setLanguage(nextLang){
  lang = nextLang;
  localStorage.setItem('driver95_lang', lang);
  QUESTIONS = DATA[lang] || [];
  state = loadState();
  applyLanguage();
  updateHome();
}

function applyLanguage(){
  document.documentElement.lang = t('htmlLang');
  $('onboardLanguageTitle').textContent = t('chooseLanguage');
  $('onboardThemeTitle').textContent = t('theme');
  $('startBtn').textContent = t('start');
  $('welcomeTitle').textContent = t('welcomeTitle');
  $('welcomeText').textContent = t('welcomeText');
  $('randomTitle').textContent = t('randomTitle');
  $('randomDesc').textContent = t('randomDesc');
  $('learnTitle').textContent = t('learnTitle');
  $('learnDesc').textContent = t('learnDesc');
  $('mistakesTitle').textContent = t('mistakesTitle');
  $('mistakesDesc').textContent = t('mistakesDesc');
  $('examTitle').textContent = t('examTitle');
  $('examDesc').textContent = t('examDesc');
  $('examProgress').textContent = t('examReady');
  $('navTraining').textContent = t('training');
  $('navStats').textContent = t('stats');
  $('navFav').textContent = t('favorites');
  $('navSettings').textContent = t('settings');
  $('checkBtn').textContent = t('check');
  $('nextBtn').textContent = t('next');
  $('resultTitle').textContent = t('doneTitle');
  $('resultCorrectLabel').textContent = t('correct');
  $('resultWrongLabel').textContent = t('incorrect');
  $('repeatBtn').textContent = t('repeat');
  $('nextBlockBtn').textContent = t('nextBlock');
  $('settingsTitle').textContent = t('settings');
  $('settingsLangTitle').textContent = t('settingsLang');
  $('settingsThemeTitle').textContent = t('settingsTheme');
  $('resetBtn').textContent = t('reset');
  document.querySelectorAll('[data-lang]').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
  document.querySelectorAll('[data-theme="light"]').forEach(btn => btn.textContent = t('light'));
  document.querySelectorAll('[data-theme="dark"]').forEach(btn => btn.textContent = t('dark'));
}

function updateHome(){
  if(!state) return;
  const seenCount = Object.keys(state.seen).length;
  const p = pct(seenCount, QUESTIONS.length);
  $('randomProgress').textContent = `${t('progress')}: ${p}%`;
  $('learnProgress').textContent = `${t('progress')}: ${p}%`;
  $('mistakesProgress').textContent = `${state.mistakes.length} ${t('mistakesCount')}`;
}

function startApp(){
  localStorage.setItem('driver95_onboarded', '1');
  setLanguage(lang);
  applyTheme(theme);
  show('home');
}

function startSession(mode){
  let list = [];
  let title = t('learnMode');
  lastMode = mode;
  if(mode === 'exam') { list = shuffle(QUESTIONS).slice(0,40); title = t('examMode'); }
  else if(mode === 'mistakes') { list = QUESTIONS.filter(q => state.mistakes.includes(q.id)); title = t('mistakesMode'); }
  else if(mode === 'random') { list = shuffle(QUESTIONS); title = t('randomMode'); }
  else { list = QUESTIONS.slice(state.lastIndex).concat(QUESTIONS.slice(0,state.lastIndex)); title = t('learnMode'); }

  if(!list.length){ alert(t('noMistakes')); return; }
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
  if(selected.has(idx)){ selected.delete(idx); btn.classList.remove('selected'); }
  else { selected.add(idx); btn.classList.add('selected'); }
}
function chooseAnswer(idx){ selected = new Set([idx]); finishAnswer(); }

function finishAnswer(){
  if(session.answered) return;
  const q = session.list[session.index];
  if((q.correctIndexes || []).length > 1 && selected.size === 0) return;
  session.answered = true;
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
  if(session.index >= session.list.length){ showResult(); return; }
  renderQuestion();
}

function showResult(){
  $('quizBar').style.width = '100%';
  const total = session.list.length;
  const p = pct(session.good, total);
  $('resultGood').textContent = session.good;
  $('resultTotal').textContent = `${t('of')} ${total}`;
  $('resultMessage').textContent = p >= 80 ? t('excellent') : p >= 60 ? t('good') : t('morePractice');
  $('resultSummary').textContent = t('resultSummary').replace('{good}', session.good).replace('{total}', total);
  $('resultCorrect').textContent = session.good;
  $('resultWrong').textContent = session.bad;
  show('result');
}

function openSettings(){ applyLanguage(); applyTheme(theme); show('settings'); }

function bindEvents(){
  document.querySelectorAll('.lang-choice,.settings-lang').forEach(btn => btn.onclick = () => { setLanguage(btn.dataset.lang); });
  document.querySelectorAll('.theme-choice,.settings-theme').forEach(btn => btn.onclick = () => { applyTheme(btn.dataset.theme); });
  $('startBtn').onclick = startApp;
  $('homeLogoBtn').onclick = () => show('home');
  $('settingsBtn').onclick = openSettings;
  $('settingsBtn2').onclick = openSettings;
  $('settingsBackBtn').onclick = () => { updateHome(); show('home'); };
  $('continueBtn').onclick = () => startSession('learn');
  $('examBtn').onclick = () => startSession('exam');
  $('mistakesBtn').onclick = () => startSession('mistakes');
  $('randomBtn').onclick = () => startSession('random');
  $('statsBtn').onclick = () => alert(t('statsAlert'));
  $('nextBtn').onclick = nextQuestion;
  $('checkBtn').onclick = finishAnswer;
  $('backBtn').onclick = () => { updateHome(); show('home'); };
  $('resultBackBtn').onclick = () => { updateHome(); show('home'); };
  $('repeatBtn').onclick = () => startSession(lastMode);
  $('nextBlockBtn').onclick = () => startSession('random');
  $('resetBtn').onclick = () => {
    if(confirm(t('resetConfirm'))){
      localStorage.removeItem(storageKey());
      state = loadState();
      updateHome();
      show('home');
    }
  };
}

function init(){
  bindEvents();
  applyTheme(theme);
  setLanguage(lang && DATA[lang] ? lang : 'de');
  if(localStorage.getItem('driver95_onboarded') || localStorage.getItem('driver95_lang')) show('home');
  else show('onboarding');
}

init();
