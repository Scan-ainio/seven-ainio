window.xiaoWuCourseEngine = (() => {
  const keys = {
    progress: "takken_course_progress_v1",
    answerHistory: "takken_answer_history_v1",
    selectedLesson: "takken_selected_lesson_v1",
    treeGrowth: "takken_tree_growth_v1",
    treeHistory: "takken_tree_history_v1"
  };

  function todayKey(date = new Date()) {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  }

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getIndex() {
    return window.xiaoWuCourseIndex || [];
  }

  function getLesson(lessonId) {
    return (window.xiaoWuLessons || {})[lessonId] || null;
  }

  function notifyCourseReady() {
    window.dispatchEvent(new CustomEvent("xiaowu-course-ready"));
  }

  function loadLessonFiles() {
    const files = getIndex()
      .filter((entry) => entry.lessonFile && !getLesson(entry.lessonId))
      .map((entry) => entry.lessonFile);

    if (!files.length) {
      setTimeout(notifyCourseReady, 0);
      return;
    }

    let settled = 0;
    const finish = () => {
      settled += 1;
      if (settled >= files.length) notifyCourseReady();
    };

    files.forEach((file) => {
      const script = document.createElement("script");
      script.src = `${file}?v=20260709-quiz-v2`;
      script.onload = finish;
      script.onerror = finish;
      document.head.appendChild(script);
    });
  }

  function getProgress() {
    return readJson(keys.progress, { lessons: {} });
  }

  function saveProgress(progress) {
    writeJson(keys.progress, progress);
  }

  function getLessonAnswers(lesson, answers = readJson(keys.answerHistory, [])) {
    if (!lesson) return [];
    const ids = new Set([...(lesson.practiceQuestionIds || []), ...(lesson.officialQuestionIds || [])]);
    return answers.filter((answer) => ids.has(answer.questionId));
  }

  function getLessonAccuracy(lesson, answers) {
    const lessonAnswers = getLessonAnswers(lesson, answers);
    if (!lessonAnswers.length) return null;
    const correct = lessonAnswers.filter((answer) => answer.isCorrect).length;
    return Math.round((correct / lessonAnswers.length) * 100);
  }

  function getLessonProgress(lessonId, answers) {
    const progress = getProgress();
    const saved = progress.lessons?.[lessonId] || {};
    const lesson = getLesson(lessonId);
    const accuracy = getLessonAccuracy(lesson, answers);
    const isCompleted = Boolean(saved.completedAt);
    const percent = isCompleted ? 100 : saved.startedAt ? 35 : 0;
    const masteryState = isCompleted && (accuracy === null || accuracy >= 80) ? "mastered" : isCompleted || saved.startedAt ? "learning" : "new";

    return {
      ...saved,
      lessonId,
      percent,
      accuracy,
      isCompleted,
      masteryState
    };
  }

  function getCourseCards(answers) {
    return getIndex().map((entry) => {
      const lesson = getLesson(entry.lessonId);
      const progress = getLessonProgress(entry.lessonId, answers);
      return {
        ...entry,
        lesson,
        progress,
        status: progress.isCompleted ? "completed" : entry.status
      };
    });
  }

  function getActiveLessonId(answers) {
    const selectedLessonId = localStorage.getItem(keys.selectedLesson);
    if (selectedLessonId && getLesson(selectedLessonId)) return selectedLessonId;

    const cards = getCourseCards(answers);
    const firstOpen = cards.find((card) => card.status !== "locked" && !card.progress.isCompleted);
    return firstOpen?.lessonId || cards[0]?.lessonId || "";
  }

  function selectLesson(lessonId) {
    localStorage.setItem(keys.selectedLesson, lessonId);
    notifyCourseReady();
  }

  function startLesson(lessonId) {
    const progress = getProgress();
    const existing = progress.lessons?.[lessonId] || {};
    progress.lessons = {
      ...(progress.lessons || {}),
      [lessonId]: {
        ...existing,
        startedAt: existing.startedAt || new Date().toISOString()
      }
    };
    saveProgress(progress);
    return getLessonProgress(lessonId);
  }

  function addTreeReward(lesson) {
    const reward = lesson?.completionReward;
    if (!reward) return;

    const tree = readJson(keys.treeGrowth, { growthValue: 0, stageName: "发芽" });
    const history = readJson(keys.treeHistory, []);
    const growthValue = Math.max(0, Number(tree.growthValue) || 0) + (Number(reward.growthValue) || 0);
    const entry = {
      date: todayKey(),
      icon: reward.treeIcon || "🌿",
      text: reward.message || `完成课程「${lesson.title}」，成长树继续长大。`
    };

    writeJson(keys.treeGrowth, {
      ...tree,
      growthValue,
      todayGrowth: (Number(tree.todayGrowth) || 0) + (Number(reward.growthValue) || 0),
      lastUpdatedDate: todayKey()
    });
    writeJson(keys.treeHistory, [entry, ...history].slice(0, 20));
  }

  function completeLesson(lessonId) {
    const lesson = getLesson(lessonId);
    const progress = getProgress();
    const existing = progress.lessons?.[lessonId] || {};
    const wasCompleted = Boolean(existing.completedAt);
    const completedAt = existing.completedAt || new Date().toISOString();

    progress.lessons = {
      ...(progress.lessons || {}),
      [lessonId]: {
        ...existing,
        startedAt: existing.startedAt || completedAt,
        completedAt,
        rewardClaimed: true
      }
    };
    saveProgress(progress);

    if (!wasCompleted) addTreeReward(lesson);
    return getLessonProgress(lessonId);
  }

  function getTopicStatus(topic, answers) {
    const course = getIndex().find((entry) => entry.title === topic);
    if (!course) return null;

    const progress = getLessonProgress(course.lessonId, answers);
    if (progress.masteryState === "mastered") return { state: "mastered", icon: "🟩" };
    if (progress.masteryState === "learning") return { state: "learning", icon: "🟨" };
    return { state: "new", icon: "⬜" };
  }

  function buildDashboard(answers) {
    const activeLessonId = getActiveLessonId(answers);
    const activeLesson = getLesson(activeLessonId);
    const activeProgress = getLessonProgress(activeLessonId, answers);

    return {
      activeLesson,
      activeProgress,
      courseCards: getCourseCards(answers)
    };
  }

  const api = {
    keys,
    getIndex,
    getLesson,
    getProgress,
    getLessonProgress,
    getLessonAccuracy,
    getTopicStatus,
    buildDashboard,
    selectLesson,
    startLesson,
    completeLesson
  };

  loadLessonFiles();
  return api;
})();
