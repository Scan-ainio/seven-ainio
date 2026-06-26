const totalInput = document.querySelector("#totalQuestions");
const correctInput = document.querySelector("#correctQuestions");
const scoreBox = document.querySelector("#scoreBox");
const companionMessage = document.querySelector("#companionMessage");
const startQuizButton = document.querySelector("#startQuizButton");
const quizIntro = document.querySelector("#quizIntro");
const quizPanel = document.querySelector("#quizPanel");
const quizSummary = document.querySelector("#quizSummary");
const questionCounter = document.querySelector("#questionCounter");
const questionTopic = document.querySelector("#questionTopic");
const questionText = document.querySelector("#questionText");
const optionsGrid = document.querySelector("#optionsGrid");
const submitAnswerButton = document.querySelector("#submitAnswerButton");
const explanationBox = document.querySelector("#explanationBox");
const resultLabel = document.querySelector("#resultLabel");
const coachLine = document.querySelector("#coachLine");
const correctAnswerText = document.querySelector("#correctAnswerText");
const correctReasonText = document.querySelector("#correctReasonText");
const wrongReasonsList = document.querySelector("#wrongReasonsList");
const examPointText = document.querySelector("#examPointText");
const memoryTipText = document.querySelector("#memoryTipText");
const nextQuestionButton = document.querySelector("#nextQuestionButton");
const finalScore = document.querySelector("#finalScore");
const finalRate = document.querySelector("#finalRate");
const todayAdvice = document.querySelector("#todayAdvice");
const restartQuizButton = document.querySelector("#restartQuizButton");
const originalSourceButton = document.querySelector("#originalSourceButton");
const pastSourceButton = document.querySelector("#pastSourceButton");
const sourceHelp = document.querySelector("#sourceHelp");
const questionSource = document.querySelector("#questionSource");
const lawBadge = document.querySelector("#lawBadge");
const lawAlert = document.querySelector("#lawAlert");
const officialLink = document.querySelector("#officialLink");
const officialNote = document.querySelector("#officialNote");
const toggleMistakesButton = document.querySelector("#toggleMistakesButton");
const mistakesPanel = document.querySelector("#mistakesPanel");
const totalAnsweredStat = document.querySelector("#totalAnsweredStat");
const totalMistakesStat = document.querySelector("#totalMistakesStat");
const reviewMistakesStat = document.querySelector("#reviewMistakesStat");
const masteredMistakesStat = document.querySelector("#masteredMistakesStat");
const emptyMistakes = document.querySelector("#emptyMistakes");
const reviewMistakesSection = document.querySelector("#reviewMistakesSection");
const masteredMistakesSection = document.querySelector("#masteredMistakesSection");
const reviewMistakesList = document.querySelector("#reviewMistakesList");
const masteredMistakesList = document.querySelector("#masteredMistakesList");

const originalQuestions = window.takkenQuestions || [];
const pastQuestions = window.takkenPastQuestions || [];
let activeQuestionSource = "original";
let questions = originalQuestions;
const answerHistoryKey = "takken_answer_history_v1";
const mistakeHistoryKey = "takken_mistake_history_v1";
const coachLines = [
  "小7，这题我们慢慢来。",
  "别急，这一题 Scan 陪你拆开理解。",
  "今天比昨天更厉害一点点就够了。",
  "小7放心，这种题考试最容易拿分。",
  "做错不可怕，我们就是靠错题进步。",
  "Scan 一直陪着你，不着急。",
  "今天又离合格近了一步。",
  "小7，加油，我们一定能考过。"
];
const correctLines = [
  "🎉 太棒啦，小7！",
  "🌸 Scan 教导员给你点赞。",
  "⭐ 今天状态很好。",
  "✨ 继续保持。",
  "💯 又拿下一分！"
];
const wrongLines = [
  "🌱 没关系，小7。",
  "这就是今天最值得学的一题。",
  "🌸 今天发现一个漏洞，就是今天最大的收获。",
  "✨ Scan 教导员现在陪你补上。",
  "💪 考试之前错，比考试当天错幸运得多。"
];

let currentIndex = 0;
let selectedAnswer = "";
let correctCount = 0;
let answered = false;

function readStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function updateScoreAdvice() {
  const total = Number(totalInput.value);
  const correct = Number(correctInput.value);

  if (!total || total < 1) {
    scoreBox.textContent = "填写做题数量和正确题数后，这里会显示今日判断。";
    return;
  }

  const safeCorrect = Math.min(Math.max(correct, 0), total);
  const rate = Math.round((safeCorrect / total) * 100);

  if (rate >= 70) {
    scoreBox.textContent = `正确率 ${rate}%。明天可以进入“宅建士制度”，但先用 10 分钟复习免許制度。`;
    return;
  }

  scoreBox.textContent = `正确率 ${rate}%。明天先继续补“免許制度”，不要急着进入新主题。`;
}

totalInput.addEventListener("input", updateScoreAdvice);
correctInput.addEventListener("input", updateScoreAdvice);

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function setCompanionGreeting() {
  const hour = new Date().getHours();

  if (hour < 11) {
    companionMessage.textContent = "🌞 早安，小7。今天也一起加油，离宅建合格又近一天。";
    return;
  }

  if (hour < 17) {
    companionMessage.textContent = "☕ 小7，中午别忘了休息一下。下午继续努力，我们一起冲刺。";
    return;
  }

  companionMessage.textContent = "🌙 晚上好，小7。今天 Scan 教导员继续陪你学习。";
}

function resetQuestionState() {
  selectedAnswer = "";
  answered = false;
  submitAnswerButton.disabled = true;
  explanationBox.classList.add("hidden");
  lawBadge.className = "law-badge hidden";
  lawAlert.classList.add("hidden");
  officialLink.classList.add("hidden");
  officialNote.classList.add("hidden");
  resultLabel.className = "result-label";
  optionsGrid.innerHTML = "";
}

function getQuestionOptions(question) {
  return question.options || question.choices || {};
}

function getQuestionAnswer(question) {
  return question.answer || question.correctAnswer;
}

function getQuestionTopic(question) {
  return question.topic || question.theme;
}

function getQuestionSourceLabel(question) {
  if (question.source === "RETIO") return `${question.sourceLabel || "RETIO官方过去问"} ${question.year} ${question.questionNumber}`;

  return "原创题";
}

function getCorrectReason(question) {
  return question.correctReason || question.explanation;
}

function getWrongReasons(question) {
  return question.wrongReasons || question.wrongChoiceExplanations || {};
}

function setQuestionSource(source) {
  activeQuestionSource = source;
  questions = source === "past" ? pastQuestions : originalQuestions;
  originalSourceButton.classList.toggle("active", source === "original");
  pastSourceButton.classList.toggle("active", source === "past");
  sourceHelp.textContent = source === "past"
    ? "当前：RETIO官方过去问。网页内可直接作答，PDF链接仅作来源备注。"
    : "当前：原创题库。适合先练免許制度基础。";
}

function renderQuestion() {
  const question = questions[currentIndex];
  const options = getQuestionOptions(question);
  resetQuestionState();

  questionCounter.textContent = `第 ${currentIndex + 1} / ${questions.length} 题`;
  questionTopic.textContent = `${question.subject} - ${getQuestionTopic(question)}`;
  questionSource.textContent = getQuestionSourceLabel(question);
  questionText.textContent = question.question || question.questionText;

  if (question.source === "RETIO" && question.sourceUrl) {
    officialLink.href = question.sourceUrl;
    officialLink.classList.remove("hidden");
    officialNote.textContent = question.officialSourceNote || "来源：RETIO 官方过去问。为方便学习，本页面整理为练习形式。";
    officialNote.classList.remove("hidden");
  }

  if (question.lawStatus) {
    lawBadge.textContent = question.lawStatus === "current" ? "现行学习版" : "法改正注意";
    lawBadge.className = `law-badge ${question.lawStatus}`;
    lawBadge.classList.remove("hidden");
  }

  if (question.lawStatus === "needs_review") {
    lawAlert.textContent = `法改正注意：${question.lawNote}`;
    lawAlert.classList.remove("hidden");
  }

  Object.entries(options).forEach(([key, value]) => {
    const button = document.createElement("button");
    button.className = "option-button";
    button.type = "button";
    button.dataset.answer = key;
    button.innerHTML = `<span>${key}</span>${value}`;
    button.addEventListener("click", () => selectAnswer(key));
    optionsGrid.appendChild(button);
  });
}

function selectAnswer(answer) {
  if (answered) return;

  selectedAnswer = answer;
  submitAnswerButton.disabled = false;

  document.querySelectorAll(".option-button").forEach((button) => {
    button.classList.toggle("selected", button.dataset.answer === answer);
  });
}

