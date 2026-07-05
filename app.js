const DATA = window.DRIVER95_DATA || {de: [], ru: [], en: [], es: [], pl: [], it: [], tr: [], uk: []};
const BASE_STORAGE_KEY = 'driver95_mvp_v2';

const I18N = {
  de: {
    code: 'DE', subtitle: 'Code 95 Trainer', continue: 'Lernen', exam: 'Prüfung (40 Fragen)',
    mistakes: 'Fehler wiederholen', random: 'Zufällige Fragen', reset: 'Fortschritt zurücksetzen',
    learnTitle: 'Lernen', examTitle: 'Prüfung (40 Fragen)', mistakesTitle: 'Fehler wiederholen', randomTitle: 'Zufällige Fragen',
    correctWord: 'richtig', question: 'Frage', of: 'von', check: 'Prüfen', next: 'Weiter →',
    noMistakes: 'Noch keine Fehler vorhanden.', resetConfirm: 'Fortschritt zurücksetzen?',
    favoritesTitle: 'Favoriten', noFavorites: 'Du hast noch keine Favoriten. Tippe während des Tests auf ❤️, um schwierige Fragen zu speichern.', emptyFavorites: 'Du hast keine Favoriten mehr.',
    menuCorrectTitle: 'Richtig beantwortet', menuCorrectSub: 'Zuletzt richtig gelöste Fragen', menuIncorrectTitle: 'Falsch beantwortet', menuIncorrectSub: 'Zuletzt falsch gelöste Fragen', emptySection: 'Herzlichen Glückwunsch! In diesem Bereich sind derzeit keine Fragen vorhanden.',
    right: 'Richtig', wrong: 'Falsch. Richtige Antwort:', done: 'Fertig.', correct: 'Richtig', errors: 'Fehler',
    multi: 'Mehrere Antworten möglich.',
    welcomeTitle: 'Willkommen!', welcomeSubtitle: 'Trainiere weiter und verbessere dein Wissen.',
    menuRandomTitle: 'Zufällige Fragen', menuRandomSub: 'Training in zufälliger Reihenfolge',
    menuTopicsTitle: 'Training', menuTopicsSub: 'Lernen, Prüfung und Fortschritt',
    menuMistakesTitle: 'Fehler', menuMistakesSub: 'Deine falschen Antworten',
    menuStatsTitle: 'Statistik', menuStatsSub: 'Deine Ergebnisse und Fortschritt',
    statsTitle: 'Statistik', statsTotalLabel: 'Fragen insgesamt', statsSeenLabel: 'Gesehene Fragen', statsProgressLabel: 'Fortschritt', statsMistakesLabel: 'Fehler',
    settingsTitle: 'Einstellungen', settingsLangTitle: 'Sprache', settingsThemeTitle: 'Design', settingsReset: 'Fortschritt zurücksetzen',
    progLabel: 'Fortschritt:',
    resultTitle: 'Ergebnis', resultOf: 'von {total}', resultSuccess: 'Sehr gut!', resultFail: 'Wiederholen',
    resultSummary: 'Du hast {good} von {total} richtig beantwortet.', resultAgain: 'Wiederholen', resultHome: 'Hauptmenü'
  },
  en: {
    code: 'EN', subtitle: 'Code 95 Trainer', continue: 'Learn', exam: 'Exam (40 questions)',
    mistakes: 'Repeat mistakes', random: 'Random questions', reset: 'Reset progress',
    learnTitle: 'Learn', examTitle: 'Exam (40 questions)', mistakesTitle: 'Repeat mistakes', randomTitle: 'Random questions',
    correctWord: 'correct', question: 'Question', of: 'of', check: 'Check', next: 'Next →',
    noMistakes: 'No mistakes yet.', resetConfirm: 'Reset progress?',
    favoritesTitle: 'Favorites', noFavorites: 'You have no favorite questions yet. Tap ❤️ during the test to save difficult questions.', emptyFavorites: 'You have no more favorite questions.',
    menuCorrectTitle: 'Correct answers', menuCorrectSub: 'Questions answered correctly last time', menuIncorrectTitle: 'Incorrect answers', menuIncorrectSub: 'Questions answered incorrectly last time', emptySection: 'Congratulations! There are currently no questions in this section.',
    right: 'Correct', wrong: 'Incorrect. Correct answer:', done: 'Done.', correct: 'Correct', errors: 'Errors',
    multi: 'Multiple answers possible.',
    welcomeTitle: 'Welcome!', welcomeSubtitle: 'Keep training and improve your knowledge.',
    menuRandomTitle: 'Random questions', menuRandomSub: 'Training in random order',
    menuTopicsTitle: 'Training', menuTopicsSub: 'Learning, exam and progress',
    menuMistakesTitle: 'Mistakes', menuMistakesSub: 'Your incorrect answers',
    menuStatsTitle: 'Statistics', menuStatsSub: 'Your results and progress',
    statsTitle: 'Statistics', statsTotalLabel: 'Total Questions', statsSeenLabel: 'Seen Questions', statsProgressLabel: 'Progress', statsMistakesLabel: 'Mistakes',
    settingsTitle: 'Settings', settingsLangTitle: 'Language', settingsThemeTitle: 'Theme', settingsReset: 'Reset Progress',
    progLabel: 'Progress:',
    resultTitle: 'Result', resultOf: 'of {total}', resultSuccess: 'Excellent!', resultFail: 'Need to repeat',
    resultSummary: 'You answered {good} of {total} correctly.', resultAgain: 'Repeat', resultHome: 'Main Menu'
  },
  ru: {
    code: 'RU', subtitle: 'Тренажёр Code 95', continue: 'Обучение', exam: 'Экзамен (40 вопросов)',
    mistakes: 'Повторить ошибки', random: 'Случайные вопросы', reset: 'Сбросить прогресс',
    learnTitle: 'Обучение', examTitle: 'Экзамен (40 вопросов)', mistakesTitle: 'Повтор ошибок', randomTitle: 'Случайные вопросы',
    correctWord: 'правильно', question: 'Вопрос', of: 'из', check: 'Проверить', next: 'Дальше →',
    noMistakes: 'Ошибок пока нет.', resetConfirm: 'Сбросить прогресс?',
    favoritesTitle: 'Избранное', noFavorites: 'У вас пока нет избранных вопросов. Нажимайте ❤️ во время прохождения тестов, чтобы сохранить сложные вопросы.', emptyFavorites: 'У вас больше нет избранных вопросов.',
    menuCorrectTitle: 'Правильные ответы', menuCorrectSub: 'Вопросы, решенные верно в последний раз', menuIncorrectTitle: 'Неправильные ответы', menuIncorrectSub: 'Вопросы, решенные неверно в последний раз', emptySection: 'Поздравляем! Сейчас в этом разделе больше нет вопросов.',
    right: 'Правильно', wrong: 'Неправильно. Правильный ответ:', done: 'Готово.', correct: 'Правильно', errors: 'Ошибок',
    multi: 'Возможны несколько правильных ответов.',
    welcomeTitle: 'Добро пожаловать!', welcomeSubtitle: 'Продолжайте обучение и повышайте свои знания.',
    menuRandomTitle: 'Случайные вопросы', menuRandomSub: 'Тренировка в случайном порядке',
    menuTopicsTitle: 'Тренировка', menuTopicsSub: 'Обучение, экзамен и прогресс',
    menuMistakesTitle: 'Ошибки', menuMistakesSub: 'Ваши неправильные ответы',
    menuStatsTitle: 'Статистика', menuStatsSub: 'Ваши результаты и прогресс',
    statsTitle: 'Статистика', statsTotalLabel: 'Всего вопросов', statsSeenLabel: 'Изучено вопросов', statsProgressLabel: 'Прогресс', statsMistakesLabel: 'Ошибки',
    settingsTitle: 'Настройки', settingsLangTitle: 'Язык', settingsThemeTitle: 'Тема', settingsReset: 'Сбросить прогресс',
    progLabel: 'Прогресс:',
    resultTitle: 'Результат', resultOf: 'из {total}', resultSuccess: 'Отлично!', resultFail: 'Нужно повторить',
    resultSummary: 'Вы ответили правильно на {good} из {total}.', resultAgain: 'Повторить', resultHome: 'Главное меню'
  },
  es: {
    code: 'ES', subtitle: 'Entrenador de Code 95', continue: 'Estudiar', exam: 'Examen (40 preguntas)',
    mistakes: 'Repetir errores', random: 'Preguntas aleatorias', reset: 'Restablecer progreso',
    learnTitle: 'Estudiar', examTitle: 'Examen (40 preguntas)', mistakesTitle: 'Repetir errores', randomTitle: 'Preguntas aleatorias',
    correctWord: 'correcto', question: 'Pregunta', of: 'de', check: 'Comprobar', next: 'Siguiente →',
    noMistakes: 'Aún no hay errores.', resetConfirm: '¿Restablecer progreso?',
    favoritesTitle: 'Favoritos', noFavorites: 'Aún no tienes preguntas favoritas. Toca ❤️ durante la prueba para guardar las preguntas difíciles.', emptyFavorites: 'No tienes más preguntas favoritas.',
    menuCorrectTitle: 'Respuestas correctas', menuCorrectSub: 'Preguntas respondidas correctamente la última vez', menuIncorrectTitle: 'Respuestas incorrectas', menuIncorrectSub: 'Preguntas respondidas incorrectamente la última vez', emptySection: '¡Felicidades! Actualmente no hay preguntas en esta sección.',
    right: 'Correcto', wrong: 'Incorrecto. Respuesta correcta:', done: 'Hecho.', correct: 'Correcto', errors: 'Errores',
    multi: 'Varias respuestas correctas posibles.',
    welcomeTitle: '¡Bienvenido!', welcomeSubtitle: 'Sigue entrenando y mejora tus conocimientos.',
    menuRandomTitle: 'Preguntas aleatorias', menuRandomSub: 'Entrenamiento en orden aleatorio',
    menuTopicsTitle: 'Entrenamiento', menuTopicsSub: 'Estudio, examen y progreso',
    menuMistakesTitle: 'Errores', menuMistakesSub: 'Tus respuestas incorrectas',
    menuStatsTitle: 'Estadísticas', menuStatsSub: 'Tus resultados y progreso',
    statsTitle: 'Estadísticas', statsTotalLabel: 'Total de preguntas', statsSeenLabel: 'Preguntas vistas', statsProgressLabel: 'Progreso', statsMistakesLabel: 'Errores',
    settingsTitle: 'Ajustes', settingsLangTitle: 'Idioma', settingsThemeTitle: 'Tema', settingsReset: 'Restablecer progreso',
    progLabel: 'Progreso:',
    resultTitle: 'Resultado', resultOf: 'de {total}', resultSuccess: '¡Excelente!', resultFail: 'Necesitas repetir',
    resultSummary: 'Respondiste correctamente {good} de {total}.', resultAgain: 'Repetir', resultHome: 'Menú principal'
  },
  pl: {
    code: 'PL', subtitle: 'Trener Code 95', continue: 'Nauka', exam: 'Egzamin (40 pytań)',
    mistakes: 'Powtórz błędy', random: 'Losowe pytania', reset: 'Resetuj postęp',
    learnTitle: 'Nauka', examTitle: 'Egzamin (40 pytań)', mistakesTitle: 'Powtórka błędów', randomTitle: 'Losowe pytania',
    correctWord: 'poprawnie', question: 'Pytanie', of: 'z', check: 'Sprawdź', next: 'Dalej →',
    noMistakes: 'Brak błędów.', resetConfirm: 'Resetować postęp?',
    favoritesTitle: 'Ulubione', noFavorites: 'Nie masz jeszcze ulubionych pytań. Stuknij ❤️ podczas testu, aby zapisać trudne pytania.', emptyFavorites: 'Nie masz już ulubionych pytań.',
    menuCorrectTitle: 'Prawidłowe odpowiedzi', menuCorrectSub: 'Pytania rozwiązane poprawnie ostatnim razem', menuIncorrectTitle: 'Nieprawidłowe odpowiedzi', menuIncorrectSub: 'Pytania rozwiązane niepoprawnie ostatnim razem', emptySection: 'Gratulacje! W tej sekcji nie ma obecnie żadnych pytań.',
    right: 'Prawidłowo', wrong: 'Nieprawidłowo. Prawidłowa odpowiedź:', done: 'Gotowe.', correct: 'Prawidłowo', errors: 'Błędy',
    multi: 'Możliwe jest kilka prawidłowych odpowiedzi.',
    welcomeTitle: 'Witaj!', welcomeSubtitle: 'Trenuj dalej i poszerzaj swoją wiedzę.',
    menuRandomTitle: 'Losowe pytania', menuRandomSub: 'Trening w losowej kolejności',
    menuTopicsTitle: 'Trening', menuTopicsSub: 'Nauka, egzamin i postęp',
    menuMistakesTitle: 'Błędy', menuMistakesSub: 'Twoje błędne odpowiedzi',
    menuStatsTitle: 'Statystyki', menuStatsSub: 'Twoje wyniki i postęp',
    statsTitle: 'Statystyki', statsTotalLabel: 'Wszystkie pytania', statsSeenLabel: 'Obejrzane pytania', statsProgressLabel: 'Postęp', statsMistakesLabel: 'Błędy',
    settingsTitle: 'Ustawienia', settingsLangTitle: 'Język', settingsThemeTitle: 'Motyw', settingsReset: 'Resetuj postęp',
    progLabel: 'Postęp:',
    resultTitle: 'Wynik', resultOf: 'z {total}', resultSuccess: 'Świetnie!', resultFail: 'Spróbuj ponownie',
    resultSummary: 'Odpowiedziałeś poprawnie na {good} z {total}.', resultAgain: 'Powtórz', resultHome: 'Menu główne'
  },
  it: {
    code: 'IT', subtitle: 'Simulatore Code 95', continue: 'Studio', exam: 'Esame (40 domande)',
    mistakes: 'Ripeti errori', random: 'Domande casuali', reset: 'Ripristina progressi',
    learnTitle: 'Studio', examTitle: 'Esame (40 domande)', mistakesTitle: 'Ripeti errori', randomTitle: 'Domande casuali',
    correctWord: 'corretto', question: 'Domanda', of: 'di', check: 'Verifica', next: 'Avanti →',
    noMistakes: 'Ancora nessun errore.', resetConfirm: 'Ripristinare i progressi?',
    favoritesTitle: 'Preferiti', noFavorites: 'Non hai ancora domande preferite. Tocca ❤️ durante il test per salvare le domande difficili.', emptyFavorites: 'Non hai più domande preferite.',
    menuCorrectTitle: 'Risposte corrette', menuCorrectSub: 'Domande risposte correttamente l\'ultima volta', menuIncorrectTitle: 'Risposte incorrette', menuIncorrectSub: 'Domande risposte in modo errato l\'ultima volta', emptySection: 'Congratulazioni! Al momento non ci sono domande in questa sezione.',
    right: 'Corretto', wrong: 'Errato. Risposta corretta:', done: 'Fatto.', correct: 'Corretto', errors: 'Errori',
    multi: 'Sono possibili più risposte corrette.',
    welcomeTitle: 'Benvenuto!', welcomeSubtitle: 'Continua ad allenarti e migliora le tue conoscenze.',
    menuRandomTitle: 'Domande casuali', menuRandomSub: 'Allenamento in ordine casuale',
    menuTopicsTitle: 'Allenamento', menuTopicsSub: 'Studio, esame e progressi',
    menuMistakesTitle: 'Errori', menuMistakesSub: 'Le tue risposte errate',
    menuStatsTitle: 'Statistiche', menuStatsSub: 'I tuoi risultati e progressi',
    statsTitle: 'Statistiche', statsTotalLabel: 'Domande totali', statsSeenLabel: 'Domande visualizzate', statsProgressLabel: 'Progresso', statsMistakesLabel: 'Errori',
    settingsTitle: 'Impostazioni', settingsLangTitle: 'Lingua', settingsThemeTitle: 'Tema', settingsReset: 'Ripristina i progressi',
    progLabel: 'Progresso:',
    resultTitle: 'Risultato', resultOf: 'di {total}', resultSuccess: 'Eccellente!', resultFail: 'Da ripetere',
    resultSummary: 'Hai risposto correttamente a {good} su {total}.', resultAgain: 'Ripeti', resultHome: 'Menu principale'
  },
  tr: {
    code: 'TR', subtitle: 'Code 95 Eğitmeni', continue: 'Çalışma', exam: 'Sınav (40 soru)',
    mistakes: 'Hataları tekrar et', random: 'Rastgele sorular', reset: 'İlerlemeyi sıfırla',
    learnTitle: 'Çalışma', examTitle: 'Sınav (40 Soru)', mistakesTitle: 'Hata Tekrarı', randomTitle: 'Rastgele Sorular',
    correctWord: 'doğru', question: 'Soru', of: '/', check: 'Kontrol Et', next: 'Sonraki →',
    noMistakes: 'Henüz hata yok.', resetConfirm: 'İlerlemeyi sıfırlamak istiyor musunuz?',
    favoritesTitle: 'Favoriler', noFavorites: 'Henüz favori sorunuz yok. Zor soruları kaydetmek için test sırasında ❤️ simgesine dokunun.', emptyFavorites: 'Başka favori sorunuz kalmadı.',
    menuCorrectTitle: 'Doğru cevaplar', menuCorrectSub: 'Son seferde doğru cevaplanan sorular', menuIncorrectTitle: 'Yanlış cevaplar', menuIncorrectSub: 'Son seferde yanlış cevaplanan sorular', emptySection: 'Tebrikler! Bu bölümde şu anda soru bulunmamaktadır.',
    right: 'Doğru', wrong: 'Yanlış. Doğru cevap:', done: 'Tamamlandı.', correct: 'Doğru', errors: 'Hatalar',
    multi: 'Birden fazla doğru cevap olabilir.',
    welcomeTitle: 'Hoş Geldiniz!', welcomeSubtitle: 'Çalışmaya devam edin ve bilginizi geliştirin.',
    menuRandomTitle: 'Rastgele Sorular', menuRandomSub: 'Rastgele sırada çalışma',
    menuTopicsTitle: 'Çalışma', menuTopicsSub: 'Öğrenme, sınav ve ilerleme',
    menuMistakesTitle: 'Hatalar', menuMistakesSub: 'Yanlış cevaplarınız',
    menuStatsTitle: 'İstatistikler', menuStatsSub: 'Sonuçlarınız ve ilerlemeniz',
    statsTitle: 'İstatistikler', statsTotalLabel: 'Toplam Soru', statsSeenLabel: 'Görülen Sorular', statsProgressLabel: 'İlerleme', statsMistakesLabel: 'Hatalar',
    settingsTitle: 'Ayarlar', settingsLangTitle: 'Dil', settingsThemeTitle: 'Tema', settingsReset: 'İlerlemeyi Sıfırla',
    progLabel: 'İlerleme:',
    resultTitle: 'Sonuç', resultOf: '/ {total}', resultSuccess: 'Harika!', resultFail: 'Tekrar edilmeli',
    resultSummary: '{total} sorudan {good} tanesini doğru cevapladınız.', resultAgain: 'Tekrar et', resultHome: 'Ana menü'
  },
  uk: {
    code: 'UK', subtitle: 'Тренажер Code 95', continue: 'Навчання', exam: 'Іспит (40 питань)',
    mistakes: 'Повторити помилки', random: 'Випадкові питання', reset: 'Скинути прогрес',
    learnTitle: 'Навчання', examTitle: 'Іспит (40 питань)', mistakesTitle: 'Повторення помилок', randomTitle: 'Випадкові питання',
    correctWord: 'правильно', question: 'Вопрос', of: 'з', check: 'Перевірити', next: 'Далі →',
    noMistakes: 'Помилок поки немає.', resetConfirm: 'Скинути прогрес?',
    favoritesTitle: 'Обране', noFavorites: 'У вас поки немає обраних питань. Натискайте ❤️ під час проходження тестів, щоб зберегти складні питання.', emptyFavorites: 'У вас більше немає обраних питань.',
    menuCorrectTitle: 'Правильні відповіді', menuCorrectSub: 'Питання, вирішені вірно в останній раз', menuIncorrectTitle: 'Неправильні відповіді', menuIncorrectSub: 'Питання, вирішені невірно в останній раз', emptySection: 'Вітаємо! Зараз у цьому розділі більше немає питань.',
    right: 'Правильно', wrong: 'Неправильно. Правильна відповідь:', done: 'Готово.', correct: 'Правильно', errors: 'Помилок',
    multi: 'Можливі кілька правильних відповідей.',
    welcomeTitle: 'Ласкаво просимо!', welcomeSubtitle: 'Продовжуйте навчання та вдосконалюйте свої знання.',
    menuRandomTitle: 'Випадкові питання', menuRandomSub: 'Тренування у випадковому порядку',
    menuTopicsTitle: 'Тренировка', menuTopicsSub: 'Навчання, іспит та прогрес',
    menuMistakesTitle: 'Помилки', menuMistakesSub: 'Ваші неправильні відповіді',
    menuStatsTitle: 'Статистика', menuStatsSub: 'Ваші результати та прогрес',
    statsTitle: 'Статистика', statsTotalLabel: 'Всього питань', statsSeenLabel: 'Переглянуто питань', statsProgressLabel: 'Прогрес', statsMistakesLabel: 'Помилки',
    settingsTitle: 'Настройки', settingsLangTitle: 'Мова', settingsThemeTitle: 'Тема', settingsReset: 'Скинути прогрес',
    progLabel: 'Прогрес:',
    resultTitle: 'Результат', resultOf: 'з {total}', resultSuccess: 'Відмінно!', resultFail: 'Потрібно повторити',
    resultSummary: 'Ви відповіли правильно на {good} з {total}.', resultAgain: 'Повторити', resultHome: 'Головне меню'
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

const Analytics = window.Analytics || { track: () => {} };

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
  ['de', 'en', 'ru', 'es', 'pl', 'it', 'tr', 'uk'].forEach(l => {
    const el = $('lang' + l.charAt(0).toUpperCase() + l.slice(1));
    if (el) el.classList.toggle('selected', onboardingLang === l);
  });
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
  Analytics.track('language_selected', { selected_language: lang });
}

function applyLanguage(){
  document.documentElement.lang = lang;
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
  if ($('menuCorrectAnswersTitle')) $('menuCorrectAnswersTitle').textContent = t('menuCorrectTitle');
  if ($('menuCorrectAnswersSub')) $('menuCorrectAnswersSub').textContent = t('menuCorrectSub');
  if ($('menuIncorrectAnswersTitle')) $('menuIncorrectAnswersTitle').textContent = t('menuIncorrectTitle');
  if ($('menuIncorrectAnswersSub')) $('menuIncorrectAnswersSub').textContent = t('menuIncorrectSub');
  // Settings translation
  if ($('settingsTitle')) $('settingsTitle').textContent = t('settingsTitle');
  if ($('settingsLangTitle')) $('settingsLangTitle').textContent = t('settingsLangTitle');
  if ($('settingsThemeTitle')) $('settingsThemeTitle').textContent = t('settingsThemeTitle');
  if ($('settingsResetBtn')) $('settingsResetBtn').textContent = t('settingsReset');
}

function getErrorsWord(count) {
  if (lang === 'ru') {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return 'ошибка';
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'ошибки';
    return 'ошибок';
  }
  if (lang === 'uk') {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return 'помилка';
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'помилки';
    return 'помилок';
  }
  if (lang === 'pl') {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (count === 1) return 'błąd';
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'błędy';
    return 'błędów';
  }
  if (['en', 'es', 'it'].includes(lang)) {
    if (count === 1) {
      return lang === 'it' ? 'errore' : 'error';
    }
    return lang === 'es' ? 'errores' : (lang === 'it' ? 'errori' : 'errors');
  }
  if (lang === 'tr') {
    return 'hata';
  }
  return t('errors');
}

function updateHome(){
  const seenCount = Object.keys(state.seen).length;
  const correctCount = Object.keys(state.correct).length;
  const p = pct(seenCount, QUESTIONS.length);
  $('homeProgressText').textContent = `${p}%`;
  $('homeScoreText').textContent = `${correctCount} ${t('correctWord')} / ${QUESTIONS.length}`;
  $('homeBar').style.width = `${p}%`;

  const progLabel = t('progLabel');

  if ($('menuRandomProgress')) $('menuRandomProgress').textContent = `${progLabel} ${p}%`;
  if ($('menuTopicsProgress')) $('menuTopicsProgress').textContent = `${progLabel} ${p}%`;
  updateHomeProgressCards();
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
  else if(mode === 'favorites') {
    const favs = JSON.parse(localStorage.getItem('driver95_favorites') || '[]');
    list = QUESTIONS.filter(q => favs.includes(q.id));
    title = `${t('favoritesTitle') || 'Favorites'} (${list.length})`;
  }
  else if(mode === 'lastCorrect' || mode === 'lastIncorrect') {
    const prog = getProgress();
    const target = mode === 'lastCorrect' ? 'correct' : 'incorrect';
    const qIds = new Set(QUESTIONS.map(q => q.id));
    list = QUESTIONS.filter(q => prog[q.id] && prog[q.id].lastResult === target && qIds.has(q.id));
    const modeKey = mode === 'lastCorrect' ? 'menuCorrectTitle' : 'menuIncorrectTitle';
    title = `${t(modeKey)} (${list.length})`;
  }
  else { list = QUESTIONS.slice(); title = t('learnTitle'); }

  if(!list.length){
    if (mode === 'favorites') {
      alert(t('noFavorites') || 'No favorite questions yet.');
    } else if (mode === 'lastCorrect' || mode === 'lastIncorrect') {
      alert(t('emptySection') || 'Поздравляем! Сейчас в этом разделе больше нет вопросов.');
    } else {
      alert(t('noMistakes'));
    }
    return;
  }
  session = {mode, title, list, index:0, good:0, bad:0, answered:false};
  $('modeTitle').textContent = title;
  show('quiz');
  renderQuestion();
  Analytics.track('test_started', { mode, question_count: list.length });
}

function updateFavoritesBadge() {
  const favs = JSON.parse(localStorage.getItem('driver95_favorites') || '[]');
  const count = favs.length;
  const badgeText = count > 99 ? '99+' : count.toString();
  document.querySelectorAll('.favBadge').forEach(el => {
    if (count > 0) {
      el.textContent = badgeText;
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });
}

function getProgress() {
  let prog = {};
  try {
    prog = JSON.parse(localStorage.getItem('driver95_progress') || '{}');
  } catch(e) {}
  
  // Migration fallback for old favorites format
  const oldFavs = JSON.parse(localStorage.getItem('driver95_favorites') || '[]');
  let modified = false;
  oldFavs.forEach(id => {
    if (!prog[id]) {
      prog[id] = { correct: 0, incorrect: 0, lastResult: null, favorite: true, lastSeen: null };
      modified = true;
    } else if (!prog[id].favorite) {
      prog[id].favorite = true;
      modified = true;
    }
  });
  if (modified) {
    localStorage.setItem('driver95_progress', JSON.stringify(prog));
  }
  return prog;
}

function saveProgress(prog) {
  localStorage.setItem('driver95_progress', JSON.stringify(prog));
}

function recordQuestionResult(qId, isCorrect) {
  const prog = getProgress();
  if (!prog[qId]) {
    prog[qId] = { correct: 0, incorrect: 0, lastResult: null, favorite: false, lastSeen: null };
  }
  
  const card = prog[qId];
  if (isCorrect) {
    card.correct = (card.correct || 0) + 1;
    card.lastResult = 'correct';
  } else {
    card.incorrect = (card.incorrect || 0) + 1;
    card.lastResult = 'incorrect';
  }
  card.lastSeen = new Date().toISOString();
  
  saveProgress(prog);
  updateFavoritesBadge();
  updateHomeProgressCards();
}

function updateHomeProgressCards() {
  const prog = getProgress();
  let correctCount = 0;
  let incorrectCount = 0;
  const questionIds = new Set(QUESTIONS.map(q => q.id));
  
  Object.keys(prog).forEach(qId => {
    const id = Number(qId);
    if (questionIds.has(id)) {
      if (prog[qId].lastResult === 'correct') {
        correctCount++;
      } else if (prog[qId].lastResult === 'incorrect') {
        incorrectCount++;
      }
    }
  });

  const correctEl = $('menuCorrectAnswersProgress');
  const incorrectEl = $('menuMistakesProgress');
  
  if (correctEl) correctEl.textContent = `${correctCount} ${getQuestionsWord(correctCount)}`;
  if (incorrectEl) {
    const errWord = getErrorsWord(incorrectCount);
    incorrectEl.textContent = `${incorrectCount} ${errWord}`;
  }
}

function getQuestionsWord(count) {
  if (lang === 'ru' || lang === 'uk') {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return lang === 'ru' ? 'вопросов' : 'питань';
    }
    if (lastDigit === 1) {
      return lang === 'ru' ? 'вопрос' : 'питання';
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return lang === 'ru' ? 'вопроса' : 'питання';
    }
    return lang === 'ru' ? 'вопросов' : 'питань';
  }
  if (lang === 'pl') {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'pytań';
    if (lastDigit === 1) return 'pytanie';
    if (lastDigit >= 2 && lastDigit <= 4) return 'pytania';
    return 'pytań';
  }
  return 'questions';
}

function updateBookmarkVisual() {
  const favs = JSON.parse(localStorage.getItem('driver95_favorites') || '[]');
  if (!session || !session.list || !session.list[session.index]) return;
  const q = session.list[session.index];
  if (favs.includes(q.id)) {
    $('bookmarkBtn').textContent = '♥';
    $('bookmarkBtn').classList.add('active');
  } else {
    $('bookmarkBtn').textContent = '♡';
    $('bookmarkBtn').classList.remove('active');
  }
}

function renderQuestion(){
  const q = session.list[session.index];
  updateBookmarkVisual();

  // Control Favorites Navigation controls
  const isNavMode = ['favorites', 'mistakes', 'lastCorrect', 'lastIncorrect'].includes(session.mode);
  if (isNavMode) {
    $('favPrevBtn').classList.remove('hidden');
    $('favNextBtn').classList.remove('hidden');
    $('favPrevBtn').disabled = (session.index === 0);
    $('favNextBtn').disabled = (session.index === session.list.length - 1);
  } else {
    $('favPrevBtn').classList.add('hidden');
    $('favNextBtn').classList.add('hidden');
  }

  selected = new Set();
  session.answered = false;
  session.questionStart = Date.now();
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

  const isCorrect = sameSet(selected, correctIndexes);
  const timeSpent = session.questionStart ? Math.round((Date.now() - session.questionStart) / 1000) : 0;

  recordQuestionResult(q.id, isCorrect);

  state.seen[q.id] = true;
  if(isCorrect){
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

  Analytics.track('question_answered', {
    mode: session.mode,
    question_id: q.id,
    selected_answer: [...selected],
    correct_answer: correctIndexes,
    is_correct: isCorrect,
    time_spent: timeSpent
  });

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
  $('resultTitle').textContent = t('resultTitle');
  $('resultScoreBig').textContent = good;
  $('resultScoreTotal').textContent = t('resultOf').replace('{total}', total);
  $('resultMessage').textContent = good >= Math.ceil(total * 0.8) ? t('resultSuccess') : t('resultFail');
  $('resultSummary').textContent = t('resultSummary').replace('{good}', good).replace('{total}', total);
  $('resultGoodLabel').textContent = t('correct');
  $('resultBadLabel').textContent = t('errors');
  $('resultGood').textContent = good;
  $('resultBad').textContent = bad;
  $('resultAgainBtn').textContent = t('resultAgain');
  $('resultHomeBtn').textContent = t('resultHome');
  show('result');
  updateHome();

  if (session) {
    Analytics.track('test_finished', {
      mode: session.mode,
      score: good,
      total: total,
      correct_percentage: pct(good, total)
    });
    session = null;
  }
}

function nextQuestion(){
  if (session.mode === 'lastCorrect' || session.mode === 'lastIncorrect') {
    const q = session.list[session.index];
    const prog = getProgress();
    const card = prog[q.id];
    const target = session.mode === 'lastCorrect' ? 'correct' : 'incorrect';
    const shouldKeep = card && card.lastResult === target;

    if (!shouldKeep) {
      session.list.splice(session.index, 1);
      
      if (session.list.length === 0) {
        alert(t('emptySection') || 'Поздравляем! Сейчас в этом разделе больше нет вопросов.');
        session = null;
        show('mainMenu');
        updateHome();
        updateActiveTab('home');
        updateFavoritesBadge();
        return;
      }
      
      if (session.index >= session.list.length) {
        session.index = session.list.length - 1;
      }
      
      const modeKey = session.mode === 'lastCorrect' ? 'menuCorrectTitle' : 'menuIncorrectTitle';
      $('modeTitle').textContent = `${t(modeKey)} (${session.list.length})`;
      renderQuestion();
      return;
    }
  }

  session.index++;
  if(session.index >= session.list.length){
    $('quizBar').style.width = '100%';
    showResult();
    return;
  }
  renderQuestion();
}

['de', 'en', 'ru', 'es', 'pl', 'it', 'tr', 'uk'].forEach(l => {
  const el = $('lang' + l.charAt(0).toUpperCase() + l.slice(1));
  if (el) {
    el.onclick = () => { onboardingLang = l; updateOnboardingButtons(); };
  }
});
$('themeLight').onclick = () => applyTheme('light');
$('themeDark').onclick = () => applyTheme('dark');
$('onboardingContinue').onclick = () => selectLanguage(onboardingLang);
function updateActiveTab(tabClass) {
  document.querySelectorAll('.bottomNav span').forEach(el => {
    el.classList.remove('active');
  });
  document.querySelectorAll('.navTab' + tabClass.charAt(0).toUpperCase() + tabClass.slice(1)).forEach(el => {
    el.classList.add('active');
  });
}

$('settingsBtn').onclick = () => { show('settings'); updateActiveTab('settings'); };
$('menuRandomBtn').onclick = () => startSession('random');
$('menuTopicsBtn').onclick = () => show('home');
$('menuMistakesBtn').onclick = () => startSession('lastIncorrect');
$('menuCorrectAnswersBtn').onclick = () => startSession('lastCorrect');
$('menuStatsBtn').onclick = () => { show('stats'); updateStats(); updateActiveTab('stats'); };
$('changeLangBtn').onclick = () => { onboardingLang = lang || 'de'; updateOnboardingButtons(); show('onboarding'); };
$('continueBtn').onclick = () => startSession('learn');
$('examBtn').onclick = () => startSession('exam');
$('mistakesBtn').onclick = () => startSession('lastIncorrect');
$('randomBtn').onclick = () => startSession('random');

// Bottom Nav Bindings using Classes
document.querySelectorAll('.navTabHome').forEach(el => {
  el.onclick = () => { show('mainMenu'); updateHome(); updateActiveTab('home'); };
});
document.querySelectorAll('.navTabStats').forEach(el => {
  el.onclick = () => { show('stats'); updateStats(); updateActiveTab('stats'); };
});
document.querySelectorAll('.navTabFavorites').forEach(el => {
  el.onclick = () => startSession('favorites');
});
document.querySelectorAll('.navTabSettings').forEach(el => {
  el.onclick = () => { show('settings'); updateActiveTab('settings'); };
});

// Settings screen handlers
$('settingsBackBtn').onclick = () => { show('mainMenu'); updateActiveTab('home'); };
$('settingsThemeLight').onclick = () => applyTheme('light');
$('settingsThemeDark').onclick = () => applyTheme('dark');
$('settingsResetBtn').onclick = () => {
  if (confirm(t('resetConfirm'))) {
    localStorage.removeItem(storageKey());
    localStorage.removeItem('driver95_progress');
    state = loadState();
    updateHome();
    show('mainMenu');
    updateActiveTab('home');
  }
};
['de', 'en', 'ru', 'es', 'pl', 'it', 'tr', 'uk'].forEach(l => {
  const el = $('settingsLang' + l.charAt(0).toUpperCase() + l.slice(1));
  if (el) {
    el.onclick = () => { selectLanguage(l); show('mainMenu'); updateActiveTab('home'); };
  }
});

// Bookmark (Favorites) toggle button
$('bookmarkBtn').onclick = () => {
  console.log('favorite clicked');
  if (!session || !session.list || !session.list[session.index]) return;
  const q = session.list[session.index];
  let favs = JSON.parse(localStorage.getItem('driver95_favorites') || '[]');
  
  if (favs.includes(q.id)) {
    // Remove from favorites
    favs = favs.filter(id => id !== q.id);
    localStorage.setItem('driver95_favorites', JSON.stringify(favs));
    updateFavoritesBadge();

    if (session.mode === 'favorites') {
      // Remove from active session questions list
      session.list = session.list.filter(item => item.id !== q.id);
      
      if (session.list.length === 0) {
        alert(t('emptyFavorites') || 'У вас больше нет избранных вопросов.');
        session = null;
        show('mainMenu');
        updateHome();
        updateActiveTab('home');
        updateFavoritesBadge();
        return;
      }
      
      // Auto-open next or previous question
      if (session.index >= session.list.length) {
        session.index = session.list.length - 1;
      }
      
      // Update header count title
      $('modeTitle').textContent = `${t('favoritesTitle') || 'Favorites'} (${session.list.length})`;
      renderQuestion();
    } else {
      updateBookmarkVisual();
    }
  } else {
    // Add to favorites
    favs.push(q.id);
    localStorage.setItem('driver95_favorites', JSON.stringify(favs));
    updateBookmarkVisual();
    updateFavoritesBadge();
  }
};

$('favPrevBtn').onclick = () => {
  console.log('prev clicked');
  const isNavMode = session && ['favorites', 'mistakes', 'lastCorrect', 'lastIncorrect'].includes(session.mode);
  if (isNavMode && session.index > 0) {
    session.index--;
    renderQuestion();
  }
};

$('favNextBtn').onclick = () => {
  console.log('next clicked');
  const isNavMode = session && ['favorites', 'mistakes', 'lastCorrect', 'lastIncorrect'].includes(session.mode);
  if (isNavMode && session.index < session.list.length - 1) {
    session.index++;
    renderQuestion();
  }
};

$('nextBtn').onclick = nextQuestion;
$('checkBtn').onclick = finishAnswer;
$('backBtn').onclick = () => {
  console.log('back clicked');
  if (session) {
    Analytics.track('test_abandoned', { mode: session.mode, questions_answered: session.index });
    session = null;
  }
  show('mainMenu');
  updateHome();
  updateActiveTab('home');
  updateFavoritesBadge();
};
$('statsBackBtn').onclick = () => { show('mainMenu'); updateHome(); updateActiveTab('home'); };
$('resultBackBtn').onclick = () => { show('mainMenu'); updateHome(); updateActiveTab('home'); };
$('resultHomeBtn').onclick = () => { show('mainMenu'); updateHome(); updateActiveTab('home'); };
$('resultAgainBtn').onclick = () => { if(session?.mode) startSession(session.mode); else { show('mainMenu'); updateActiveTab('home'); } };
$('resetBtn').onclick = () => {
  if(confirm(t('resetConfirm'))){
    localStorage.removeItem(storageKey());
    localStorage.removeItem('driver95_progress');
    state = loadState();
    updateHome();
    updateActiveTab('home');
  }
};

document.querySelectorAll('.logoMark, .miniLogo').forEach(el => {
  el.onclick = () => {
    if (session) {
      Analytics.track('test_abandoned', { mode: session.mode, questions_answered: session.index });
      session = null;
    }
    onboardingLang = lang || 'de';
    updateOnboardingButtons();
    show('onboarding');
  };
});

updateFavoritesBadge();
updateHomeProgressCards();
applyTheme(theme);
updateOnboardingButtons();
// The first screen must always be language + theme selection.
// We may preselect saved values, but we never skip this screen on startup.
show('onboarding');

// Track PWA Installation
window.addEventListener('appinstalled', () => {
  Analytics.track('pwa_installed');
});

// Track App Open
Analytics.track('app_open');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Service Worker registered', reg))
      .catch(err => console.error('Service Worker registration failed', err));
  });
}
