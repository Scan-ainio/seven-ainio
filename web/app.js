const totalInput = document.querySelector("#totalQuestions");
const correctInput = document.querySelector("#correctQuestions");
const scoreBox = document.querySelector("#scoreBox");
const companionMessage = document.querySelector("#companionMessage");
const startStudyButton = document.querySelector("#startStudyButton");
const daysUntilExamStat = document.querySelector("#daysUntilExamStat");
const studyPhaseStat = document.querySelector("#studyPhaseStat");
const studyStreakStat = document.querySelector("#studyStreakStat");
const dailyAnalysisText = document.querySelector("#dailyAnalysisText");
const brainGoal = document.querySelector("#brainGoal");
const brainTime = document.querySelector("#brainTime");
const brainTaskList = document.querySelector("#brainTaskList");
const brainFirstFocus = document.querySelector("#brainFirstFocus");
const brainSkip = document.querySelector("#brainSkip");
const brainReason = document.querySelector("#brainReason");
const brainGentleReminder = document.querySelector("#brainGentleReminder");
const brainCompleteMessage = document.querySelector("#brainCompleteMessage");
const completeTodayButton = document.querySelector("#completeTodayButton");
const lessonProgressNote = document.querySelector("#lessonProgressNote");
const brainTreeReward = document.querySelector("#brainTreeReward");
const learningMap = document.querySelector("#learningMap");
const growthTotalStudy = document.querySelector("#growthTotalStudy");
const growthTotalAnswers = document.querySelector("#growthTotalAnswers");
const growthAccuracy = document.querySelector("#growthAccuracy");
const growthMistakes = document.querySelector("#growthMistakes");
const growthStreak = document.querySelector("#growthStreak");
const growthCompletedTasks = document.querySelector("#growthCompletedTasks");
const treeVisual = document.querySelector("#treeVisual");
const treeStageName = document.querySelector("#treeStageName");
const treeProgressBar = document.querySelector("#treeProgressBar");
const treePercent = document.querySelector("#treePercent");
const treeTodayGrowth = document.querySelector("#treeTodayGrowth");
const treeTotalGrowth = document.querySelector("#treeTotalGrowth");
const treeGardenerMessage = document.querySelector("#treeGardenerMessage");
const treeNextSteps = document.querySelector("#treeNextSteps");
const treeHistoryList = document.querySelector("#treeHistoryList");
const dailyLineText = document.querySelector("#dailyLineText");
const encouragementText = document.querySelector("#encouragementText");
const todayStudyTime = document.querySelector("#todayStudyTime");
const totalStudyTime = document.querySelector("#totalStudyTime");
const courseLessonLabel = document.querySelector("#courseLessonLabel");
const courseTitle = document.querySelector("#courseTitle");
const courseMeta = document.querySelector("#courseMeta");
const courseProgressBadge = document.querySelector("#courseProgressBadge");
const courseProgressBar = document.querySelector("#courseProgressBar");
const readingLessonLabel = document.querySelector("#readingLessonLabel");
const readingProgressTrack = document.querySelector("#readingProgressTrack");
const readingProgressText = document.querySelector("#readingProgressText");
const courseStartButton = document.querySelector("#courseStartButton");
const courseCompleteButton = document.querySelector("#courseCompleteButton");
const courseList = document.querySelector("#courseList");
const courseLesson = document.querySelector("#courseLesson");
const courseStory = document.querySelector("#courseStory");
const courseImportance = document.querySelector("#courseImportance");
const courseExamPoints = document.querySelector("#courseExamPoints");
const courseCommonMistakes = document.querySelector("#courseCommonMistakes");
const courseMemoryTip = document.querySelector("#courseMemoryTip");
const courseMemoryCard = document.querySelector("#courseMemoryCard");
const courseTodaySentence = document.querySelector("#courseTodaySentence");
const courseExamTrap = document.querySelector("#courseExamTrap");
const courseKeywords = document.querySelector("#courseKeywords");
const coursePracticeText = document.querySelector("#coursePracticeText");
const courseOriginalPracticeButton = document.querySelector("#courseOriginalPracticeButton");
const courseOfficialPracticeButton = document.querySelector("#courseOfficialPracticeButton");
const courseSummary = document.querySelector("#courseSummary");
const courseReward = document.querySelector("#courseReward");
const lessonFinishPanel = document.querySelector("#lessonFinishPanel");
const lessonFinishStats = document.querySelector("#lessonFinishStats");
const lessonFinishButton = document.querySelector("#lessonFinishButton");
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
const todayStudyKey = "takken_today_study_seconds_v1";
const totalStudyKey = "takken_total_study_seconds_v1";
const studyDateKey = "takken_today_study_date_v1";
const dailyStudyLogKey = "takken_daily_study_log_v1";
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
const greetingMessages = {
  earlyMorning: [
    "🌞 早安，小7。今天也一起加油，离宅建合格又近一天。",
    "🌸 小7醒啦？今天的小吴 Coach 已经准备好陪你学习了。",
    "☀️ 早上的小7最可爱，今天先轻轻拿下一点点知识吧。",
    "🌷 早安，小7。小吴在旁边，今天我们慢慢开始就好。"
  ],
  morning: [
    "📚 上午好，小7。现在脑子最清醒，适合拿下一个小考点。",
    "🌷 小7，上午是提分黄金时间，小吴陪你认真学一会儿。",
    "✨ 今天的小7也要悄悄变厉害一点点。",
    "🌸 上午的小7很适合刷题，小吴陪你稳稳拿分。"
  ],
  noon: [
    "☕ 小7，中午先休息一下也没关系。吃饱了再继续，小吴不催你。",
    "🍱 小7，午饭要好好吃。学习很重要，但你更重要。",
    "🌸 中午啦，先补充能量，下午我们再一起冲刺。",
    "🍵 小7，中午慢一点也很好。小吴等你恢复能量。"
  ],
  afternoon: [
    "🍵 下午好，小7。现在不是中午啦，小吴陪你稳稳推进一小步。",
    "🌤 小7，下午容易犯困，我们就做几题热热身。",
    "📖 下午的小7也很棒，今天再拿下一个小知识点就很赚。",
    "✨ 下午不用硬撑，小吴陪你把今天该拿的分拿住。"
  ],
  evening: [
    "🌙 晚上好，小7。今天辛苦啦，小吴继续陪你温柔收尾。",
    "✨ 夜晚适合安静学习，小7慢慢来，小吴一直在。",
    "❤️ 今天不需要完美，只要比昨天多懂一点点就很好。",
    "🌷 晚上的小7也很努力，小吴陪你把最后一点点补上。"
  ],
  lateNight: [
    "🌌 小7，这么晚还在努力，小吴有点心疼你。学一点就早点休息。",
    "💤 深夜模式开启：今天别硬撑，做两题就去睡觉也很棒。",
    "🌙 小7乖，太晚了不要逼自己。小吴希望你考过，也希望你好好休息。",
    "❤️ 深夜的小7已经很努力了。小吴陪你收个尾，然后早点睡。"
  ]
};

