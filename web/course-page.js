const courseLessonLabel = document.querySelector("#courseLessonLabel");
const courseTitle = document.querySelector("#courseTitle");
const courseMeta = document.querySelector("#courseMeta");
const courseProgressBadge = document.querySelector("#courseProgressBadge");
const courseProgressBar = document.querySelector("#courseProgressBar");
const lessonPageTitle = document.querySelector("#lessonPageTitle");
const lessonPageSubtitle = document.querySelector("#lessonPageSubtitle");
const lessonPageTime = document.querySelector("#lessonPageTime");
const lessonPageProgress = document.querySelector("#lessonPageProgress");
const readingLessonLabel = document.querySelector("#readingLessonLabel");
const readingProgressTrack = document.querySelector("#readingProgressTrack");
const readingProgressText = document.querySelector("#readingProgressText");
const courseStartButton = document.querySelector("#courseStartButton");
const courseCompleteButton = document.querySelector("#courseCompleteButton");
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
const courseSummary = document.querySelector("#courseSummary");
const courseReward = document.querySelector("#courseReward");
const lessonFinishPanel = document.querySelector("#lessonFinishPanel");
const lessonFinishStats = document.querySelector("#lessonFinishStats");
const lessonFinishButton = document.querySelector("#lessonFinishButton");
const courseCatalogToggle = document.querySelector("#courseCatalogToggle");
const courseCatalogPanel = document.querySelector("#courseCatalogPanel");
const courseCatalogList = document.querySelector("#courseCatalogList");
const nextLessonTitle = document.querySelector("#nextLessonTitle");
const nextLessonText = document.querySelector("#nextLessonText");
const nextLessonButton = document.querySelector("#nextLessonButton");

const todayStudyKey = "takken_today_study_seconds_v1";
const totalStudyKey = "takken_total_study_seconds_v1";
const studyDateKey = "takken_today_study_date_v1";
const dailyStudyLogKey = "takken_daily_study_log_v1";

let currentLessonId = new URLSearchParams(window.location.search).get("id") || "lesson-001";
let currentLesson = null;
let currentMemoryCardIndex = 0;
let studyTimerId = null;
let lastStudyTick = null;
let isStudyTiming = false;
let completedCheckpointIds = new Set();
let lessonLoadRetryId = null;
let lessonLoadAttempts = 0;

const lessonSequence = [
  { lessonId: "lesson-001", title: "为什么免許题总是做错？", status: "ready" },
  { lessonId: "lesson-002", title: "小吴准备中", status: "pending" },
  { lessonId: "lesson-003", title: "小吴准备中", status: "pending" },
  { lessonId: "lesson-004", title: "小吴准备中", status: "pending" },
  { lessonId: "lesson-005", title: "小吴准备中", status: "pending" },
  { lessonId: "lesson-006", title: "小吴准备中", status: "pending" },
  { lessonId: "lesson-007", title: "小吴准备中", status: "pending" }
];

const lessonChapterLabels = {
  "lesson-001": [
    "第1章｜今天这节课到底在讲什么",
    "第1章｜老师这一小时真正想讲什么",
    "第2章｜免許取消和5年限制",
    "第2章｜先停一下，确认判断顺序",
    "第3章｜役員60日规则",
    "第4章｜業務停止和免許取消不是一回事",
    "第5章｜未成年者与法定代理人",
    "第5章｜未成年者题目的判断顺序",
    "第6章｜営業保証金",
    "第6章｜還付后的补充供託",
    "第7章｜保証協会",
    "第7章｜保証協会的期限和金钱规则",
    "第8章｜還付・取戻し・公告",
    "第8章｜公告主语和取戻し陷阱",
    "第9章｜小吴记忆卡",
    "第10章｜考试陷阱",
    "第11章｜成长树提示",
    "第11章｜今天的小结"
  ]
};

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

