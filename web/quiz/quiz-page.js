(function () {
  const storage = window.XiaoWuLearningStorage;
  const quizBank = window.xiaoWuQuizBank || [];

  const lessonTitleMap = new Map(quizBank.map((q) => [q.lessonId, q.title]));
  const lessonIds = Array.from(new Set(quizBank.map((q) => q.lessonId))).sort();
  const fiveLessons = new Set(["lesson-009", "lesson-010", "lesson-011", "lesson-012", "lesson-013", "lesson-014"]);
  const taxLessons = new Set(["lesson-015", "lesson-016", "lesson-017", "lesson-018", "lesson-019", "lesson-020"]);
  const passLine = { full: 35, exempt: 32 };

  const categories = [
    { id: "takken", label: "宅建業法", lessons: ["lesson-001", "lesson-002", "lesson-003", "lesson-004"] },
    { id: "rights", label: "権利関係", lessons: ["lesson-005", "lesson-006", "lesson-007", "lesson-008"] },
    { id: "law", label: "法令上の制限", lessons: [] },
    { id: "tax", label: "税・その他", lessons: ["lesson-015", "lesson-016", "lesson-017", "lesson-018", "lesson-019", "lesson-020"] },
    { id: "five", label: "五問免除", lessons: ["lesson-009", "lesson-010", "lesson-011", "lesson-012", "lesson-013", "lesson-014"] }
  ];

  const pastExams = window.xiaoWuPastExamIndex || ["令和8年", "令和7年", "令和6年", "令和5年", "令和4年", "令和3年", "令和2年", "令和元年", "平成30年"].map((label) => ({
    label,
    totalQuestions: 50,
    durationMinutes: 120,
    order: "official",
    questions: []
  }));

  const topicGroups = [
    { label: "免許制度", match: ["免許", "知事免許", "大臣免許", "免許更新", "免許取消"] },
    { label: "欠格事由・5年制限", match: ["欠格", "5年", "役員", "掛け込み廃業", "未成年者"] },
    { label: "営業保証金", match: ["営業保証金", "営業開始", "還付後"] },
    { label: "保証協会", match: ["保証協会", "弁済業務保証金", "分担金"] },
    { label: "届出・変更届", match: ["変更届", "廃業等", "死亡", "合併", "専任宅建士"] },
    { label: "免許換え・登録移転", match: ["免許換え", "登録移転", "変更登録", "宅建士証"] },
    { label: "案内所・標識", match: ["案内所", "標識", "共同案内所", "届出先"] },
    { label: "従業者証明書・名簿", match: ["従業者証明書", "従業者名簿", "免許証と標識", "証明書と名簿"] },
    { label: "相殺", match: ["相殺", "自動債権", "受動債権", "弁済期", "差押禁止債権"] },
    { label: "印紙税｜土地賃貸借", match: ["土地 vs 建物租赁", "土地賃貸借"] },
    { label: "印紙税｜建物賃貸借", match: ["建物賃貸借"] },
    { label: "印紙税｜課税文書", match: ["印紙税", "課税文書", "仮契約", "覚書"] },
    { label: "印紙税｜収入印紙・過怠税", match: ["过怠税", "収入印紙"] },
    { label: "登録免許税｜保存登記・表示登記", match: ["登録免許税", "表示登记", "保存登記"] },
    { label: "登録免許税｜移転登記・評価額", match: ["移転登記", "课税标准", "評価額"] },
    { label: "登録免許税｜抵当権", match: ["抵押权设定", "抵当権"] },
    { label: "所得税", match: ["所得", "长期・短期", "3000万特别扣除", "适用关系"] },
    { label: "不動産取得税", match: ["不動産取得税", "所在地都道府県", "宅地减半"] },
    { label: "相続｜相続順位", match: ["相続順位", "内縁", "直系尊属"] },
    { label: "相続｜片親違い・代襲", match: ["片親違い", "代襲相続"] },
    { label: "配偶者居住権", match: ["配偶者居住権"] },
    { label: "共有｜保存・管理・変更", match: ["共有", "保存行為", "管理行為", "重大変更", "軽微変更"] }
  ];

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const views = {
    directory: $("#quizDirectoryView"),
    lessons: $("#quizLessonListView"),
    categories: $("#quizCategoryView"),
    topics: $("#quizTopicView"),
    search: $("#quizSearchView"),
    past: $("#quizPastView"),
    mockIntro: $("#quizMockIntroView"),
    practice: $("#quizPracticeView"),
    result: $("#quizResultView"),
    list: $("#quizListView"),
    stats: $("#quizStatsView"),
    settings: $("#quizSettingsView")
  };

  const lessonPracticeList = $("#lessonPracticeList");
  const categoryPracticeList = $("#categoryPracticeList");
  const topicPracticeList = $("#topicPracticeList");
  const pastYearList = $("#pastYearList");
  const practiceModeLabel = $("#practiceModeLabel");
  const quizQuestionCounter = $("#quizQuestionCounter");
  const quizLessonBadge = $("#quizLessonBadge");
  const mockExamStatus = $("#mockExamStatus");
  const mockTimeLeft = $("#mockTimeLeft");
  const mockAnsweredCount = $("#mockAnsweredCount");
  const quizQuestionTitle = $("#quizQuestionTitle");
  const quizRelatedSection = $("#quizRelatedSection");
  const quizQuestionSource = $("#quizQuestionSource");
  const quizChoiceList = $("#quizChoiceList");
  const favoriteQuestionButton = $("#favoriteQuestionButton");
  const mockExamActions = $("#mockExamActions");
  const previousQuizQuestionButton = $("#previousQuizQuestionButton");
  const mockNextQuestionButton = $("#mockNextQuestionButton");
  const submitMockButton = $("#submitMockButton");
  const quizAnswerPanel = $("#quizAnswerPanel");
  const quizAnswerResult = $("#quizAnswerResult");
  const quizExplanationText = $("#quizExplanationText");
  const quizSimilarBlock = $("#quizSimilarBlock");
  const returnLessonButton = $("#returnLessonButton");
  const nextQuizQuestionButton = $("#nextQuizQuestionButton");
  const resultTotal = $("#resultTotal");
  const resultCorrect = $("#resultCorrect");
  const resultRate = $("#resultRate");
  const resultMistakes = $("#resultMistakes");
  const resultPassLine = $("#resultPassLine");
  const resultMessage = $("#resultMessage");
  const savedQuestionList = $("#savedQuestionList");
  const listEyebrow = $("#listEyebrow");
  const listTitle = $("#listTitle");
  const listNote = $("#listNote");
  const practiceSavedListButton = $("#practiceSavedListButton");
  const mockExemptionNote = $("#mockExemptionNote");
  const quizSearchInput = $("#quizSearchInput");
  const quizSearchResults = $("#quizSearchResults");
  const mockScoreBreakdown = $("#mockScoreBreakdown");

  let currentQuestions = [];
  let currentIndex = 0;
  let currentMode = "lesson";
  let currentLabel = "Lesson练习";
  let currentResults = [];
  let savedListQuestions = [];
  let selectedAnswer = null;
  let mockAnswers = [];
  let mockTimerId = null;
  let mockEndsAt = 0;
  let lastTickAt = Date.now();
  let lastResultQuestions = [];

  function loadData() {
    return storage?.loadLearningData ? storage.loadLearningData() : {
      settings: { hasFiveQuestionExemption: false },
      studyTime: { todaySeconds: 0, totalSeconds: 0 },
      quiz: { stats: { totalAnswered: 0, totalCorrect: 0, todayAnswered: 0, lessons: {} }, mistakes: [], favorites: [], mockExams: [] },
      courses: { favorites: [], completed: [] },
      aiContext: {}
    };
  }

  function saveData(data) {
    if (storage?.saveLearningData) return storage.saveLearningData(data);
    return data;
  }

  function updateData(mutator) {
    if (storage?.updateLearningData) return storage.updateLearningData(mutator);
    const data = loadData();
    return saveData(mutator(data) || data);
  }

  function hasFiveExemption() {
    return Boolean(loadData().settings?.hasFiveQuestionExemption);
  }

  function visibleLessonIds() {
    return lessonIds.filter((lessonId) => !(hasFiveExemption() && fiveLessons.has(lessonId)));
  }

  function questionsForLessons(ids) {
    const allowed = new Set(ids);
    return quizBank.filter((q) => allowed.has(q.lessonId) && !(hasFiveExemption() && fiveLessons.has(q.lessonId)));
  }

  function questionsForTopic(topic) {
    return quizBank.filter((q) => {
      if (hasFiveExemption() && fiveLessons.has(q.lessonId)) return false;
      const text = `${q.title} ${q.relatedSection} ${q.question}`;
      return topic.match.some((keyword) => text.includes(keyword));
    });
  }

  function similarQuestionsFor(question, limit = 5) {
    if (!question) return [];
    const related = String(question.relatedSection || "");
    const title = String(question.title || "");
    return quizBank
      .filter((candidate) => candidate.id !== question.id)
      .filter((candidate) => {
        if (hasFiveExemption() && fiveLessons.has(candidate.lessonId)) return false;
        return candidate.relatedSection === question.relatedSection
          || candidate.title === question.title
          || related.includes(candidate.relatedSection)
          || String(candidate.relatedSection || "").includes(related)
          || title.includes(candidate.title)
          || String(candidate.title || "").includes(title);
      })
      .slice(0, limit);
  }

  function renderSimilarQuestions(question) {
    const similar = similarQuestionsFor(question);
    quizSimilarBlock.innerHTML = "";
    if (!similar.length) return;
    const title = document.createElement("strong");
    title.textContent = "📚 相似题";
    quizSimilarBlock.appendChild(title);
    const list = document.createElement("div");
    list.className = "quiz-similar-list";
    similar.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "secondary-button";
      button.textContent = `${formatLessonLabel(item.lessonId)}｜${item.relatedSection}`;
      button.addEventListener("click", () => startPractice([item], `${item.relatedSection} 相似题`, "similar"));
      list.appendChild(button);
    });
    quizSimilarBlock.appendChild(list);
  }

  function formatExplanation(question) {
    const answerLabel = question.choices?.[question.answer] || "正解";
    const base = String(question.explanation || "").replace(/^🌸\s*/, "");
    const trap = question.relatedSection ? `本题考试陷阱：看到「${question.relatedSection}」这个考点时，不要只凭关键词秒选，要先确认题干主语、对象和时间。` : "本题考试陷阱：不要只凭关键词秒选，要先确认题干在问什么。";
    const tip = question.relatedSection ? `本题口诀：${question.relatedSection}，先看制度，再看例外。` : "本题口诀：先判断制度，再判断例外。";
    return [
      "🌸 小吴老师：",
      `① 为什么正确：正解是「${answerLabel}」。${base}`,
      "② 为什么其它选项错误：其它选项会把制度、对象、期限或例外混在一起；考试就是用这种方式让小7误判。",
      `③ ${trap}`,
      `④ ${tip}`,
      "⑤ 推荐继续做：下面的相似题。"
    ].join("\n");
  }

  function formatLessonLabel(lessonId) {
    return `Lesson${lessonId.replace("lesson-", "")}`;
  }

  function getLessonTitle(lessonId) {
    return lessonTitleMap.get(lessonId) || "小吴课堂";
  }

  function showView(name) {
    Object.values(views).forEach((view) => view?.classList.add("hidden"));
    views[name]?.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function formatTime(seconds) {
    const safe = Math.max(0, Math.floor(seconds || 0));
    const minutes = Math.floor(safe / 60);
    const rest = safe % 60;
    return `${minutes}分${String(rest).padStart(2, "0")}秒`;
  }

  function formatClock(seconds) {
    const safe = Math.max(0, Math.floor(seconds || 0));
    const minutes = Math.floor(safe / 60);
    const rest = safe % 60;
    return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }

  function tickStudyTime(force = false) {
    const now = Date.now();
    const delta = Math.floor((now - lastTickAt) / 1000);
    if (!force && delta < 5) return;
    lastTickAt = now;
    if (delta <= 0) return;
    updateData((data) => {
      data.studyTime.todaySeconds = (Number(data.studyTime.todaySeconds) || 0) + delta;
      data.studyTime.totalSeconds = (Number(data.studyTime.totalSeconds) || 0) + delta;
      data.studyTime.days = Array.from(new Set([...(data.studyTime.days || []), storage?.todayKey?.() || new Date().toISOString().slice(0, 10)]));
      return data;
    });
  }

  function startStudyTicker() {
    lastTickAt = Date.now();
    setInterval(() => {
      if (document.visibilityState === "visible") tickStudyTime();
    }, 10000);
  }

  function questionById(id) {
    return quizBank.find((q) => q.id === id);
  }

  function getFavorites() {
    return loadData().quiz?.favorites || [];
  }

  function isFavorite(questionId) {
    return getFavorites().includes(questionId);
  }

  function toggleFavorite(questionId) {
    updateData((data) => {
      const favorites = new Set(data.quiz.favorites || []);
      if (favorites.has(questionId)) favorites.delete(questionId);
      else favorites.add(questionId);
      data.quiz.favorites = Array.from(favorites);
      return data;
    });
    renderFavoriteButton();
  }

  function addMistake(question) {
    updateData((data) => {
      const existing = (data.quiz.mistakes || []).filter((item) => item.id !== question.id);
      data.quiz.mistakes = [{
        id: question.id,
        lessonId: question.lessonId,
        title: question.title,
        question: question.question,
        savedAt: new Date().toISOString()
      }, ...existing].slice(0, 300);
      return data;
    });
  }

  function markMastered(questionId) {
    updateData((data) => {
      data.quiz.mistakes = (data.quiz.mistakes || []).filter((item) => item.id !== questionId);
      return data;
    });
    renderSavedList("mistakes");
  }

  function updateStats(question, correct) {
    updateData((data) => {
      const stats = data.quiz.stats;
      stats.totalAnswered = (Number(stats.totalAnswered) || 0) + 1;
      stats.totalCorrect = (Number(stats.totalCorrect) || 0) + (correct ? 1 : 0);
      stats.todayAnswered = (Number(stats.todayAnswered) || 0) + 1;
      stats.recentAt = new Date().toISOString();
      stats.lessons = stats.lessons || {};
      const lessonStats = stats.lessons[question.lessonId] || { answered: 0, correct: 0 };
      lessonStats.answered += 1;
      lessonStats.correct += correct ? 1 : 0;
      lessonStats.lastPracticedAt = new Date().toISOString();
      stats.lessons[question.lessonId] = lessonStats;
      data.aiContext = buildAiContext(data);
      return data;
    });
  }

  function buildAiContext(data) {
    const lessonStats = data.quiz.stats.lessons || {};
    let weakest = "";
    let weakestRate = 101;
    Object.entries(lessonStats).forEach(([lessonId, stat]) => {
      if (hasFiveExemption() && fiveLessons.has(lessonId)) return;
      if (!stat.answered) return;
      const rate = Math.round((stat.correct / stat.answered) * 100);
      if (rate < weakestRate) {
        weakestRate = rate;
        weakest = lessonId;
      }
    });
    return {
      updatedAt: new Date().toISOString(),
      studyTodaySeconds: data.studyTime.todaySeconds,
      studyTotalSeconds: data.studyTime.totalSeconds,
      totalAnswered: data.quiz.stats.totalAnswered,
      accuracy: data.quiz.stats.totalAnswered ? Math.round((data.quiz.stats.totalCorrect / data.quiz.stats.totalAnswered) * 100) : 0,
      mistakes: data.quiz.mistakes.length,
      favorites: data.quiz.favorites.length,
      mockExams: data.quiz.mockExams || [],
      weakestLesson: weakest,
      recommendation: weakest ? `${formatLessonLabel(weakest)}｜${getLessonTitle(weakest)}` : "先完成一组练习，小吴再推荐。"
    };
  }

  function renderDirectory() {
    const exempt = hasFiveExemption();
    $$("[data-five-card='true']").forEach((card) => card.classList.toggle("hidden", exempt));
    showView("directory");
  }

  function renderLessons() {
    const data = loadData();
    const stats = data.quiz.stats.lessons || {};
    lessonPracticeList.innerHTML = "";
    visibleLessonIds().forEach((lessonId) => {
      const lessonQuestions = quizBank.filter((q) => q.lessonId === lessonId);
      const stat = stats[lessonId] || { answered: 0, correct: 0 };
      const rate = stat.answered ? Math.round((stat.correct / stat.answered) * 100) : 0;
      const card = document.createElement("article");
      card.className = "quiz-lesson-card";
      card.innerHTML = `
        <strong>${formatLessonLabel(lessonId)}｜${getLessonTitle(lessonId)}</strong>
        <span>题目数量：${lessonQuestions.length}</span>
        <span>完成数：${stat.answered || 0}</span>
        <span>正确率：${stat.answered ? `${rate}%` : "还没练"}</span>
        <button class="secondary-button" type="button">开始练习</button>
      `;
      card.querySelector("button").addEventListener("click", () => startPractice(lessonQuestions, `${formatLessonLabel(lessonId)} 练习`, "lesson"));
      lessonPracticeList.appendChild(card);
    });
    showView("lessons");
  }

  function renderCategories() {
    categoryPracticeList.innerHTML = "";
    categories.forEach((category) => {
      if (category.id === "five" && hasFiveExemption()) return;
      const questions = questionsForLessons(category.lessons);
      const card = document.createElement("article");
      card.className = "quiz-lesson-card";
      const lessonLabels = category.lessons.length
        ? category.lessons.map(formatLessonLabel).join(" / ")
        : "小吴正在整理这个分类。";
      card.innerHTML = `
        <strong>${category.label}</strong>
        <span>${lessonLabels}</span>
        <span>题目数量：${questions.length}</span>
        <button class="secondary-button" type="button" ${questions.length ? "" : "disabled"}>开始练习</button>
      `;
      card.querySelector("button").addEventListener("click", () => startPractice(questions, `${category.label} 专项`, "category"));
      categoryPracticeList.appendChild(card);
    });
    showView("categories");
  }

  function renderTopics() {
    topicPracticeList.innerHTML = "";
    topicGroups.forEach((topic) => {
      const questions = questionsForTopic(topic);
      if (!questions.length) return;
      const lessons = Array.from(new Set(questions.map((q) => formatLessonLabel(q.lessonId)))).join(" / ");
      const card = document.createElement("article");
      card.className = "quiz-lesson-card";
      card.innerHTML = `
        <strong>${topic.label}</strong>
        <span>关联课程：${lessons}</span>
        <span>题目数量：${questions.length}</span>
        <button class="secondary-button" type="button">开始知识点练习</button>
      `;
      card.querySelector("button").addEventListener("click", () => startPractice(questions, `${topic.label} 知识点练习`, "topic"));
      topicPracticeList.appendChild(card);
    });
    showView("topics");
  }

  function renderSearch() {
    quizSearchInput.value = "";
    quizSearchResults.innerHTML = "<p class=\"quiz-soft-note\">输入关键词，小吴会帮小7把相关题目找出来。</p>";
    showView("search");
    quizSearchInput.focus();
  }

  function renderSearchResults(keyword) {
    const term = keyword.trim();
    quizSearchResults.innerHTML = "";
    if (!term) {
      quizSearchResults.innerHTML = "<p class=\"quiz-soft-note\">输入关键词，小吴会帮小7把相关题目找出来。</p>";
      return;
    }
    const results = quizBank.filter((question) => {
      if (hasFiveExemption() && fiveLessons.has(question.lessonId)) return false;
      return [question.question, question.title, question.relatedSection, question.category, question.source]
        .some((value) => String(value || "").includes(term));
    }).slice(0, 60);
    if (!results.length) {
      quizSearchResults.innerHTML = "<p class=\"quiz-soft-note\">暂时没有找到。换一个关键词试试，比如 印紙税、保証協会、相殺。</p>";
      return;
    }
    results.forEach((question) => {
      const item = document.createElement("article");
      item.className = "saved-question-item";
      item.innerHTML = `
        <strong>${question.title}</strong>
        <span>${question.source}｜${formatLessonLabel(question.lessonId)}｜${question.relatedSection}</span>
        <p>${question.question}</p>
        <div class="quiz-result-actions">
          <button class="secondary-button" type="button">进入练习</button>
        </div>
      `;
      item.querySelector("button").addEventListener("click", () => startPractice([question], `${term} 搜索练习`, "search"));
      quizSearchResults.appendChild(item);
    });
  }

  function renderPastYears() {
    pastYearList.innerHTML = "";
    pastExams.forEach((exam) => {
      const card = document.createElement("article");
      card.className = "quiz-lesson-card";
      card.innerHTML = `
        <strong>${exam.label}</strong>
        <span>${exam.totalQuestions}题 / ${exam.durationMinutes}分钟 / 原考试顺序</span>
        <span>${exam.questions.length ? `已整理 ${exam.questions.length} 题` : "🌸 小吴正在整理这年份的真题。"}</span>
        <button class="secondary-button" type="button" ${exam.questions.length ? "" : "disabled"}>进入整套真题</button>
      `;
      pastYearList.appendChild(card);
    });
    showView("past");
  }

  function renderMockIntro() {
    mockExemptionNote.textContent = hasFiveExemption()
      ? "已开启五問免除资格：本次模拟会自动去掉五問免除题。"
      : "当前为完整50题模式。";
    showView("mockIntro");
  }

  function renderFavoriteButton() {
    const question = currentQuestions[currentIndex];
    if (!question) return;
    favoriteQuestionButton.textContent = isFavorite(question.id) ? "❤️ 已收藏" : "❤️ 收藏";
    favoriteQuestionButton.classList.toggle("active", isFavorite(question.id));
  }

  function renderQuestion() {
    const question = currentQuestions[currentIndex];
    if (!question) return;
    const isMock = currentMode === "mock";
    selectedAnswer = isMock ? mockAnswers[currentIndex] : selectedAnswer;

    practiceModeLabel.textContent = currentLabel;
    quizQuestionCounter.textContent = `第 ${currentIndex + 1} / ${currentQuestions.length} 题`;
    quizLessonBadge.textContent = `${formatLessonLabel(question.lessonId)}｜${question.category}`;
    quizQuestionTitle.textContent = question.question;
    quizRelatedSection.textContent = `${question.title}｜${question.relatedSection || "本课重点"}`;
    quizQuestionSource.textContent = question.source || "【小吴强化题】";
    returnLessonButton.href = `course.html?id=${question.relatedLesson || question.lessonId}`;
    returnLessonButton.textContent = `📖 本题对应课程：${formatLessonLabel(question.lessonId)}｜${question.title}｜${question.relatedSection || "本课重点"}`;

    quizAnswerPanel.classList.add("hidden");
    mockExamStatus.classList.toggle("hidden", !isMock);
    mockExamActions.classList.toggle("hidden", !isMock);
    nextQuizQuestionButton.classList.toggle("hidden", isMock);
    previousQuizQuestionButton.disabled = currentIndex === 0;
    mockNextQuestionButton.disabled = currentIndex >= currentQuestions.length - 1;
    mockAnsweredCount.textContent = `已答 ${mockAnswers.filter((answer) => answer !== null && answer !== undefined).length} / ${currentQuestions.length}`;

    quizChoiceList.innerHTML = "";
    question.choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quiz-choice";
      if (isMock && selectedAnswer === index) button.classList.add("selected");
      button.innerHTML = `<span>${String.fromCharCode(65 + index)}</span><strong>${choice}</strong>`;
      button.addEventListener("click", () => answerQuestion(index));
      quizChoiceList.appendChild(button);
    });
    renderFavoriteButton();
    showView("practice");
  }

  function answerQuestion(index) {
    const question = currentQuestions[currentIndex];
    if (!question) return;

    if (currentMode === "mock") {
      mockAnswers[currentIndex] = index;
      selectedAnswer = index;
      renderQuestion();
      return;
    }

    const correct = index === question.answer;
    currentResults.push({ questionId: question.id, correct });
    updateStats(question, correct);
    if (!correct) addMistake(question);

    Array.from(quizChoiceList.children).forEach((button, buttonIndex) => {
      button.disabled = true;
      if (buttonIndex === question.answer) button.classList.add("correct");
      if (buttonIndex === index && !correct) button.classList.add("wrong");
    });
    quizAnswerResult.textContent = correct ? "答对啦 🌸" : "这里掉进陷阱了";
    quizExplanationText.textContent = formatExplanation(question);
    renderSimilarQuestions(question);
    quizAnswerPanel.classList.remove("hidden");
  }

  function startPractice(questions, label, mode = "lesson") {
    if (!questions.length) return;
    stopMockTimer();
    currentQuestions = questions;
    lastResultQuestions = questions;
    currentIndex = 0;
    currentMode = mode;
    currentLabel = label;
    currentResults = [];
    selectedAnswer = null;
    renderQuestion();
  }

  function nextQuestion() {
    if (currentIndex >= currentQuestions.length - 1) return finishPractice();
    currentIndex += 1;
    selectedAnswer = null;
    renderQuestion();
  }

  function finishPractice() {
    const total = currentQuestions.length;
    const correct = currentResults.filter((result) => result.correct).length;
    renderResult({ total, correct, mistakes: total - correct, isMock: false });
  }

  function makeMockQuestions() {
    const target = hasFiveExemption() ? 45 : 50;
    const pool = quizBank.filter((q) => !(hasFiveExemption() && fiveLessons.has(q.lessonId)));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const result = [];
    while (result.length < target) result.push(...shuffled);
    return result.slice(0, target);
  }

  function startMockExam() {
    currentQuestions = makeMockQuestions();
    lastResultQuestions = currentQuestions;
    currentIndex = 0;
    currentMode = "mock";
    currentLabel = "正式模拟考试";
    mockAnswers = Array(currentQuestions.length).fill(null);
    mockEndsAt = Date.now() + 120 * 60 * 1000;
    startMockTimer();
    renderQuestion();
  }

  function startMockTimer() {
    stopMockTimer();
    mockTimerId = setInterval(() => {
      const left = Math.max(0, Math.floor((mockEndsAt - Date.now()) / 1000));
      mockTimeLeft.textContent = `剩余时间 ${formatClock(left)}`;
      if (left <= 0) submitMockExam();
    }, 500);
  }

  function stopMockTimer() {
    if (mockTimerId) clearInterval(mockTimerId);
    mockTimerId = null;
  }

  function submitMockExam() {
    if (currentMode !== "mock") return;
    stopMockTimer();
    const graded = currentQuestions.map((question, index) => ({
      question,
      correct: mockAnswers[index] === question.answer
    }));
    graded.forEach(({ question, correct }) => {
      updateStats(question, correct);
      if (!correct) addMistake(question);
    });
    const correct = graded.filter((item) => item.correct).length;
    const total = graded.length;
    const line = hasFiveExemption() ? passLine.exempt : passLine.full;
    updateData((data) => {
      data.quiz.mockExams = [{
        at: new Date().toISOString(),
        total,
        correct,
        rate: Math.round((correct / total) * 100),
        passed: correct >= line,
        hasFiveQuestionExemption: hasFiveExemption()
      }, ...(data.quiz.mockExams || [])].slice(0, 20);
      data.aiContext = buildAiContext(data);
      return data;
    });
    renderResult({ total, correct, mistakes: total - correct, isMock: true, pass: correct >= line, line, graded });
  }

  function renderResult(result) {
    resultTotal.textContent = result.total;
    resultCorrect.textContent = result.correct;
    resultRate.textContent = `${Math.round((result.correct / result.total) * 100)}%`;
    resultMistakes.textContent = result.mistakes;
    resultPassLine.textContent = result.isMock ? `${result.line} / ${result.total}` : "--";
    resultMessage.textContent = result.isMock
      ? (result.pass ? "🌸 已达到预计合格线。小7，这次很稳。" : "🌸 还差一点点。先从错题本回头看，小吴陪你补回来。")
      : "🌸 做完题以后，真正重要的是把错题看懂。";
    renderMockScoreBreakdown(result);
    showView("result");
  }

  function categoryNameForQuestion(question) {
    if (question.category === "宅建業法") return "宅建業法";
    if (question.category === "権利関係") return "権利関係";
    if (question.category === "五問免除") return "五問免除";
    if (question.category === "税法" || question.category === "価格") return "税・その他";
    return question.category || "その他";
  }

  function renderMockScoreBreakdown(result) {
    mockScoreBreakdown.innerHTML = "";
    mockScoreBreakdown.classList.toggle("hidden", !result.isMock);
    if (!result.isMock) return;
    const groups = {};
    (result.graded || []).forEach(({ question, correct }) => {
      const name = categoryNameForQuestion(question);
      groups[name] = groups[name] || { total: 0, correct: 0 };
      groups[name].total += 1;
      groups[name].correct += correct ? 1 : 0;
    });
    const weakest = Object.entries(groups)
      .filter(([, stat]) => stat.total)
      .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))[0];
    const wrongLesson = (result.graded || []).find((item) => !item.correct)?.question?.lessonId;
    mockScoreBreakdown.innerHTML = `
      <p><strong>总分：</strong>${result.correct} / ${result.total}</p>
      <p><strong>正确率：</strong>${Math.round((result.correct / result.total) * 100)}%</p>
      <p><strong>预计是否合格：</strong>${result.pass ? "达到预计合格线" : "暂未达到预计合格线"}</p>
      ${Object.entries(groups).map(([name, stat]) => `<p><strong>${name}：</strong>${Math.round((stat.correct / stat.total) * 100)}%</p>`).join("")}
      <p><strong>建议：</strong>今天先复习 ${wrongLesson ? `${formatLessonLabel(wrongLesson)}｜${getLessonTitle(wrongLesson)}` : (weakest ? weakest[0] : "错题本")}。</p>
    `;
  }

  function renderSavedList(type) {
    const data = loadData();
    const ids = type === "favorites"
      ? data.quiz.favorites || []
      : (data.quiz.mistakes || []).map((item) => item.id);
    savedListQuestions = ids.map(questionById).filter(Boolean);
    listEyebrow.textContent = type === "favorites" ? "Favorites" : "Mistakes";
    listTitle.textContent = type === "favorites" ? "❤️ 我的收藏" : "⭐ 我的错题";
    listNote.textContent = savedListQuestions.length ? "点进题目重新练，答对以后可以慢慢标记掌握。" : "这里现在是空的。小7今天很稳。";
    savedQuestionList.innerHTML = "";
    savedListQuestions.forEach((question) => {
      const item = document.createElement("article");
      item.className = "saved-question-item";
      item.innerHTML = `
        <strong>${question.title}</strong>
        <span>${formatLessonLabel(question.lessonId)}｜${question.relatedSection}</span>
        <p>${question.question}</p>
        <div class="quiz-result-actions">
          <button class="secondary-button" type="button" data-practice>进入练习</button>
          ${type === "favorites" ? "<button class=\"secondary-button\" type=\"button\" data-unfavorite>取消收藏</button>" : "<button class=\"secondary-button\" type=\"button\" data-mastered>已掌握</button>"}
        </div>
      `;
      item.querySelector("[data-practice]").addEventListener("click", () => startPractice([question], `${formatLessonLabel(question.lessonId)} 复习`, "saved"));
      item.querySelector("[data-unfavorite]")?.addEventListener("click", () => {
        toggleFavorite(question.id);
        renderSavedList("favorites");
      });
      item.querySelector("[data-mastered]")?.addEventListener("click", () => markMastered(question.id));
      savedQuestionList.appendChild(item);
    });
    practiceSavedListButton.disabled = !savedListQuestions.length;
    showView("list");
  }

  function rateForLessons(ids, stats) {
    const totals = ids.reduce((acc, lessonId) => {
      const stat = stats.lessons?.[lessonId];
      if (!stat) return acc;
      acc.answered += stat.answered || 0;
      acc.correct += stat.correct || 0;
      return acc;
    }, { answered: 0, correct: 0 });
    return totals.answered ? `${Math.round((totals.correct / totals.answered) * 100)}%` : "0%";
  }

  function renderStats() {
    const data = loadData();
    const stats = data.quiz.stats;
    const totalRate = stats.totalAnswered ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;
    const aiContext = buildAiContext(data);
    data.aiContext = aiContext;
    saveData(data);
    $("#statsTodayStudy").textContent = formatTime(data.studyTime.todaySeconds);
    $("#statsTotalStudy").textContent = formatTime(data.studyTime.totalSeconds);
    $("#statsStreak").textContent = `${data.studyTime.todaySeconds ? 1 : 0}天`;
    $("#statsStudyDays").textContent = `${(data.studyTime.days || []).length || (data.studyTime.totalSeconds ? 1 : 0)}天`;
    $("#statsCompletedCourses").textContent = (data.courses.completed || []).length;
    $("#statsTodayAnswered").textContent = stats.todayAnswered || 0;
    $("#statsTotalAnswered").textContent = stats.totalAnswered || 0;
    $("#statsTotalRate").textContent = `${totalRate}%`;
    $("#statsMistakes").textContent = (data.quiz.mistakes || []).length;
    $("#statsFavorites").textContent = (data.quiz.favorites || []).length;
    $("#statsMockCount").textContent = `${(data.quiz.mockExams || []).length}次`;
    $("#statsWeakest").textContent = aiContext.weakestLesson ? `${formatLessonLabel(aiContext.weakestLesson)}｜${getLessonTitle(aiContext.weakestLesson)}` : "暂无";
    $("#statsRecommendation").textContent = aiContext.recommendation;
    $("#statsTaxRate").textContent = rateForLessons(Array.from(taxLessons), stats);
    $("#statsFiveRate").textContent = hasFiveExemption() ? "已按设置隐藏" : rateForLessons(Array.from(fiveLessons), stats);
    $("#statsRecentAt").textContent = stats.recentAt ? new Date(stats.recentAt).toLocaleString("zh-CN") : "暂无";
    showView("stats");
  }

  function renderSettings() {
    const value = hasFiveExemption() ? "yes" : "no";
    $$("input[name='fiveExemption']").forEach((input) => {
      input.checked = input.value === value;
    });
    showView("settings");
  }

  function saveSettings() {
    const selected = $("input[name='fiveExemption']:checked")?.value || "no";
    updateData((data) => {
      data.settings.hasFiveQuestionExemption = selected === "yes";
      data.aiContext = buildAiContext(data);
      return data;
    });
    renderDirectory();
  }

  function handleDirectoryAction(button) {
    const action = button.dataset.action;
    if (action === "lessons") renderLessons();
    if (action === "categories") renderCategories();
    if (action === "topics") renderTopics();
    if (action === "search") renderSearch();
    if (action === "past") renderPastYears();
    if (action === "mock") renderMockIntro();
    if (action === "mistakes") renderSavedList("mistakes");
    if (action === "favorites") renderSavedList("favorites");
    if (action === "stats") renderStats();
    if (action === "settings") renderSettings();
    if (action === "special") {
      const ids = button.dataset.special === "tax" ? Array.from(taxLessons) : Array.from(fiveLessons);
      startPractice(questionsForLessons(ids), button.dataset.special === "tax" ? "税法专项" : "五問免除专项", "special");
    }
  }

  function bootFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const lessonId = params.get("lesson");
    if (lessonId) {
      const questions = quizBank.filter((q) => q.lessonId === lessonId);
      if (questions.length) {
        startPractice(questions, `${formatLessonLabel(lessonId)} 练习`, "lesson");
        return;
      }
    }
    renderDirectory();
  }

  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (actionButton) handleDirectoryAction(actionButton);
  });

  $("#backFromLessonsButton")?.addEventListener("click", renderDirectory);
  $("#backFromCategoriesButton")?.addEventListener("click", renderDirectory);
  $("#backFromTopicsButton")?.addEventListener("click", renderDirectory);
  $("#backFromSearchButton")?.addEventListener("click", renderDirectory);
  $("#backFromPastButton")?.addEventListener("click", renderDirectory);
  $("#backFromMockIntroButton")?.addEventListener("click", renderDirectory);
  $("#backToQuizDirectory")?.addEventListener("click", renderDirectory);
  $("#returnQuizHomeButton")?.addEventListener("click", renderDirectory);
  $("#backFromListButton")?.addEventListener("click", renderDirectory);
  $("#backFromStatsButton")?.addEventListener("click", renderDirectory);
  $("#backFromSettingsButton")?.addEventListener("click", renderDirectory);
  $("#saveSettingsButton")?.addEventListener("click", saveSettings);
  $("#startMockExamButton")?.addEventListener("click", startMockExam);
  nextQuizQuestionButton?.addEventListener("click", nextQuestion);
  previousQuizQuestionButton?.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      renderQuestion();
    }
  });
  mockNextQuestionButton?.addEventListener("click", () => {
    if (currentIndex < currentQuestions.length - 1) {
      currentIndex += 1;
      renderQuestion();
    }
  });
  submitMockButton?.addEventListener("click", submitMockExam);
  favoriteQuestionButton?.addEventListener("click", () => {
    const question = currentQuestions[currentIndex];
    if (question) toggleFavorite(question.id);
  });
  $("#retryQuizButton")?.addEventListener("click", () => {
    if (currentMode === "mock") startMockExam();
    else startPractice(lastResultQuestions, currentLabel, currentMode);
  });
  $("#viewMistakesButton")?.addEventListener("click", () => renderSavedList("mistakes"));
  practiceSavedListButton?.addEventListener("click", () => startPractice(savedListQuestions, "收藏/错题复习", "saved"));
  quizSearchInput?.addEventListener("input", () => renderSearchResults(quizSearchInput.value));

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") tickStudyTime(true);
    if (document.visibilityState === "visible") lastTickAt = Date.now();
  });
  window.addEventListener("beforeunload", () => tickStudyTime(true));

  startStudyTicker();
  bootFromUrl();
})();
