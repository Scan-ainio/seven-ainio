const quizBank = window.xiaoWuQuizBank || [];

const lessonMeta = Array.from({ length: 20 }, (_, index) => {
  const num = String(index + 1).padStart(3, "0");
  return {
    lessonId: `lesson-${num}`,
    label: `Lesson${num}`,
    title: [
      "免許・欠格・営業保証金・保証協会",
      "届出・免許換え・登録移転",
      "案内所・標識・専任宅建士",
      "従業者証明書・従業者名簿",
      "相殺・自動債権・受動債権",
      "相続・配偶者居住権・共有",
      "不法行為・使用者責任・代襲相続",
      "契約不適合責任",
      "建物",
      "土地",
      "景品表示法",
      "住宅金融支援機構",
      "不動産鑑定評価",
      "地価公示法",
      "贈与税",
      "登録免許税",
      "印紙税",
      "所得税",
      "地価公示法",
      "不動産取得税"
    ][index]
  };
});

const storageKeys = {
  mistakes: "xiaowuQuizMistakes",
  favorites: "xiaowuQuizFavorites",
  stats: "xiaowuQuizStats"
};

const views = {
  directory: document.querySelector("#quizDirectoryView"),
  practice: document.querySelector("#quizPracticeView"),
  result: document.querySelector("#quizResultView"),
  list: document.querySelector("#quizListView"),
  stats: document.querySelector("#quizStatsView")
};

const lessonPracticeList = document.querySelector("#lessonPracticeList");
const practiceModeLabel = document.querySelector("#practiceModeLabel");
const quizQuestionCounter = document.querySelector("#quizQuestionCounter");
const quizLessonBadge = document.querySelector("#quizLessonBadge");
const quizQuestionTitle = document.querySelector("#quizQuestionTitle");
const quizRelatedSection = document.querySelector("#quizRelatedSection");
const quizChoiceList = document.querySelector("#quizChoiceList");
const favoriteQuestionButton = document.querySelector("#favoriteQuestionButton");
const quizAnswerPanel = document.querySelector("#quizAnswerPanel");
const quizAnswerResult = document.querySelector("#quizAnswerResult");
const quizExplanationText = document.querySelector("#quizExplanationText");
const returnLessonButton = document.querySelector("#returnLessonButton");
const nextQuizQuestionButton = document.querySelector("#nextQuizQuestionButton");

const resultTotal = document.querySelector("#resultTotal");
const resultCorrect = document.querySelector("#resultCorrect");
const resultRate = document.querySelector("#resultRate");
const resultMistakes = document.querySelector("#resultMistakes");
const resultMessage = document.querySelector("#resultMessage");

const listEyebrow = document.querySelector("#listEyebrow");
const listTitle = document.querySelector("#listTitle");
const listNote = document.querySelector("#listNote");
const savedQuestionList = document.querySelector("#savedQuestionList");
const practiceSavedListButton = document.querySelector("#practiceSavedListButton");

let currentQuestions = [];
let currentIndex = 0;
let currentMode = "lesson";
let currentSourceIds = [];
let selectedAnswer = null;
let sessionCorrect = 0;
let sessionAnswered = [];
let activeListType = "mistakes";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getStats() {
  return readJson(storageKeys.stats, {
    totalAnswered: 0,
    totalCorrect: 0,
    lessons: {},
    recentAt: ""
  });
}

function saveStats(stats) {
  writeJson(storageKeys.stats, stats);
}

function getMistakes() {
  return readJson(storageKeys.mistakes, []);
}

function saveMistakes(mistakes) {
  writeJson(storageKeys.mistakes, mistakes);
}

function getFavorites() {
  return readJson(storageKeys.favorites, []);
}

function saveFavorites(favorites) {
  writeJson(storageKeys.favorites, favorites);
}

function getQuestion(id) {
  return quizBank.find((question) => question.id === id);
}

function getLessonQuestions(lessonId) {
  return quizBank.filter((question) => question.lessonId === lessonId);
}

function lessonLabel(lessonId) {
  return lessonId.replace("lesson-", "Lesson");
}

function percent(correct, total) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

