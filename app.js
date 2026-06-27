const STORAGE_KEY = 'driver95_mvp_v1';
const QUESTIONS = window.QUESTIONS || [];

const $ = (id) => document.getElementById(id);
const state = loadState();
let session = null;

function loadState(){
  const fallback = {seen:{}, correct:{}, wrong:{}, mistakes:[], lastIndex:0};
  try { return Object.assign(fallback, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')); }
  catch { return fallback; }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function shuffle(arr){ return [...arr].sort(() => Math.random() - 0.5); }
function show(id){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); $(id).classList.add('active'); }
function pct(n,d){ return d ? Math.round((n/d)*100) : 0; }

function updateHome(){
  const seenCount = Object.keys(state.seen).length;
  const correctCount = Object.keys(state.correct).length;
  const p = pct(seenCount, QUESTIONS.length);
  $('homeProgressText').textContent = `${p}%`;
  $('homeScoreText').textContent = `${correctCount} правильно / ${QUESTIONS.length}`;
  $('homeBar').style.width = `${p}%`;
}

function startSession(mode){
  let list = [];
  let title = 'Обучение';
  if(mode === 'exam') { list = shuffle(QUESTIONS).slice(0,40); title = 'Экзамен 40 вопросов'; }
  else if(mode === 'mistakes') { list = QUESTIONS.filter(q => state.mistakes.includes(q.id)); title = 'Повтор ошибок'; }
  else if(mode === 'random') { list = shuffle(QUESTIONS); title = 'Случайные вопросы'; }
  else { list = QUESTIONS.slice(state.lastIndex).concat(QUESTIONS.slice(0,state.lastIndex)); title = 'Обучение'; }

  if(!list.length){
    alert('Ошибок пока нет. Сначала пройди несколько вопросов.');
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
  $('counter').textContent = `Вопрос ${session.index + 1} из ${session.list.length}`;
  $('score').textContent = `✓ ${session.good} ✕ ${session.bad}`;
  $('quizBar').style.width = `${pct(session.index, session.list.length)}%`;
  $('questionMeta').textContent = `Frage ${q.id} · ${q.topic} · ${q.class}`;
  $('questionText').textContent = q.question;
  $('feedback').className = 'feedback hidden';
  $('feedback').textContent = '';
  $('nextBtn').classList.add('hidden');
  const answers = $('answers');
  answers.innerHTML = '';
  q.answers.forEach((text, idx) => {
    const btn = document.createElement('button');
    btn.className = 'answer';
    btn.textContent = text;
    btn.onclick = () => chooseAnswer(idx);
    answers.appendChild(btn);
  });
}

function chooseAnswer(idx){
  if(session.answered) return;
  session.answered = true;
  const q = session.list[session.index];
  const buttons = [...document.querySelectorAll('.answer')];
  buttons.forEach(b=>b.classList.add('disabled'));
  buttons[q.correct].classList.add('correct');
  state.seen[q.id] = true;
  state.lastIndex = QUESTIONS.findIndex(x => x.id === q.id) + 1;
  if(state.lastIndex >= QUESTIONS.length) state.lastIndex = 0;

  if(idx === q.correct){
    session.good++;
    state.correct[q.id] = true;
    delete state.wrong[q.id];
    state.mistakes = state.mistakes.filter(id => id !== q.id);
    $('feedback').className = 'feedback ok';
    $('feedback').textContent = 'Правильно';
  } else {
    session.bad++;
    buttons[idx].classList.add('wrong');
    state.wrong[q.id] = true;
    delete state.correct[q.id];
    if(!state.mistakes.includes(q.id)) state.mistakes.push(q.id);
    $('feedback').className = 'feedback bad';
    $('feedback').textContent = `Неправильно. Правильный ответ: ${q.answers[q.correct]}`;
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
    alert(`Готово. Правильно: ${session.good}. Ошибок: ${session.bad}.`);
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
  if(confirm('Сбросить весь прогресс?')){
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
};

updateHome();