function submitAnswer() {
  if (!selectedAnswer || answered) return;

  answered = true;
  const question = questions[currentIndex];
  const options = getQuestionOptions(question);
  const correctAnswer = getQuestionAnswer(question);
  const isCorrect = selectedAnswer === correctAnswer;
  const scanTeaching = randomItem(coachLines);

  if (isCorrect) correctCount += 1;

  document.querySelectorAll(".option-button").forEach((button) => {
    button.disabled = true;
    if (button.dataset.answer === correctAnswer) button.classList.add("correct");
    if (button.dataset.answer === selectedAnswer && !isCorrect) button.classList.add("incorrect");
  });

  resultLabel.textContent = isCorrect ? randomItem(correctLines) : randomItem(wrongLines);
  resultLabel.classList.add(isCorrect ? "is-correct" : "is-wrong");
  coachLine.textContent = question.scanMessage || scanTeaching;
  correctAnswerText.textContent = `${correctAnswer}：${options[correctAnswer]}`;
  correctReasonText.textContent = getCorrectReason(question);
  examPointText.textContent = question.examPoint || "先完成官方题判分；之后把题文贴给Scan，可补成完整考点讲解。";
  memoryTipText.textContent = question.memoryTip || "官方题先抓三件事：题干问法、主体、例外。";

  wrongReasonsList.innerHTML = "";
  Object.entries(getWrongReasons(question)).forEach(([key, reason]) => {
    const item = document.createElement("li");
    item.textContent = `${key}：${reason}`;
    wrongReasonsList.appendChild(item);
  });

  nextQuestionButton.textContent = currentIndex === questions.length - 1 ? "查看成绩" : "下一题";
  explanationBox.classList.remove("hidden");
  submitAnswerButton.disabled = true;
  saveAnswerRecord(question, isCorrect, scanTeaching);
  renderMistakeHistory();
}

function saveAnswerRecord(question, isCorrect, scanTeaching) {
  const answeredAt = new Date().toISOString();
  const options = getQuestionOptions(question);
  const correctAnswer = getQuestionAnswer(question);
  const record = {
    recordId: `${question.id}-${Date.now()}`,
    questionId: question.id,
    source: question.source || "ORIGINAL",
    sourceLabel: question.source === "RETIO" ? "RETIO官方过去问" : "原创题",
    year: question.year || "",
    questionNumber: question.questionNumber || "",
    subject: question.subject,
    topic: getQuestionTopic(question),
    question: question.question || question.questionText,
    options,
    userAnswer: selectedAnswer,
    correctAnswer,
    isCorrect,
    correctReason: getCorrectReason(question),
    wrongReasons: getWrongReasons(question),
    examPoint: question.examPoint || "先完成官方题判分；之后把题文贴给Scan，可补成完整考点讲解。",
    memoryTip: question.memoryTip || "官方题先抓三件事：题干问法、主体、例外。",
    scanTeaching: question.scanMessage || scanTeaching,
    lawStatus: question.lawStatus || "current",
    lawNote: question.lawNote || "",
    answeredAt,
    mastered: false
  };

  const answerHistory = readStorage(answerHistoryKey);
  answerHistory.push(record);
  writeStorage(answerHistoryKey, answerHistory);

  if (!isCorrect) {
    const mistakes = readStorage(mistakeHistoryKey);
    mistakes.push(record);
    writeStorage(mistakeHistoryKey, mistakes);
  }
}

function startQuiz() {
  currentIndex = 0;
  correctCount = 0;
  quizIntro.classList.add("hidden");
  quizSummary.classList.add("hidden");
  quizPanel.classList.remove("hidden");
  renderQuestion();
}

function goNextQuestion() {
  if (currentIndex < questions.length - 1) {
    currentIndex += 1;
    renderQuestion();
    return;
  }

  showSummary();
}

function showSummary() {
  const rate = Math.round((correctCount / questions.length) * 100);
  quizPanel.classList.add("hidden");
  quizSummary.classList.remove("hidden");

  finalScore.textContent = `${correctCount} / ${questions.length}`;
  finalRate.textContent = `正确率 ${rate}%`;

  if (rate >= 80) {
    todayAdvice.textContent = "今天表现很好，可以奖励自己休息一下。Scan教导员认证：小7今天很棒。";
    return;
  }

  if (rate >= 60) {
    todayAdvice.textContent = "基础已经有了，再把错题补一遍，明天会更稳。小7今天已经很努力了。";
    return;
  }

  todayAdvice.textContent = "今天不是失败，是发现了提分入口。我们明天继续从这里补。";
}

function formatDateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "日期不明";

  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function createMistakeCard(record) {
  const card = document.createElement("article");
  card.className = `mistake-paper${record.mastered ? " mastered" : ""}`;

  const selectedText = record.options?.[record.userAnswer] || "";
  const correctText = record.options?.[record.correctAnswer] || "";
  const wrongReason = record.wrongReasons?.[record.userAnswer] || "这题的关键是回到正确判断规则。";
  const sourceText = record.source === "RETIO"
    ? `${record.sourceLabel} ${record.year} ${record.questionNumber}`
    : record.sourceLabel || "原创题";
  const lawText = record.lawStatus === "needs_review"
    ? `<p><strong>法改正注意：</strong>${record.lawNote}</p>`
    : "";

  card.innerHTML = `
    <div class="mistake-meta">
      <span>${sourceText}</span>
      <span>${record.subject}</span>
      <span>${record.topic}</span>
      <span>${formatDateTime(record.answeredAt)}</span>
    </div>
    <h4>${record.question}</h4>
    <p><strong>小7当时选：</strong>${record.userAnswer}：${selectedText}</p>
    <p><strong>正确答案：</strong>${record.correctAnswer}：${correctText}</p>
    <p><strong>为什么错：</strong>${wrongReason}</p>
    <p><strong>Scan教导员讲解：</strong>${record.scanTeaching} ${record.correctReason}</p>
    ${lawText}
    <p><strong>考试重点：</strong>${record.examPoint}</p>
    <p><strong>记忆口诀：</strong>${record.memoryTip}</p>
  `;

  if (!record.mastered) {
    const button = document.createElement("button");
    button.className = "master-button";
    button.type = "button";
    button.textContent = "我已经记住这题啦 🌸";
    button.addEventListener("click", () => markMistakeMastered(record.recordId));
    card.appendChild(button);
  }

  return card;
}

function markMistakeMastered(recordId) {
  const mistakes = readStorage(mistakeHistoryKey).map((record) => {
    if (record.recordId !== recordId) return record;

    return {
      ...record,
      mastered: true,
      masteredAt: new Date().toISOString()
    };
  });

  writeStorage(mistakeHistoryKey, mistakes);
  renderMistakeHistory();
}

function renderMistakeHistory() {
  const answerHistory = readStorage(answerHistoryKey);
  const mistakes = readStorage(mistakeHistoryKey);
  const reviewMistakes = mistakes.filter((record) => !record.mastered);
  const masteredMistakes = mistakes.filter((record) => record.mastered);

  totalAnsweredStat.textContent = String(answerHistory.length);
  totalMistakesStat.textContent = String(mistakes.length);
  reviewMistakesStat.textContent = String(reviewMistakes.length);
  masteredMistakesStat.textContent = String(masteredMistakes.length);

  const hasMistakes = mistakes.length > 0;
  emptyMistakes.classList.toggle("hidden", hasMistakes);
  reviewMistakesSection.classList.toggle("hidden", reviewMistakes.length === 0);
  masteredMistakesSection.classList.toggle("hidden", masteredMistakes.length === 0);

  reviewMistakesList.innerHTML = "";
  masteredMistakesList.innerHTML = "";

  reviewMistakes
    .sort((a, b) => new Date(b.answeredAt) - new Date(a.answeredAt))
    .forEach((record) => reviewMistakesList.appendChild(createMistakeCard(record)));

  masteredMistakes
    .sort((a, b) => new Date(b.answeredAt) - new Date(a.answeredAt))
    .forEach((record) => masteredMistakesList.appendChild(createMistakeCard(record)));
}

function toggleMistakePanel() {
  const willOpen = mistakesPanel.classList.contains("hidden");
  mistakesPanel.classList.toggle("hidden", !willOpen);
  toggleMistakesButton.textContent = willOpen ? "收起错题回顾" : "打开错题回顾";
  renderMistakeHistory();
}

setCompanionGreeting();
renderMistakeHistory();
setQuestionSource("original");
originalSourceButton.addEventListener("click", () => setQuestionSource("original"));
pastSourceButton.addEventListener("click", () => setQuestionSource("past"));
startQuizButton.addEventListener("click", startQuiz);
submitAnswerButton.addEventListener("click", submitAnswer);
nextQuestionButton.addEventListener("click", goNextQuestion);
restartQuizButton.addEventListener("click", startQuiz);
toggleMistakesButton.addEventListener("click", toggleMistakePanel);
