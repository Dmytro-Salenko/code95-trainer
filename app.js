const DATASETS = window.DATASETS || { de: [], ru: [] };
const BASE_STORAGE_KEY = 'driver95_mvp_v2';

const UI = {
  de: {
    htmlLang: 'de',
    subtitle: 'Code 95 Trainer. Ohne Registrierung. Einfach Fragen.',
    languageTitle: 'Sprache / Fragenbasis',
    continue: 'Lernen fortsetzen',
    exam: 'Prüfung: 40 Fragen',
    mistakes: 'Fehler wiederholen',
    random: 'Zufällige Fragen',
    reset: 'Fortschritt löschen',
    learnTitle: 'Lernen',
    examTitle: 'Prüfung: 40 Fragen',
    mistakesTitle: 'Fehler wiederholen',
    randomTitle: 'Zufällige Fragen',
    noMistakes: 'Noch keine Fehler. Beantworte zuerst ein paar Fragen.',
    progress: (correct,total) => `${correct} richtig / ${total}`,
    counter: (n,total) => `Frage ${n} von ${total}`,
    meta: (q) => [`ID ${q.id}`, q.category, q.class].filter(Boolean).join(' · '),
    correct: 'Richtig',
    wrong: (answer) => `Falsch. Richtige Antwort: ${answer}`,
    done: (good,bad) => `Fertig. Richtig: ${good}. Fehler: ${bad}.`,
    next: 'Weiter →',
    confirmReset: 'Gesamten Fortschritt löschen?'
  },
  ru: {
    htmlLang: 'ru',
    subtitle: 'Тренажёр Code 95. Без регистрации. Просто вопросы.',
    languageTitle: 'Язык / база вопросов',
    continue: 'Продолжить обучение',
    exam: 'Экзамен: 40 вопросов',
    mistakes: 'Повтор ошибок',
    random: 'Случайные вопросы',
    reset: 'Сбросить прогресс',
    learnTitle: 'Обучение',
    examTitle: 'Экзамен: 40 вопросов',
    mistakesTitle: 'Повтор ошибок',
    randomTitle: 'Случайные вопросы',
    noMistakes: 'Ошибок пока нет. Сначала пройди несколько вопросов.',
    progress: (correct,total) => `${correct} правильно / ${total}`,
    counter: (n,total) => `Вопрос ${n} из ${total}`,
    meta: (q) => [`ID ${q.id}`, q.category, q.class].filter(Boolean).join(' · '),
    correct: 'Правильно',
    wrong: (answer) => `Неправильно. Правильный ответ: ${answer}`,
    done: (good,bad) => `Готово. Правильно: ${good}. Ошибок: ${bad}.`,
    next: 'Следующий →',
    confirmReset: 'Сбросить весь прогресс?'
  }
};

const $ = (id) => document.getElementById(id);
let lang = localStorage.getItem(`${BASE_STORAGE_KEY}_lang`) || 'de';
if (!DATASETS[lang]) lang = 'de';
let QUESTIONS = DATASETS[lang] || [];
let state = loadState();
let session = null;

function storageKey(){ return `${BASE_STORAGE_KEY}_${lang}`; }
function loadState(){
  const fallback = {seen:{}, correct:{}, wrong:{}, mistakes:[], lastIndex:0};
  try { return Object.assign(fallback, JSON.parse(localStorage.getItem(storageKey()) || '{}')); }
  catch { return fallback; }
}
function saveState(){ localStorage.setItem(storageKey(), JSON.stringify(state)); }
function shuffle(arr){ return [...arr].sort(() => Math.random() - 0.5); }
function show(id){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); $(id).classList.add('active'); }
function pct(n,d){ return d ? Math.round((n/d)*100) : 0; }
function t(){ return UI[lang] || UI.de; }
function getCorrectIndexes(q){ return Array.isArray(q.correct) ? q.correct : [q.correct]; }
function isCorrectChoice(q, selected){
  const correct = getCorrectIndexes(q);
  return correct.length === 1 && correct[0] === selected;
}