function todayKey(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

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

function readStorageObject(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function readNumberStorage(key) {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) ? value : 0;
}

function writeNumberStorage(key, value) {
  localStorage.setItem(key, String(Math.max(0, Math.floor(value))));
}

function ensureStudyDate() {
  const today = todayKey();
  if (localStorage.getItem(studyDateKey) !== today) {
    localStorage.setItem(studyDateKey, today);
    writeNumberStorage(todayStudyKey, 0);
  }
}

function formatStudyTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;
  return hours > 0 ? `${hours}小时${String(minutes).padStart(2, "0")}分` : `${minutes}分${String(remainingSeconds).padStart(2, "0")}秒`;
}

function saveStudyDelta() {
  if (!isStudyTiming || !lastStudyTick) return;
  const now = Date.now();
  const deltaSeconds = Math.floor((now - lastStudyTick) / 1000);

  if (deltaSeconds > 0) {
    ensureStudyDate();
    const today = todayKey();
    const dailyStudyLog = readStorageObject(dailyStudyLogKey);
    writeNumberStorage(todayStudyKey, readNumberStorage(todayStudyKey) + deltaSeconds);
    writeNumberStorage(totalStudyKey, readNumberStorage(totalStudyKey) + deltaSeconds);
    dailyStudyLog[today] = (Number(dailyStudyLog[today]) || 0) + deltaSeconds;
    localStorage.setItem(dailyStudyLogKey, JSON.stringify(dailyStudyLog));
    lastStudyTick += deltaSeconds * 1000;
  }
}