function showView(name) {
  Object.entries(views).forEach(([key, view]) => view?.classList.toggle("hidden", key !== name));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function formatTime(value) {
  if (!value) return "暂无";
  return new Date(value).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function renderDirectory() {
  const stats = getStats();
  lessonPracticeList.innerHTML = "";

  lessonMeta.forEach((lesson) => {
    const questions = getLessonQuestions(lesson.lessonId);
    const lessonStats = stats.lessons[lesson.lessonId] || { answered: 0, correct: 0 };
    const available = questions.length > 0;
    const card = document.createElement("article");
    card.className = `quiz-lesson-card${available ? "" : " waiting"}`;
    const rate = percent(lessonStats.correct, lessonStats.answered);

    card.innerHTML = `
      <div>
        <span>${lesson.label}</span>
        <strong>${lesson.title}</strong>
      </div>
      <dl>
        <div><dt>题目</dt><dd>${available ? `${questions.length}题` : "🌸 小吴正在整理题目中"}</dd></div>
        <div><dt>完成</dt><dd>${lessonStats.answered || 0}</dd></div>
        <div><dt>正确率</dt><dd>${lessonStats.answered ? `${rate}%` : "还没练"}</dd></div>
      </dl>
    `;

    const button = document.createElement("button");
    button.type = "button";
    button.className = available ? "secondary-button" : "secondary-button";
    button.textContent = available ? "开始练习" : "小吴整理中 🌸";
    button.disabled = !available;
    if (available) button.addEventListener("click", () => startPractice(questions, `${lesson.label}｜${lesson.title}`, "lesson"));
    card.appendChild(button);
    lessonPracticeList.appendChild(card);
  });
}

function startPractice(questions, label, mode = "lesson") {
  if (!questions.length) return;
  currentQuestions = questions.slice();
  currentSourceIds = currentQuestions.map((question) => question.id);
  currentMode = mode;
  currentIndex = 0;
  selectedAnswer = null;
  sessionCorrect = 0;
  sessionAnswered = [];
  practiceModeLabel.textContent = label;
  showView("practice");
  renderQuestion();
}

function renderQuestion() {
  const question = currentQuestions[currentIndex];
  selectedAnswer = null;
  quizAnswerPanel.classList.add("hidden");
  quizQuestionCounter.textContent = `第 ${currentIndex + 1} / ${currentQuestions.length} 题`;
  quizLessonBadge.textContent = `${lessonLabel(question.lessonId)}｜${question.title}`;
  quizQuestionTitle.textContent = question.question;
  quizRelatedSection.textContent = `关联：${question.relatedSection}`;
  returnLessonButton.href = `course.html?id=${question.relatedLesson || question.lessonId}`;
  returnLessonButton.textContent = `📖 回到 ${lessonLabel(question.relatedLesson || question.lessonId)}｜${question.title}`;
  nextQuizQuestionButton.textContent = currentIndex >= currentQuestions.length - 1 ? "查看结果" : "下一题";
  renderFavoriteButton(question.id);

  quizChoiceList.innerHTML = "";
  question.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-choice-button";
    button.innerHTML = `<span>${String.fromCharCode(65 + index)}</span><strong>${choice}</strong>`;
    button.addEventListener("click", () => answerQuestion(index));
    quizChoiceList.appendChild(button);
  });
}

function answerQuestion(index) {
  if (selectedAnswer !== null) return;
  const question = currentQuestions[currentIndex];
  selectedAnswer = index;
  const correct = index === question.answer;
  if (correct) sessionCorrect += 1;
  sessionAnswered.push({ questionId: question.id, correct });
  updateStats(question, correct);
  if (!correct) addMistake(question.id, index);

  [...quizChoiceList.children].forEach((button, choiceIndex) => {
    button.disabled = true;
    button.classList.toggle("correct", choiceIndex === question.answer);
    button.classList.toggle("wrong", choiceIndex === index && !correct);
  });

  quizAnswerResult.textContent = correct ? "答对啦 🌸" : "这题先收进错题本 🌱";
  quizExplanationText.textContent = question.explanation;
  quizAnswerPanel.classList.remove("hidden");
}

function updateStats(question, correct) {
  const stats = getStats();
  stats.totalAnswered += 1;
  if (correct) stats.totalCorrect += 1;
  const lesson = stats.lessons[question.lessonId] || { answered: 0, correct: 0 };
  lesson.answered += 1;
  if (correct) lesson.correct += 1;
  stats.lessons[question.lessonId] = lesson;
  stats.recentAt = new Date().toISOString();
  saveStats(stats);
}

function addMistake(questionId, answeredIndex) {
  const mistakes = getMistakes();
  const existing = mistakes.find((item) => item.questionId === questionId);
  if (existing) {
    existing.answeredIndex = answeredIndex;
    existing.lastAt = new Date().toISOString();
    existing.mastered = false;
  } else {
    mistakes.unshift({ questionId, answeredIndex, lastAt: new Date().toISOString(), mastered: false });
  }
  saveMistakes(mistakes.slice(0, 200));
}

function markMastered(questionId) {
  const mistakes = getMistakes().map((item) => item.questionId === questionId ? { ...item, mastered: true } : item);
  saveMistakes(mistakes);
  renderSavedList("mistakes");
  renderDirectory();
}