let currentIndex = 0;
let selectedAnswer = "";
let correctCount = 0;
let answered = false;
let studyTimerId = null;
let lastStudyTick = null;
let isStudyTiming = false;
let currentBrainPlan = null;
let currentCourseLessonId = "";
let currentMemoryCardIndex = 0;

const lessonPauseModules = {
  "lesson-001": [
    {
      afterIndex: 2,
      title: "🌸 小吴暂停一下～",
      question: "如果以后我们在东京和埼玉各开一家事务所，应该申请：知事免許，还是国土交通大臣免許？",
      answer: "应该申请国土交通大臣免許。",
      explanation: "关键不是客户在哪里，也不是房子在哪里，而是事务所跨了两个以上都道府县。东京和埼玉各有事务所，就是跨地区，所以交给国土交通大臣。"
    },
    {
      afterIndex: 8,
      title: "☕ 小吴再问小7一个小问题",
      question: "看到“50日前辞任”的役員，小7应该马上判断没事吗？",
      answer: "不能。50日前辞任仍然可能属于公示日前60日以内。",
      explanation: "这题不是单纯比数字，而是看时间范围。60日以内包含50日前，所以要先画时间线，再判断有没有被规则抓住。"
    },
    {
      afterIndex: 13,
      title: "🌿 小吴确认一下",
      question: "営業保証金和保証協会的金额可以混着记吗？",
      answer: "不可以。営業保証金是1000万/500万/0円，保証協会分担金是60万/30万。",
      explanation: "考试很爱把两套制度放在同一题里。小7先分清“直接供託”还是“加入保証協会”，再套对应数字。"
    }
  ]
};

const lessonMoodLines = [
  "🌸 今天不用全部背下来。理解比记忆更重要。",
  "小7，现在觉得难，说明你正在成长。",
  "慢一点没关系，小吴陪你把这一块真的看懂。",
  "这一段如果有点绕，就先抓住主语和流程。",
  "小7已经看到重点了，后面做题会越来越稳。"
];

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