function startStudyTimer() {
  ensureStudyDate();
  if (document.visibilityState !== "visible" || isStudyTiming) return;
  isStudyTiming = true;
  lastStudyTick = Date.now();
  studyTimerId = studyTimerId || setInterval(saveStudyDelta, 1000);
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

function lessonStorageKey(lessonId, suffix) {
  return `${lessonId}-${suffix}`;
}

function getReadingProgressValue(lessonId) {
  return Math.min(100, Math.max(0, Math.round(Number(localStorage.getItem(lessonStorageKey(lessonId, "reading-progress"))) || 0)));
}

function getSavedScrollY(lessonId) {
  return Math.max(0, Math.round(Number(localStorage.getItem(lessonStorageKey(lessonId, "reading-scroll-y"))) || 0));
}

function saveCompletedCheckpoints(lessonId) {
  writeStorage(lessonStorageKey(lessonId, "completed-chapters"), [...completedCheckpointIds]);
}

function loadCompletedCheckpoints(lessonId) {
  completedCheckpointIds = new Set(readStorage(lessonStorageKey(lessonId, "completed-chapters")));
}

function getCompletionGateOpen(lessonId) {
  const progress = getReadingProgressValue(lessonId);
  const checkpoints = document.querySelectorAll(".chapter-checkpoint").length;
  const reachedBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24;
  const courseProgress = window.xiaoWuCourseEngine?.getLessonProgress(lessonId);
  return Boolean(courseProgress?.isCompleted) || progress >= 90 || reachedBottom || completedCheckpointIds.size >= checkpoints && checkpoints > 0;
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

function renderList(container, items) {
  container.innerHTML = "";
  items.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    container.appendChild(item);
  });
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
    renderLesson();
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

function getChapterLabel(lessonId, index) {
  const lesson = window.xiaoWuCourseEngine?.getLesson(lessonId);
  if (lesson?.chapterLabels?.[index]) return lesson.chapterLabels[index];
  return lessonChapterLabels[lessonId]?.[index] || `第${index + 1}章｜小吴课堂`;
}

function createKnowledgeBlock(lessonId, knowledgeId, paragraph, index) {
  const block = document.createElement("article");
  block.className = "knowledge-point";
  block.dataset.knowledgeId = knowledgeId;

  const header = document.createElement("div");
  header.className = "knowledge-point-header";
  const label = document.createElement("span");
  label.textContent = getChapterLabel(lessonId, index);
  header.append(label, createFavoriteButton(lessonId, knowledgeId));

  const text = document.createElement("p");
  text.textContent = paragraph;

  block.append(header, text, createLessonNote(lessonId, knowledgeId));
  return block;
}

function createChapterBlock(lessonId, chapter, chapterIndex) {
  const block = document.createElement("article");
  block.className = "knowledge-point lesson-chapter-block";
  block.dataset.knowledgeId = chapter.id || `chapter-${String(chapterIndex + 1).padStart(2, "0")}`;

  const header = document.createElement("div");
  header.className = "knowledge-point-header";
  const label = document.createElement("span");
  label.textContent = chapter.title || getChapterLabel(lessonId, chapterIndex);
  header.append(label, createFavoriteButton(lessonId, block.dataset.knowledgeId));
  block.appendChild(header);

  (chapter.subSections || []).forEach((section, sectionIndex) => {
    const sectionWrap = document.createElement("section");
    sectionWrap.className = "lesson-subsection";
    const sectionTitle = document.createElement("h4");
    sectionTitle.textContent = section.title || `${chapterIndex + 1}-${sectionIndex + 1}`;
    const sectionText = document.createElement("p");
    sectionText.textContent = section.text || "";
    sectionWrap.append(sectionTitle, sectionText);
    block.appendChild(sectionWrap);
  });

  if (chapter.body) {
    const text = document.createElement("p");
    text.textContent = chapter.body;
    block.appendChild(text);
  }

  block.appendChild(createLessonNote(lessonId, block.dataset.knowledgeId));
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

  [content, explanation].filter(Boolean).forEach((value) => {
    const text = document.createElement("p");
    text.textContent = value;
    body.appendChild(text);
  });

  button.addEventListener("click", () => {
    const willShow = body.classList.contains("hidden");
    body.classList.toggle("hidden", !willShow);
    button.textContent = willShow ? "收起答案" : teaser;
  });

  wrap.append(heading, button, body);
  return wrap;
}

function createPauseModule(module) {
  const wrap = document.createElement("div");
  wrap.className = "lesson-pause-card";
  const title = document.createElement("h3");
  title.textContent = module.title;
  const question = document.createElement("p");
  question.textContent = module.question;
  wrap.append(title, question, createCollapsible({
    title: "小吴先不急着公布答案",
    teaser: "我想好了",
    content: module.answer,
    explanation: module.explanation
  }));
  return wrap;
}

function createChapterCheckpoint(index) {
  const checkpointId = `chapter-${index}`;
  const wrap = document.createElement("div");
  wrap.className = `chapter-checkpoint${completedCheckpointIds.has(checkpointId) ? " completed" : ""}`;
  wrap.dataset.checkpointId = checkpointId;
  wrap.innerHTML = "<span>🌱</span><p>小吴：今天这一部分已经完成啦～继续努力，小树又长高一点点。</p>";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary-button";
  button.textContent = completedCheckpointIds.has(checkpointId) ? "这一章已完成" : "继续学习";
  button.addEventListener("click", () => {
    completedCheckpointIds.add(checkpointId);
    saveCompletedCheckpoints(currentLessonId);
    wrap.classList.add("completed");
    button.textContent = "这一章已完成";
    updateFinishPanelVisibility();
    const next = document.querySelector(`[data-knowledge-id="kp${String(index + 2).padStart(3, "0")}"]`);
    if (next) next.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  wrap.appendChild(button);
  return wrap;
}

function renderReadingProgress(lessonId) {
  const percent = getReadingProgressValue(lessonId);
  readingLessonLabel.textContent = `📖 ${lessonId.replace("lesson-", "Lesson")}`;
  readingProgressText.textContent = `${percent}%`;
  lessonPageProgress.textContent = `阅读进度 ${percent}%`;
  readingProgressTrack.innerHTML = "";

  for (let index = 0; index < 10; index += 1) {
    const piece = document.createElement("span");
    piece.className = index < Math.round(percent / 10) ? "filled" : "";
    readingProgressTrack.appendChild(piece);
  }
}

function updateFinishPanelVisibility() {
  const isOpen = getCompletionGateOpen(currentLessonId);
  lessonFinishPanel.classList.toggle("hidden", !isOpen);
  courseReward.classList.toggle("hidden", !isOpen);
  courseCompleteButton.classList.add("hidden");
}

function updateReadingProgress() {
  if (!currentLessonId || !courseLesson) return;
  const rect = courseLesson.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const total = Math.max(1, rect.height - viewportHeight * 0.45);
  const read = Math.min(total, Math.max(0, -rect.top + viewportHeight * 0.2));
  const percent = Math.min(100, Math.max(0, Math.round((read / total) * 100)));
  const key = lessonStorageKey(currentLessonId, "reading-progress");
  const saved = Number(localStorage.getItem(key)) || 0;
  const next = Math.max(saved, percent);
  localStorage.setItem(key, String(next));
  const savedScrollY = getSavedScrollY(currentLessonId);
  const currentScrollY = Math.max(0, Math.round(window.scrollY || 0));
  localStorage.setItem(lessonStorageKey(currentLessonId, "reading-scroll-y"), String(Math.max(savedScrollY, currentScrollY)));
  renderReadingProgress(currentLessonId);
  updateFinishPanelVisibility();
}

function renderMemoryCarousel(lesson) {
  const cards = lesson.memoryCard || [];
  const state = getLessonMemoryState(lesson.lessonId);
  currentMemoryCardIndex = Math.min(currentMemoryCardIndex, Math.max(0, cards.length - 1));
  const card = cards[currentMemoryCardIndex];
  courseMemoryCard.innerHTML = "";
  if (!card) return;

  const rememberedCount = Object.values(state).filter((value) => value === "remembered").length;
  const cardState = state[currentMemoryCardIndex] || "";
  const wrap = document.createElement("div");
  wrap.className = "memory-carousel";
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
  [
    ["上一张", "secondary-button", () => { currentMemoryCardIndex = Math.max(0, currentMemoryCardIndex - 1); renderMemoryCarousel(lesson); }, currentMemoryCardIndex === 0],
    ["下一张", "secondary-button", () => { currentMemoryCardIndex = Math.min(cards.length - 1, currentMemoryCardIndex + 1); renderMemoryCarousel(lesson); }, currentMemoryCardIndex >= cards.length - 1],
    ["记住了 ✅", "primary-button", () => { state[currentMemoryCardIndex] = "remembered"; saveLessonMemoryState(lesson.lessonId, state); renderMemoryCarousel(lesson); }, false],
    ["没记住 🔁", "secondary-button", () => { state[currentMemoryCardIndex] = "retry"; saveLessonMemoryState(lesson.lessonId, state); renderMemoryCarousel(lesson); }, false]
  ].forEach(([text, className, onClick, disabled]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = text;
    button.disabled = disabled;
    button.addEventListener("click", onClick);
    controls.appendChild(button);
  });

  wrap.appendChild(controls);
  courseMemoryCard.appendChild(wrap);
}

function lessonDisplayLabel(lessonId) {
  return lessonId.replace("lesson-", "Lesson");
}

function isLessonOpen(lessonId) {
  const sequenceItem = lessonSequence.find((item) => item.lessonId === lessonId);
  return sequenceItem?.status === "ready" && Boolean(window.xiaoWuCourseEngine?.getLesson(lessonId));
}

function renderCourseCatalog() {
  if (!courseCatalogList) return;
  courseCatalogList.innerHTML = "";

  lessonSequence.forEach((item) => {
    const label = lessonDisplayLabel(item.lessonId);
    const lesson = window.xiaoWuCourseEngine?.getLesson(item.lessonId);
    const open = isLessonOpen(item.lessonId);
    const row = document.createElement(open ? "a" : "div");
    row.className = `course-catalog-item${open ? " available" : " locked"}${item.lessonId === currentLessonId ? " current" : ""}`;

    if (open) {
      row.href = `course.html?id=${item.lessonId}`;
      row.textContent = `${label}｜${lesson?.intro?.title || item.title}`;
    } else {
      row.innerHTML = `<span>${label}｜即将开放</span><em>小吴准备中</em>`;
    }

    courseCatalogList.appendChild(row);
  });
}

function renderNextLesson() {
  if (!nextLessonTitle || !nextLessonButton) return;
  const currentIndex = lessonSequence.findIndex((item) => item.lessonId === currentLessonId);
  const next = lessonSequence[currentIndex + 1] || { lessonId: "lesson-002", status: "pending" };
  const label = lessonDisplayLabel(next.lessonId);
  const open = isLessonOpen(next.lessonId);
  const nextLesson = window.xiaoWuCourseEngine?.getLesson(next.lessonId);

  nextLessonTitle.textContent = open
    ? `${label}｜${nextLesson?.intro?.title || next.title || "小吴课堂"}`
    : `${label}｜小吴正在准备中 🌸`;
  nextLessonText.textContent = open
    ? "小7，下一堂课已经准备好啦。休息一下，再继续也可以。"
    : "小7，下一堂课小吴还在整理。今天先把 Lesson001 稳稳吃透。不用急，树不是一天长大的，但每天都会长高一点点。";
  nextLessonButton.textContent = open ? `进入 ${label} 小吴课堂` : "🌸 明天再来看看";
  nextLessonButton.disabled = !open;
  nextLessonButton.onclick = open ? () => {
    window.location.href = `course.html?id=${next.lessonId}`;
  } : null;
}

function renderLesson() {
  const lesson = currentLesson;
  if (!lesson) return;

  const progress = window.xiaoWuCourseEngine.getLessonProgress(lesson.lessonId);
  const chapters = lesson.chapters || [];
  const story = chapters.length ? chapters : lesson.story || [];
  const pauseModules = lesson.pauseModules || lessonPauseModules[lesson.lessonId] || [];
  currentLessonId = lesson.lessonId;
  loadCompletedCheckpoints(lesson.lessonId);
  const savedProgress = getReadingProgressValue(lesson.lessonId);
  const savedScrollY = getSavedScrollY(lesson.lessonId);
  const lessonLabel = lessonDisplayLabel(lesson.lessonId);
  const cleanTitle = lesson.intro?.subtitle || lesson.title.replace(" 入门复习", "").replace("・保証協会入门复习", "・保証協会");

  lessonPageTitle.textContent = lesson.title || lessonLabel;
  lessonPageSubtitle.textContent = cleanTitle;
  lessonPageTime.textContent = `预计${lesson.estimatedMinutes || 35}分钟`;
  lessonPageProgress.textContent = `阅读进度 ${savedProgress}%`;
  courseLessonLabel.textContent = lessonLabel;
  courseTitle.textContent = lesson.title;
  courseMeta.textContent = `${lesson.subject} / 预计${lesson.estimatedMinutes || 35}分钟 / 小吴课堂`;
  courseProgressBadge.textContent = `${progress.percent}%`;
  courseProgressBadge.classList.toggle("hidden", !courseProgressBadge.textContent.trim());
  courseProgressBar.style.width = `${progress.percent}%`;
  courseStartButton.textContent = "继续上次位置";
  courseStartButton.classList.toggle("hidden", savedProgress <= 0 || savedScrollY <= 0 || progress.isCompleted);
  courseCompleteButton.textContent = progress.isCompleted ? "这一课已完成 🌿" : "完成这一课 🌿";
  courseCompleteButton.disabled = progress.isCompleted;
  courseCompleteButton.classList.add("hidden");
  currentMemoryCardIndex = Math.min(currentMemoryCardIndex, Math.max(0, (lesson.memoryCard || []).length - 1));

  courseStory.innerHTML = "";
  story.forEach((item, index) => {
    const knowledgeId = `kp${String(index + 1).padStart(3, "0")}`;
    const block = chapters.length
      ? createChapterBlock(lesson.lessonId, item, index)
      : createKnowledgeBlock(lesson.lessonId, knowledgeId, item, index);
    courseStory.appendChild(block);
    pauseModules.filter((module) => module.afterIndex === index).forEach((module) => courseStory.appendChild(createPauseModule(module)));
    if ((index + 1) % 4 === 0 && index < story.length - 1) courseStory.appendChild(createMoodCard(index));
    if (index < story.length - 1) courseStory.appendChild(createChapterCheckpoint(index));
  });

  courseImportance.textContent = lesson.whyImportant || "";
  renderList(courseExamPoints, (lesson.examPoints || []).slice(0, 5));
  renderList(courseCommonMistakes, (lesson.commonMistakes || []).slice(0, 3));
  courseMemoryTip.textContent = lesson.understanding || lesson.memoryTip || "";
  renderMemoryCarousel(lesson);
  courseTodaySentence.textContent = lesson.todaySentence || "";
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
  coursePracticeText.textContent = lesson.afterLesson || "学完以后，先做原创题，再做官方过去问。";
  courseSummary.textContent = lesson.summary || "";
  lessonFinishStats.textContent = `今天学习：约 ${formatStudyTime(readNumberStorage(todayStudyKey))}。完成：课堂章节 ${story.length} 个。成长值：+${lesson.completionReward?.growthValue || 0}。`;
  lessonFinishPanel.querySelector("span").textContent = `🎉 ${lessonLabel} 完成！`;
  courseReward.textContent = `${lesson.completionReward?.treeIcon || "🌿"} 完成奖励：成长值 +${lesson.completionReward?.growthValue || 0}。${lesson.completionReward?.message || "小树又长高一点点。"}`;
  renderCourseCatalog();
  renderNextLesson();
  renderReadingProgress(lesson.lessonId);
  updateFinishPanelVisibility();
}

function continueLastPosition() {
  startStudyTimer();
  window.xiaoWuCourseEngine.startLesson(currentLessonId);
  const savedScrollY = getSavedScrollY(currentLessonId);
  if (savedScrollY > 0) {
    window.scrollTo({ top: savedScrollY, behavior: "smooth" });
  }
}

function completeLesson() {
  window.xiaoWuCourseEngine.completeLesson(currentLessonId);
  renderLesson();
}

function loadCurrentLesson() {
  console.log("[XiaoWu Course] load attempt", {
    lessonId: currentLessonId,
    hasEngine: Boolean(window.xiaoWuCourseEngine),
    loadedLessons: Object.keys(window.xiaoWuLessons || {})
  });
  if (!window.xiaoWuCourseEngine) {
    scheduleLessonLoadRetry();
    return;
  }
  currentLesson = window.xiaoWuCourseEngine.getLesson(currentLessonId) || window.xiaoWuCourseEngine.getLesson("lesson-001");
  if (!currentLesson) {
    scheduleLessonLoadRetry();
    return;
  }
  if (lessonLoadRetryId) clearTimeout(lessonLoadRetryId);
  console.log("[XiaoWu Course] lesson loaded", currentLesson.lessonId);
  currentLessonId = currentLesson.lessonId;
  if (new URLSearchParams(window.location.search).get("start") === "1") {
    startStudyTimer();
    window.xiaoWuCourseEngine.startLesson(currentLessonId);
  }
  renderLesson();
}

function scheduleLessonLoadRetry() {
  lessonLoadAttempts += 1;
  if (lessonLoadRetryId) clearTimeout(lessonLoadRetryId);

  if (lessonLoadAttempts > 12) {
    console.warn("[XiaoWu Course] lesson load failed", {
      lessonId: currentLessonId,
      loadedLessons: Object.keys(window.xiaoWuLessons || {})
    });
    courseTitle.textContent = "课程暂时没有加载成功，请刷新页面。";
    courseMeta.textContent = "如果刷新后仍失败，请检查课程文件是否存在。";
    courseStory.innerHTML = "";
    return;
  }

  lessonLoadRetryId = setTimeout(loadCurrentLesson, 250);
}

window.addEventListener("xiaowu-course-ready", loadCurrentLesson);
document.addEventListener("DOMContentLoaded", loadCurrentLesson);
setTimeout(loadCurrentLesson, 0);
window.addEventListener("scroll", updateReadingProgress, { passive: true });
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") stopStudyTimer();
});
window.addEventListener("beforeunload", stopStudyTimer);
courseStartButton.addEventListener("click", continueLastPosition);
courseCompleteButton.addEventListener("click", completeLesson);
lessonFinishButton.addEventListener("click", completeLesson);
courseCatalogToggle?.addEventListener("click", () => {
  courseCatalogPanel?.classList.toggle("hidden");
});