function renderFavoriteButton(questionId) {
  const favorites = getFavorites();
  const active = favorites.includes(questionId);
  favoriteQuestionButton.textContent = active ? "❤️ 已收藏" : "❤️ 收藏";
  favoriteQuestionButton.classList.toggle("active", active);
}

function toggleFavorite(questionId) {
  const favorites = getFavorites();
  const next = favorites.includes(questionId)
    ? favorites.filter((id) => id !== questionId)
    : [questionId, ...favorites];
  saveFavorites(next);
  renderFavoriteButton(questionId);
}

function finishPractice() {
  const total = currentQuestions.length;
  const mistakes = total - sessionCorrect;
  resultTotal.textContent = total;
  resultCorrect.textContent = sessionCorrect;
  resultRate.textContent = `${percent(sessionCorrect, total)}%`;
  resultMistakes.textContent = mistakes;
  resultMessage.textContent = mistakes
    ? "小7，错题不是失败，是小吴帮你找到的提分入口。我们慢慢补。"
    : "小7这轮很稳，成长树今天又被好好照顾了一下。";
  showView("result");
  renderDirectory();
}

function renderSavedList(type) {
  activeListType = type;
  const isMistake = type === "mistakes";
  const mistakes = getMistakes();
  const favorites = getFavorites();
  const records = isMistake
    ? mistakes.map((item) => ({ ...item, question: getQuestion(item.questionId) })).filter((item) => item.question)
    : favorites.map((id) => ({ questionId: id, question: getQuestion(id) })).filter((item) => item.question);

  listEyebrow.textContent = isMistake ? "Mistakes" : "Favorites";
  listTitle.textContent = isMistake ? "⭐ 我的错题" : "❤️ 我的收藏";
  listNote.textContent = records.length
    ? isMistake ? "小7，这里不是失败记录，是我们变强的证据。" : "这些题是小7亲手留下的重点。"
    : isMistake ? "现在还没有错题。先做几题，小吴会帮你记下来。" : "现在还没有收藏题。遇到想反复看的题，可以点 ❤️ 收藏。";
  savedQuestionList.innerHTML = "";
  practiceSavedListButton.disabled = !records.length;

  records.forEach((record) => {
    const question = record.question;
    const item = document.createElement("article");
    item.className = `saved-question-card${record.mastered ? " mastered" : ""}`;
    const selectedText = Number.isInteger(record.answeredIndex) ? question.choices[record.answeredIndex] : "未记录";
    item.innerHTML = `
      <span>${lessonLabel(question.lessonId)}｜${question.title}</span>
      <strong>${question.question}</strong>
      ${isMistake ? `<p>小7当时选：${selectedText}</p>` : ""}
      <p>正确答案：${question.choices[question.answer]}</p>
      <p>${question.explanation}</p>
    `;
    const actions = document.createElement("div");
    actions.className = "saved-question-actions";
    const practiceButton = document.createElement("button");
    practiceButton.type = "button";
    practiceButton.className = "secondary-button";
    practiceButton.textContent = "练习这题";
    practiceButton.addEventListener("click", () => startPractice([question], `${lessonLabel(question.lessonId)}｜单题练习`, type));
    actions.appendChild(practiceButton);

    if (isMistake) {
      const masteredButton = document.createElement("button");
      masteredButton.type = "button";
      masteredButton.className = "secondary-button";
      masteredButton.textContent = record.mastered ? "已掌握 🌸" : "已掌握";
      masteredButton.disabled = record.mastered;
      masteredButton.addEventListener("click", () => markMastered(question.id));
      actions.appendChild(masteredButton);
    } else {
      const unfavoriteButton = document.createElement("button");
      unfavoriteButton.type = "button";
      unfavoriteButton.className = "secondary-button";
      unfavoriteButton.textContent = "取消收藏";
      unfavoriteButton.addEventListener("click", () => {
        toggleFavorite(question.id);
        renderSavedList("favorites");
      });
      actions.appendChild(unfavoriteButton);
    }
    item.appendChild(actions);
    savedQuestionList.appendChild(item);
  });
  showView("list");
}