function getTodayLessonDashboard() {
  const lessonId = "lesson-001";
  const lesson = window.xiaoWuCourseEngine?.getLesson(lessonId);
  const progress = window.xiaoWuCourseEngine?.getLessonProgress(lessonId) || {};
  const readingProgress = Math.min(100, Math.max(0, Math.round(Number(localStorage.getItem(`${lessonId}-reading-progress`)) || 0)));
  const lessonLabel = lessonId.replace("lesson-", "Lesson");
  const title = lesson?.title || "免許・欠格事由・営業保証金・保証協会";
  const shortTitle = title.replace(" 入门复习", "").replace("・保証協会入门复习", "・保証協会");
  const reward = 5;
  const isCompleted = Boolean(progress.isCompleted || progress.completedAt);

  return {
    lessonId,
    lessonLabel,
    title,
    shortTitle,
    reward,
    readingProgress,
    isCompleted,
    estimatedMinutes: 35
  };
}

function renderBrainPlan() {
  const dashboard = window.xiaoWuBrain.buildDashboard();
  const todayLesson = getTodayLessonDashboard();
  currentBrainPlan = dashboard.plan;
  daysUntilExamStat.textContent = `${dashboard.daysUntilExam}天`;
  studyPhaseStat.textContent = dashboard.phase;
  studyStreakStat.textContent = `${dashboard.streak}天`;
  dailyAnalysisText.textContent = dashboard.analysis;
  renderLearningMap(dashboard.learningMap);
  renderGrowth(dashboard.growth);
  renderGrowthTree(dashboard.growthTree);
  renderCourse(dashboard.course);
  dailyLineText.textContent = dashboard.dailyLine;
  encouragementText.textContent = dashboard.encouragement;
  brainGoal.textContent = todayLesson.isCompleted
    ? "🎉 今天课堂已完成"
    : `${todayLesson.lessonLabel}｜${todayLesson.shortTitle}`;
  lessonProgressNote.textContent = todayLesson.isCompleted
    ? "Lesson001 已完成。小吴建议接着做今日练习，把知识变成分数。"
    : todayLesson.readingProgress > 0
      ? `继续学习 ${todayLesson.lessonLabel}，已完成 ${todayLesson.readingProgress}%`
      : "今天从 Lesson001 开始，小吴陪小7把第一堂小吴课堂真正学完。";
  brainTime.textContent = `${todayLesson.estimatedMinutes}分钟左右`;
  brainTreeReward.textContent = `学完 +${todayLesson.reward}`;
  brainFirstFocus.textContent = currentBrainPlan.firstFocus;
  brainSkip.textContent = currentBrainPlan.skip;
  brainReason.textContent = currentBrainPlan.reason;
  brainGentleReminder.textContent = currentBrainPlan.gentleReminder;
  brainGentleReminder.classList.remove("hidden");
  brainCompleteMessage.classList.toggle("hidden", !currentBrainPlan.completed);
  completeTodayButton.textContent = currentBrainPlan.completed ? "今天已完成" : "今天完成啦 🌸";
  completeTodayButton.disabled = currentBrainPlan.completed;

  if (currentBrainPlan.completed) {
    brainCompleteMessage.textContent = "小7今天辛苦啦。今天不是只完成了任务，而是又离宅建合格近了一点点。小吴已经帮你记下今天的努力。";
  }

  startStudyButton.textContent = todayLesson.isCompleted ? "去做今日练习" : todayLesson.readingProgress > 0 ? "🌸 继续小吴课堂" : "🌸 开始今天的小吴课堂";

  brainTaskList.innerHTML = "";
  const displayTasks = [
    { id: "lesson001", text: "学习 Lesson001", done: todayLesson.isCompleted },
    { id: "practice10", text: "做今日练习 10题", done: false },
    { id: "mistake10", text: "整理错题 10分钟", done: false }
  ];
  displayTasks.forEach((task) => {
    const button = document.createElement("button");
    button.className = `brain-task${task.done ? " done" : ""}`;
    button.type = "button";
    button.dataset.taskId = task.id;
    button.innerHTML = `<span>${task.done ? "✓" : "□"}</span>${task.text}`;
    button.addEventListener("click", () => toggleBrainTask(task.id));
    brainTaskList.appendChild(button);
  });
}

function renderList(container, items) {
  if (!container) return;
  container.innerHTML = "";
  items.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    container.appendChild(item);
  });
}

function lessonStorageKey(lessonId, suffix) {
  return `${lessonId}-${suffix}`;
}

