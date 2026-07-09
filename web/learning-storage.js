(function () {
  const legacyKeys = {
    todayStudy: "takken_today_study_seconds_v1",
    totalStudy: "takken_total_study_seconds_v1",
    studyDate: "takken_today_study_date_v1",
    quizStats: "xiaowuQuizStats",
    quizMistakes: "xiaowuQuizMistakes",
    quizFavorites: "xiaowuQuizFavorites"
  };

  const learningKey = "xiaowuLearningDataV1";

  function todayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

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

  function readNumber(key) {
    return Number(localStorage.getItem(key) || 0);
  }

  function writeNumber(key, value) {
    localStorage.setItem(key, String(Math.max(0, Math.floor(value || 0))));
  }

  function defaultData() {
    const quizStats = readJson(legacyKeys.quizStats, {});
    return {
      version: 3,
      userId: "xiaoqi-default",
      settings: {
        hasFiveQuestionExemption: false
      },
      studyTime: {
        date: localStorage.getItem(legacyKeys.studyDate) || todayKey(),
        todaySeconds: readNumber(legacyKeys.todayStudy),
        totalSeconds: readNumber(legacyKeys.totalStudy)
      },
      quiz: {
        stats: {
          totalAnswered: Number(quizStats.totalAnswered) || 0,
          totalCorrect: Number(quizStats.totalCorrect) || 0,
          todayKey: quizStats.todayKey || todayKey(),
          todayAnswered: Number(quizStats.todayAnswered) || 0,
          lessons: quizStats.lessons || {},
          recentAt: quizStats.recentAt || ""
        },
        mistakes: readJson(legacyKeys.quizMistakes, []),
        favorites: readJson(legacyKeys.quizFavorites, []),
        mockExams: []
      },
      courses: {
        favorites: [],
        completed: []
      },
      aiContext: {
        updatedAt: "",
        weakestLesson: "",
        recommendation: ""
      }
    };
  }

  function mergeData(saved) {
    return {
      ...defaultData(),
      ...(saved || {}),
      settings: { ...defaultData().settings, ...(saved?.settings || {}) },
      studyTime: { ...defaultData().studyTime, ...(saved?.studyTime || {}) },
      quiz: {
        ...defaultData().quiz,
        ...(saved?.quiz || {}),
        stats: { ...defaultData().quiz.stats, ...(saved?.quiz?.stats || {}) },
        mistakes: saved?.quiz?.mistakes || defaultData().quiz.mistakes,
        favorites: saved?.quiz?.favorites || defaultData().quiz.favorites,
        mockExams: saved?.quiz?.mockExams || []
      },
      courses: { ...defaultData().courses, ...(saved?.courses || {}) },
      aiContext: { ...defaultData().aiContext, ...(saved?.aiContext || {}) }
    };
  }

  function syncLegacy(data) {
    writeNumber(legacyKeys.todayStudy, data.studyTime.todaySeconds);
    writeNumber(legacyKeys.totalStudy, data.studyTime.totalSeconds);
    localStorage.setItem(legacyKeys.studyDate, data.studyTime.date);
    writeJson(legacyKeys.quizStats, data.quiz.stats);
    writeJson(legacyKeys.quizMistakes, data.quiz.mistakes);
    writeJson(legacyKeys.quizFavorites, data.quiz.favorites);
  }

  function ensureToday(data) {
    const today = todayKey();
    if (data.studyTime.date !== today) {
      data.studyTime.date = today;
      data.studyTime.todaySeconds = 0;
    }
    if (data.quiz.stats.todayKey !== today) {
      data.quiz.stats.todayKey = today;
      data.quiz.stats.todayAnswered = 0;
    }
    return data;
  }

  function loadLearningData() {
    const saved = readJson(learningKey, null);
    const data = ensureToday(mergeData(saved));
    saveLearningData(data);
    return data;
  }

  function saveLearningData(data) {
    const normalized = ensureToday(mergeData(data));
    normalized.aiContext.updatedAt = new Date().toISOString();
    writeJson(learningKey, normalized);
    syncLegacy(normalized);
    return normalized;
  }

  function updateLearningData(mutator) {
    const data = loadLearningData();
    const result = mutator(data) || data;
    return saveLearningData(result);
  }

  function createStorageProvider() {
    return {
      name: "localStorage",
      loadLearningData,
      saveLearningData,
      updateLearningData
    };
  }

  window.XiaoWuLearningStorage = {
    legacyKeys,
    todayKey,
    loadLearningData,
    saveLearningData,
    updateLearningData,
    provider: createStorageProvider(),
    providerMode: "localStorage",
    redisReadyShape: {
      loadEndpoint: "/api/xiaowu-learning",
      saveEndpoint: "/api/xiaowu-learning",
      userId: "xiaoqi-default"
    }
  };
})();