function renderStats() {
  const stats = getStats();
  const mistakes = getMistakes();
  const favorites = getFavorites();
  const lessonRates = lessonMeta.map((lesson) => {
    const lessonStats = stats.lessons[lesson.lessonId] || { answered: 0, correct: 0 };
    return { ...lesson, ...lessonStats, rate: percent(lessonStats.correct, lessonStats.answered) };
  }).filter((item) => item.answered > 0);
  const weakest = lessonRates.sort((a, b) => a.rate - b.rate || b.answered - a.answered)[0];

  document.querySelector("#statsTotalAnswered").textContent = stats.totalAnswered || 0;
  document.querySelector("#statsTotalRate").textContent = `${percent(stats.totalCorrect, stats.totalAnswered)}%`;
  document.querySelector("#statsMistakes").textContent = mistakes.filter((item) => !item.mastered).length;
  document.querySelector("#statsFavorites").textContent = favorites.length;
  document.querySelector("#statsWeakest").textContent = weakest ? `${weakest.label}｜${weakest.title}（${weakest.rate}%）` : "暂无";
  document.querySelector("#statsRecommendation").textContent = weakest ? `小吴建议先复习 ${weakest.label}，把错题再做一遍。` : "先做几题，小吴再帮小7判断。";
  document.querySelector("#statsTaxRate").textContent = `${groupRate(["lesson-015", "lesson-016", "lesson-017", "lesson-018", "lesson-019", "lesson-020"], stats)}%`;
  document.querySelector("#statsFiveRate").textContent = `${groupRate(["lesson-009", "lesson-010", "lesson-011", "lesson-012", "lesson-013", "lesson-014"], stats)}%`;
  document.querySelector("#statsRecentAt").textContent = formatTime(stats.recentAt);
  showView("stats");
}

function groupRate(lessonIds, stats) {
  const totals = lessonIds.reduce((acc, lessonId) => {
    const lesson = stats.lessons[lessonId] || { answered: 0, correct: 0 };
    acc.answered += lesson.answered;
    acc.correct += lesson.correct;
    return acc;
  }, { answered: 0, correct: 0 });
  return percent(totals.correct, totals.answered);
}

function shuffleQuestions(questions) {
  return questions
    .map((question) => ({ question, score: Math.random() }))
    .sort((a, b) => a.score - b.score)
    .map((item) => item.question);
}

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    if (action === "special") {
      const ids = button.dataset.special === "five"
        ? ["lesson-009", "lesson-010", "lesson-011", "lesson-012", "lesson-013", "lesson-014"]
        : ["lesson-015", "lesson-016", "lesson-017", "lesson-018", "lesson-019", "lesson-020"];
      const questions = quizBank.filter((question) => ids.includes(question.lessonId));
      startPractice(questions, button.dataset.special === "five" ? "🎯 五问免除专项" : "💰 税法专项", "special");
    }
    if (action === "mixed") startPractice(shuffleQuestions(quizBank).slice(0, Math.min(20, quizBank.length)), "🧠 综合练习", "mixed");
    if (action === "mistakes") renderSavedList("mistakes");
    if (action === "favorites") renderSavedList("favorites");
    if (action === "stats") renderStats();
  });
});

document.querySelector("#backToQuizDirectory").addEventListener("click", () => showView("directory"));
document.querySelector("#returnQuizHomeButton").addEventListener("click", () => showView("directory"));
document.querySelector("#backFromListButton").addEventListener("click", () => showView("directory"));
document.querySelector("#backFromStatsButton").addEventListener("click", () => showView("directory"));
document.querySelector("#viewMistakesButton").addEventListener("click", () => renderSavedList("mistakes"));
document.querySelector("#retryQuizButton").addEventListener("click", () => {
  const questions = currentSourceIds.map(getQuestion).filter(Boolean);
  startPractice(questions, practiceModeLabel.textContent || "再练一次", currentMode);
});
practiceSavedListButton.addEventListener("click", () => {
  const ids = activeListType === "mistakes"
    ? getMistakes().filter((item) => !item.mastered).map((item) => item.questionId)
    : getFavorites();
  const questions = ids.map(getQuestion).filter(Boolean);
  startPractice(questions, activeListType === "mistakes" ? "⭐ 错题练习" : "❤️ 收藏练习", activeListType);
});
favoriteQuestionButton.addEventListener("click", () => {
  const question = currentQuestions[currentIndex];
  if (question) toggleFavorite(question.id);
});
nextQuizQuestionButton.addEventListener("click", () => {
  if (currentIndex >= currentQuestions.length - 1) {
    finishPractice();
    return;
  }
  currentIndex += 1;
  renderQuestion();
});

function boot() {
  renderDirectory();
  const params = new URLSearchParams(window.location.search);
  const lessonId = params.get("lesson");
  const mode = params.get("mode");
  if (lessonId) {
    const questions = getLessonQuestions(lessonId);
    const meta = lessonMeta.find((lesson) => lesson.lessonId === lessonId);
    if (questions.length) startPractice(questions, `${meta?.label || lessonLabel(lessonId)}｜${meta?.title || "小吴题库"}`, "lesson");
  } else if (mode === "mistakes") {
    renderSavedList("mistakes");
  } else if (mode === "favorites") {
    renderSavedList("favorites");
  } else if (mode === "stats") {
    renderStats();
  }
}

boot();