function getLessonFavorites(lessonId) {
  return readStorage(lessonStorageKey(lessonId, "favorites"));
}

function saveLessonFavorites(lessonId, favorites) {
  writeStorage(lessonStorageKey(lessonId, "favorites"), favorites);
}

function getLessonMemoryState(lessonId) {
  return readStorageObject(lessonStorageKey(lessonId, "memory-cards"));
}

function saveLessonMemoryState(lessonId, state) {
  localStorage.setItem(lessonStorageKey(lessonId, "memory-cards"), JSON.stringify(state));
}

function createFavoriteButton(lessonId, knowledgeId) {
  const favorites = getLessonFavorites(lessonId);
  const isFavorite = favorites.includes(knowledgeId);
  const button = document.createElement("button");
  button.type = "button";
  button.className = `favorite-button${isFavorite ? " active" : ""}`;
  button.textContent = isFavorite ? "⭐ 已收藏" : "⭐ 收藏";
  button.addEventListener("click", () => {
    const current = getLessonFavorites(lessonId);
    const next = current.includes(knowledgeId)
      ? current.filter((item) => item !== knowledgeId)
      : [...current, knowledgeId];
    saveLessonFavorites(lessonId, next);
    renderBrainPlan();
  });
  return button;
}

function createLessonNote(lessonId, knowledgeId) {
  const wrap = document.createElement("label");
  wrap.className = "lesson-note";
  const storageKey = lessonStorageKey(lessonId, `note-${knowledgeId}`);
  wrap.innerHTML = "<span>📝 我的小笔记</span>";

  const textarea = document.createElement("textarea");
  textarea.rows = 3;
  textarea.placeholder = "小7可以写：这里哪里容易错、下次怎么判断。";
  textarea.value = localStorage.getItem(storageKey) || "";
  textarea.addEventListener("input", () => {
    localStorage.setItem(storageKey, textarea.value);
  });

  wrap.appendChild(textarea);
  return wrap;
}

function createKnowledgeBlock(lessonId, knowledgeId, paragraph) {
  const block = document.createElement("article");
  block.className = "knowledge-point";
  block.dataset.knowledgeId = knowledgeId;

  const header = document.createElement("div");
  header.className = "knowledge-point-header";
  const label = document.createElement("span");
  label.textContent = `知识点 ${knowledgeId.replace("kp", "")}`;
  header.appendChild(label);
  header.appendChild(createFavoriteButton(lessonId, knowledgeId));

  const text = document.createElement("p");
  text.textContent = paragraph;

  block.appendChild(header);
  block.appendChild(text);
  block.appendChild(createLessonNote(lessonId, knowledgeId));
  return block;
}

function createMoodCard(index) {
  const card = document.createElement("div");
  card.className = "lesson-mood-card";
  card.textContent = lessonMoodLines[index % lessonMoodLines.length];
  return card;
}

function createCollapsible({ title, teaser = "👀 查看答案", content, explanation }) {
  const wrap = document.createElement("div");
  wrap.className = "lesson-collapsible";

  const heading = document.createElement("strong");
  heading.textContent = title;

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = teaser;

  const body = document.createElement("div");
  body.className = "lesson-collapsible-body hidden";
  const text = document.createElement("p");
  text.textContent = content;
  body.appendChild(text);

  if (explanation) {
    const note = document.createElement("p");
    note.textContent = explanation;
    body.appendChild(note);
  }

  button.addEventListener("click", () => {
    const willShow = body.classList.contains("hidden");
    body.classList.toggle("hidden", !willShow);
    button.textContent = willShow ? "收起答案" : teaser;
  });

  wrap.appendChild(heading);
  wrap.appendChild(button);
  wrap.appendChild(body);
  return wrap;
}

function createPauseModule(module) {
  const wrap = document.createElement("div");
  wrap.className = "lesson-pause-card";

  const title = document.createElement("h3");
  title.textContent = module.title;
  const question = document.createElement("p");
  question.textContent = module.question;

  wrap.appendChild(title);
  wrap.appendChild(question);
  wrap.appendChild(createCollapsible({
    title: "小吴先不急着公布答案",
    teaser: "我想好了",
    content: module.answer,
    explanation: module.explanation
  }));
  return wrap;
}