function applyLanguage(){
  const tr = t();
  document.documentElement.lang = tr.htmlLang;
  $('subtitle').textContent = tr.subtitle;
  $('languageTitle').textContent = tr.languageTitle;
  $('continueBtn').textContent = tr.continue;
  $('examBtn').textContent = tr.exam;
  $('mistakesBtn').textContent = tr.mistakes;
  $('randomBtn').textContent = tr.random;
  $('resetBtn').textContent = tr.reset;
  $('nextBtn').textContent = tr.next;
  document.querySelectorAll('.langBtn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
}

function switchLanguage(nextLang){
  if (!DATASETS[nextLang]) return;
  lang = nextLang;
  localStorage.setItem(`${BASE_STORAGE_KEY}_lang`, lang);
  QUESTIONS = DATASETS[lang] || [];
  state = loadState();
  session = null;
  applyLanguage();
  updateHome();
  show('home');
}

function updateHome(){
  const seenCount = Object.keys(state.seen).length;
  const correctCount = Object.keys(state.correct).length;
  const p = pct(seenCount, QUESTIONS.length);
  $('homeProgressText').textContent = `${p}%`;
  $('homeScoreText').textContent = t().progress(correctCount, QUESTIONS.length);
  $('homeBar').style.width = `${p}%`;
}

function startSession(mode){
  let list = [];
  let title = t().learnTitle;
  if(mode === 'exam') { list = shuffle(QUESTIONS).slice(0,40); title = t().examTitle; }
  else if(mode === 'mistakes') { list = QUESTIONS.filter(q => state.mistakes.includes(String(q.id))); title = t().mistakesTitle; }
  else if(mode === 'random') { list = shuffle(QUESTIONS); title = t().randomTitle; }
  else { list = QUESTIONS.slice(state.lastIndex).concat(QUESTIONS.slice(0,state.lastIndex)); title = t().learnTitle; }

  if(!list.length){
    alert(t().noMistakes);
    return;
  }
  session = {mode, title, list, index:0, good:0, bad:0, answered:false};
  $('modeTitle').textContent = title;
  show('quiz');
  renderQuestion();
}

function renderQuestion(){
  const q = session.list[session.index];
  session.answered = false;
  $('counter').textContent = t().counter(session.index + 1, session.list.length);
  $('score').textContent = `✓ ${session.good} ✕ ${session.bad}`;
  $('quizBar').style.width = `${pct(session.index, session.list.length)}%`;
  $('questionMeta').textContent = t().meta(q);
  $('questionText').textContent = q.question;
  $('feedback').className = 'feedback hidden';
  $('feedback').textContent = '';
  $('nextBtn').classList.add('hidden');

  const img = $('questionImage');
  if(q.image){ img.src = q.image; img.classList.remove('hidden'); }
  else { img.removeAttribute('src'); img.classList.add('hidden'); }

  const answers = $('answers');
  answers.innerHTML = '';
  q.answers.forEach((text, idx) => {
    const btn = document.createElement('button');
    btn.className = 'answer';
    btn.textContent = text || '—';
    btn.onclick = () => chooseAnswer(idx);
    answers.appendChild(btn);
  });
}

function chooseAnswer(idx){
  if(session.answered) return;
  session.answered = true;
  const q = session.list[session.index];
  const correctIndexes = getCorrectIndexes(q);
  const buttons = [...document.querySelectorAll('.answer')];
  buttons.forEach(b=>b.classList.add('disabled'));
  correctIndexes.forEach(i => buttons[i]?.classList.add('correct'));

  const qid = String(q.id);
  state.seen[qid] = true;
  const realIndex = QUESTIONS.findIndex(x => String(x.id) === qid);
  state.lastIndex = realIndex + 1;
  if(state.lastIndex >= QUESTIONS.length) state.lastIndex = 0;

  if(isCorrectChoice(q, idx)){
    session.good++;
    state.correct[qid] = true;
    delete state.wrong[qid];
    state.mistakes = state.mistakes.filter(id => id !== qid);
    $('feedback').className = 'feedback ok';
    $('feedback').textContent = q.explanation ? `${t().correct}. ${q.explanation}` : t().correct;
  } else {
    session.bad++;
    buttons[idx]?.classList.add('wrong');
    state.wrong[qid] = true;
    delete state.correct[qid];
    if(!state.mistakes.includes(qid)) state.mistakes.push(qid);
    const correctText = correctIndexes.map(i => q.answers[i]).join(' / ');
    $('feedback').className = 'feedback bad';
    $('feedback').textContent = q.explanation ? `${t().wrong(correctText)}. ${q.explanation}` : t().wrong(correctText);
  }
  $('score').textContent = `✓ ${session.good} ✕ ${session.bad}`;
  $('nextBtn').classList.remove('hidden');
  saveState();
  updateHome();
}

function nextQuestion(){
  session.index++;
  if(session.index >= session.list.length){
    $('quizBar').style.width = '100%';
    alert(t().done(session.good, session.bad));
    show('home');
    updateHome();
    return;
  }
  renderQuestion();
}

$('continueBtn').onclick = () => startSession('learn');
$('examBtn').onclick = () => startSession('exam');
$('mistakesBtn').onclick = () => startSession('mistakes');
$('randomBtn').onclick = () => startSession('random');
$('nextBtn').onclick = nextQuestion;
$('backBtn').onclick = () => { show('home'); updateHome(); };
$('resetBtn').onclick = () => {
  if(confirm(t().confirmReset)){
    localStorage.removeItem(storageKey());
    state = loadState();
    updateHome();
  }
};
$('langDe').onclick = () => switchLanguage('de');
$('langRu').onclick = () => switchLanguage('ru');

applyLanguage();
updateHome();