function createChapterCheckpoint(lessonId, index) {
  const wrap = document.createElement("div");
  wrap.className = "chapter-checkpoint";
  wrap.innerHTML = `
    <span>🌱</span>
    <p>小吴：今天这一部分已经完成啦～继续努力，小树又长高一点点。</p>
  `;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary-button";
  button.textContent = "继续学习";
  button.addEventListener("click", () => {
    const next = document.querySelector(`[data-knowledge-id="kp${String(index + 2).padStart(3, "0")}"]`);
    if (next) next.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  wrap.appendChild(button);
  return wrap;
}

function renderReadingProgress(lessonId) {
  const saved = Number(localStorage.getItem(lessonStorageKey(lessonId, "reading-progress"))) || 0;
  const percent = Math.min(100, Math.max(0, Math.round(saved)));
  readingLessonLabel.textContent = `📖 ${lessonId.replace("lesson-", "Lesson")}`;
  readingProgressText.textContent = `${percent}%`;
  readingProgressTrack.innerHTML = "";

  for (let index = 0; index < 10; index += 1) {
    const piece = document.createElement("span");
    piece.className = index < Math.round(percent / 10) ? "filled" : "";
    readingProgressTrack.appendChild(piece);
  }
}

function updateReadingProgress() {
  if (!currentCourseLessonId || !courseLesson) return;

  const rect = courseLesson.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const total = Math.max(1, rect.height - viewportHeight * 0.45);
  const read = Math.min(total, Math.max(0, -rect.top + viewportHeight * 0.2));
  const percent = Math.min(100, Math.max(0, Math.round((read / total) * 100)));
  const key = lessonStorageKey(currentCourseLessonId, "reading-progress");
  const saved = Number(localStorage.getItem(key)) || 0;
  const next = Math.max(saved, percent);

  localStorage.setItem(key, String(next));
  renderReadingProgress(currentCourseLessonId);
  lessonFinishPanel.classList.toggle("hidden", next < 96);
}

function renderMemoryCarousel(lesson) {
  const cards = lesson.memoryCard || [];
  const state = getLessonMemoryState(lesson.lessonId);
  currentMemoryCardIndex = Math.min(currentMemoryCardIndex, Math.max(0, cards.length - 1));
  const card = cards[currentMemoryCardIndex];
  courseMemoryCard.innerHTML = "";

  if (!card) return;

  const wrap = document.createElement("div");
  wrap.className = "memory-carousel";
  const rememberedCount = Object.values(state).filter((value) => value === "remembered").length;
  const cardState = state[currentMemoryCardIndex] || "";
  wrap.innerHTML = `
    <div class="memory-card-slide">
      <span>${currentMemoryCardIndex + 1} / ${cards.length}</span>
      <strong>${card.front}</strong>
      <em>${card.back}</em>
      <p>${cardState === "remembered" ? "小7已经记住这张啦。" : cardState === "retry" ? "这张下次再轻轻复习一次。" : "先看正面，再在心里说出答案。"}</p>
    </div>
    <div class="memory-card-stats">记住率：${cards.length ? Math.round((rememberedCount / cards.length) * 100) : 0}%</div>
  `;

  const controls = document.createElement("div");
  controls.className = "memory-card-controls";
  const previous = document.createElement("button");
  previous.type = "button";
  previous.className = "secondary-button";
  previous.textContent = "上一张";
  previous.disabled = currentMemoryCardIndex === 0;
  previous.addEventListener("click", () => {
    currentMemoryCardIndex = Math.max(0, currentMemoryCardIndex - 1);
    renderMemoryCarousel(lesson);
  });

  const next = document.createElement("button");
  next.type = "button";
  next.className = "secondary-button";
  next.textContent = "下一张";
  next.disabled = currentMemoryCardIndex >= cards.length - 1;
  next.addEventListener("click", () => {
    currentMemoryCardIndex = Math.min(cards.length - 1, currentMemoryCardIndex + 1);
    renderMemoryCarousel(lesson);
  });

  const remembered = document.createElement("button");
  remembered.type = "button";
  remembered.className = "primary-button";
  remembered.textContent = "记住了 ✅";
  remembered.addEventListener("click", () => {
    state[currentMemoryCardIndex] = "remembered";
    saveLessonMemoryState(lesson.lessonId, state);
    renderMemoryCarousel(lesson);
  });

  const retry = document.createElement("button");
  retry.type = "button";
  retry.className = "secondary-button";
  retry.textContent = "没记住 🔁";
  retry.addEventListener("click", () => {
    state[currentMemoryCardIndex] = "retry";
    saveLessonMemoryState(lesson.lessonId, state);
    renderMemoryCarousel(lesson);
  });

  controls.append(previous, next, remembered, retry);
  wrap.appendChild(controls);
  courseMemoryCard.appendChild(wrap);
}

function renderCourse(courseDashboard) {
  const lesson = courseDashboard?.activeLesson;
  const progress = courseDashboard?.activeProgress;

  if (!lesson || !progress) return;

  currentCourseLessonId = lesson.lessonId;
  if (courseLessonLabel) courseLessonLabel.textContent = lesson.intro?.label || lesson.lessonId.replace("lesson-", "Lesson");
  if (courseTitle) courseTitle.textContent = lesson.title;
  if (courseMeta) courseMeta.textContent = `${lesson.subject} / 预计${lesson.estimatedMinutes || 35}分钟 / 小吴课堂`;
  if (courseProgressBadge) courseProgressBadge.textContent = `${progress.percent}%`;
  if (courseProgressBar) courseProgressBar.style.width = `${progress.percent}%`;
  if (courseStartButton) courseStartButton.textContent = `进入 ${lesson.lessonId.replace("lesson-", "Lesson")} 小吴课堂`;
  if (courseCompleteButton) {
    courseCompleteButton.textContent = progress.isCompleted ? "这一课已完成 🌿" : "完成这一课 🌿";
    courseCompleteButton.disabled = progress.isCompleted;
  }

  if (!courseStory) return;

  renderCourseList(courseDashboard.courseCards || [], lesson.lessonId);
  renderReadingProgress(lesson.lessonId);
  currentMemoryCardIndex = 0;

  courseStory.innerHTML = "";
  const pauseModules = lessonPauseModules[lesson.lessonId] || [];
  const story = lesson.story || [];
  story.forEach((paragraph, index) => {
    const knowledgeId = `kp${String(index + 1).padStart(3, "0")}`;
    courseStory.appendChild(createKnowledgeBlock(lesson.lessonId, knowledgeId, paragraph));

    pauseModules
      .filter((module) => module.afterIndex === index)
      .forEach((module) => courseStory.appendChild(createPauseModule(module)));

    if ((index + 1) % 4 === 0 && index < story.length - 1) {
      courseStory.appendChild(createMoodCard(index));
    }

    if (paragraph.startsWith("📖 第") && index < story.length - 1) {
      courseStory.appendChild(createChapterCheckpoint(lesson.lessonId, index));
    }
  });

  courseImportance.textContent = lesson.whyImportant || lesson.importanceReason?.body || "";
  renderList(courseExamPoints, (lesson.examPoints || []).slice(0, 5));
  renderList(courseCommonMistakes, (lesson.commonMistakes || []).slice(0, 3));
  courseMemoryTip.textContent = lesson.understanding || lesson.memoryTip;
  renderMemoryCarousel(lesson);
  courseTodaySentence.textContent = lesson.todaySentence;
  courseExamTrap.innerHTML = "";
  courseExamTrap.appendChild(createCollapsible({
    title: "考试陷阱先折起来，小7想好了再看。",
    content: lesson.examTrap || "",
    explanation: "先自己判断一次，再打开解析，会比直接看答案记得更牢。"
  }));
  courseKeywords.innerHTML = "";
  (lesson.keywords || []).forEach((keyword) => {
    const item = document.createElement("span");
    item.textContent = keyword;
    courseKeywords.appendChild(item);
  });
  coursePracticeText.textContent = lesson.afterLesson || `原创题 ${lesson.practiceQuestionIds?.length || 0} 道 / 官方过去问 ${lesson.officialQuestionIds?.length || 0} 道。先理解，再做题，小吴陪小7把这一课真正落下来。`;
  courseSummary.textContent = lesson.summary;
  courseReward.textContent = `${lesson.completionReward.treeIcon} 完成奖励：成长值 +${lesson.completionReward.growthValue}。${lesson.completionReward.message}`;
  lessonFinishStats.textContent = `今天学习：约 ${formatStudyTime(readNumberStorage(todayStudyKey))}。完成：知识点 ${story.length} 个。成长值：+${lesson.completionReward?.growthValue || 0}。`;
  lessonFinishPanel.querySelector("span").textContent = `🎉 ${lesson.lessonId.replace("lesson-", "Lesson")} 完成！`;
  updateReadingProgress();
}

function renderCourseList(cards, activeLessonId) {
  if (!courseList) return;
  courseList.innerHTML = "";
  cards.forEach((card) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `course-list-item${card.lessonId === activeLessonId ? " active" : ""}${card.progress.isCompleted ? " completed" : ""}`;
    button.innerHTML = `<span>${String(card.order).padStart(2, "0")}</span><strong>${card.title}</strong><em>${card.subject}</em>`;
    button.addEventListener("click", () => {
      window.xiaoWuCourseEngine.selectLesson(card.lessonId);
      renderBrainPlan();
      document.querySelector("#courseCard").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    courseList.appendChild(button);
  });
}

function renderLearningMap(sections) {
  learningMap.innerHTML = "";
  sections.forEach((section) => {
    const block = document.createElement("article");
    block.className = "map-section";
    const title = document.createElement("h3");
    title.textContent = section.subject;
    const list = document.createElement("div");
    list.className = "map-topic-list";

    section.topics.forEach((topic) => {
      const item = document.createElement("div");
      item.className = `map-topic ${topic.state}`;
      item.innerHTML = `<span>${topic.icon}</span><strong>${topic.name}</strong>${topic.isHigh ? "<em>⭐</em>" : ""}`;
      list.appendChild(item);
    });

    block.appendChild(title);
    block.appendChild(list);
    learningMap.appendChild(block);
  });
}

function renderGrowth(growth) {
  growthTotalStudy.textContent = growth.totalStudy;
  growthTotalAnswers.textContent = String(growth.totalAnswers);
  growthAccuracy.textContent = growth.totalAccuracy;
  growthMistakes.textContent = String(growth.totalMistakes);
  growthStreak.textContent = growth.streak;
  growthCompletedTasks.textContent = String(growth.completedTasks);
}

function renderGrowthTree(stages) {
  treeVisual.textContent = stages.stage.icon;
  treeStageName.textContent = stages.stage.name;
  treeProgressBar.style.width = `${stages.percent}%`;
  treePercent.textContent = `${stages.percent}%`;
  treeTodayGrowth.textContent = `+${stages.todayGrowth}`;
  treeTotalGrowth.textContent = String(stages.growthValue);
  treeGardenerMessage.textContent = stages.gardenerMessage;
  treeNextSteps.textContent = stages.nextSteps;
  treeHistoryList.innerHTML = "";

  stages.history.slice(0, 5).forEach((entry) => {
    const item = document.createElement("div");
    item.className = "tree-history-item";
    item.innerHTML = `<span>${entry.date}</span><strong>${entry.icon}</strong><p>${entry.text}</p>`;
    treeHistoryList.appendChild(item);
  });
}

function toggleBrainTask(taskId) {
  if (!currentBrainPlan) return;

  currentBrainPlan.tasks = currentBrainPlan.tasks.map((task) => (
    task.id === taskId ? { ...task, done: !task.done } : task
  ));
  window.xiaoWuBrain.saveTaskState(currentBrainPlan.tasks);
  renderBrainPlan();
}

function completeTodayPlan() {
  if (!currentBrainPlan || currentBrainPlan.completed) return;

  currentBrainPlan.tasks = currentBrainPlan.tasks.map((task) => ({ ...task, done: true }));
  window.xiaoWuBrain.saveTaskState(currentBrainPlan.tasks);
  currentBrainPlan = window.xiaoWuBrain.completeToday(currentBrainPlan);
  renderBrainPlan();
}

function startCourseLesson() {
  if (!currentCourseLessonId) return;
  startStudyTimer();
  window.xiaoWuCourseEngine.startLesson(currentCourseLessonId);
  if (!courseStory) {
    window.location.href = `course.html?id=${encodeURIComponent(currentCourseLessonId)}`;
    return;
  }
  renderBrainPlan();
}

function startTodayLesson() {
  const todayLesson = getTodayLessonDashboard();
  startStudyTimer();

  if (todayLesson.isCompleted) {
    setQuestionSource("original");
    startQuiz();
    document.querySelector("#quizCard")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  window.xiaoWuCourseEngine.startLesson(todayLesson.lessonId);
  window.location.href = `course.html?id=${encodeURIComponent(todayLesson.lessonId)}&start=1`;
}

function completeCourseLesson() {
  if (!currentCourseLessonId) return;
  window.xiaoWuCourseEngine.completeLesson(currentCourseLessonId);
  renderBrainPlan();
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function readNumberStorage(key) {
  const value = Number(localStorage.getItem(key));

  return Number.isFinite(value) ? value : 0;
}

function writeNumberStorage(key, value) {
  localStorage.setItem(key, String(Math.max(0, Math.floor(value))));
}

function ensureStudyDate() {
  const today = getTodayKey();
  const savedDate = localStorage.getItem(studyDateKey);

  if (savedDate !== today) {
    localStorage.setItem(studyDateKey, today);
    writeNumberStorage(todayStudyKey, 0);
  }
}

function formatStudyTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}小时${String(minutes).padStart(2, "0")}分`;
  }

  return `${minutes}分${String(remainingSeconds).padStart(2, "0")}秒`;
}

function renderStudyTime() {
  ensureStudyDate();
  todayStudyTime.textContent = formatStudyTime(readNumberStorage(todayStudyKey));
  totalStudyTime.textContent = formatStudyTime(readNumberStorage(totalStudyKey));
}

function saveStudyDelta() {
  if (!isStudyTiming || !lastStudyTick) return;

  const now = Date.now();
  const deltaSeconds = Math.floor((now - lastStudyTick) / 1000);

  if (deltaSeconds > 0) {
    ensureStudyDate();
    const today = getTodayKey();
    const dailyStudyLog = readStorageObject(dailyStudyLogKey);
    writeNumberStorage(todayStudyKey, readNumberStorage(todayStudyKey) + deltaSeconds);
    writeNumberStorage(totalStudyKey, readNumberStorage(totalStudyKey) + deltaSeconds);
    dailyStudyLog[today] = (Number(dailyStudyLog[today]) || 0) + deltaSeconds;
    localStorage.setItem(dailyStudyLogKey, JSON.stringify(dailyStudyLog));
    lastStudyTick += deltaSeconds * 1000;
    renderStudyTime();
  }
}

function readStorageObject(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function stopStudyTimer() {
  saveStudyDelta();
  isStudyTiming = false;
  lastStudyTick = null;

  if (studyTimerId) {
    clearInterval(studyTimerId);
    studyTimerId = null;
  }
}

function startStudyTimer() {
  ensureStudyDate();

  if (document.visibilityState !== "visible") {
    renderStudyTime();
    return;
  }

  if (isStudyTiming) {
    renderStudyTime();
    return;
  }

  isStudyTiming = true;
  lastStudyTick = Date.now();

  if (!studyTimerId) {
    studyTimerId = setInterval(saveStudyDelta, 1000);
  }

  renderStudyTime();
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

function getGreetingMessagesByHour(hour) {
  let messages = greetingMessages.lateNight;

  if (hour >= 5 && hour <= 8) {
    messages = greetingMessages.earlyMorning;
  } else if (hour >= 9 && hour <= 11) {
    messages = greetingMessages.morning;
  } else if (hour >= 12 && hour <= 13) {
    messages = greetingMessages.noon;
  } else if (hour >= 14 && hour <= 17) {
    messages = greetingMessages.afternoon;
  } else if (hour >= 18 && hour <= 21) {
    messages = greetingMessages.evening;
  }

  return messages;
}

function setCompanionGreeting(hour = new Date().getHours()) {
  const messages = getGreetingMessagesByHour(hour);
  companionMessage.textContent = randomItem(messages);
}

window.previewXiaoWuGreeting = (hour) => {
  setCompanionGreeting(hour);
  return companionMessage.textContent;
};

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

function setQuestionSource(source, shouldStartTimer = true) {
  if (shouldStartTimer) startStudyTimer();
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
  renderBrainPlan();
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
  startStudyTimer();
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
renderBrainPlan();
renderStudyTime();
renderMistakeHistory();
setQuestionSource("original", false);
window.addEventListener("xiaowu-course-ready", renderBrainPlan);
startStudyButton.addEventListener("click", startTodayLesson);
completeTodayButton.addEventListener("click", completeTodayPlan);
courseStartButton.addEventListener("click", startCourseLesson);
courseCompleteButton.addEventListener("click", completeCourseLesson);
if (lessonFinishButton) lessonFinishButton.addEventListener("click", completeCourseLesson);
if (courseOriginalPracticeButton) {
  courseOriginalPracticeButton.addEventListener("click", () => {
    setQuestionSource("original");
    startQuiz();
    quizCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
if (courseOfficialPracticeButton) {
  courseOfficialPracticeButton.addEventListener("click", () => {
    setQuestionSource("past");
    startQuiz();
    quizCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
originalSourceButton.addEventListener("click", () => {
  setQuestionSource("original");
});
pastSourceButton.addEventListener("click", () => {
  setQuestionSource("past");
});
startQuizButton.addEventListener("click", startQuiz);
submitAnswerButton.addEventListener("click", submitAnswer);
nextQuestionButton.addEventListener("click", goNextQuestion);
restartQuizButton.addEventListener("click", startQuiz);
toggleMistakesButton.addEventListener("click", toggleMistakePanel);
window.addEventListener("scroll", updateReadingProgress, { passive: true });
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    stopStudyTimer();
  }
});
window.addEventListener("beforeunload", stopStudyTimer);
