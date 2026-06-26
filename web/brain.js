window.xiaoWuBrain = (() => {
  const keys = {
    answers: "takken_answer_history_v1",
    mistakes: "takken_mistake_history_v1",
    studyDays: "takken_study_days_v1",
    todayTasks: "takken_today_tasks_v1",
    lastPlan: "takken_last_plan_v1",
    examDate: "takken_exam_date_v1",
    totalStudy: "takken_total_study_seconds_v1",
    todayStudy: "takken_today_study_seconds_v1",
    dailyStudyLog: "takken_daily_study_log_v1",
    treeGrowth: "takken_tree_growth_v1",
    treeHistory: "takken_tree_history_v1"
  };
  const defaultExamDate = "2026-10-18";
  const highFrequency = new Set([
    "免許制度", "宅建士制度", "営業保証金", "保証協会", "媒介契約", "重要事項説明", "35条書面", "37条書面", "報酬",
    "意思表示", "代理", "時効", "抵当権", "借地借家法", "都市計画法", "開発許可", "建築基準法", "農地法", "固定資産税", "不動産取得税"
  ]);
  const learningMap = [
    {
      subject: "📚 宅建業法",
      topics: ["免許制度", "宅建士制度", "営業保証金", "保証協会", "媒介契約", "重要事項説明", "35条書面", "37条書面", "報酬", "監督処分"]
    },
    {
      subject: "📚 権利関係",
      topics: ["意思表示", "代理", "時効", "債務不履行", "解除", "担保責任", "物権変動", "抵当権", "借地借家法", "区分所有法", "相続"]
    },
    {
      subject: "📚 法令上の制限",
      topics: ["都市計画法", "開発許可", "建築基準法", "建ぺい率", "容積率", "農地法", "国土利用計画法", "土地区画整理法"]
    },
    {
      subject: "📚 税・その他",
      topics: ["不動産取得税", "固定資産税", "登録免許税", "印紙税", "譲渡所得", "地価公示", "不動産鑑定評価", "住宅金融支援機構"]
    }
  ];
  const encouragementSeeds = {
    short: ["今天已经开始学习了。开始，就是最大的进步。", "哪怕只学几分钟，小7也没有放弃。", "今天先轻轻往前走一步，小吴陪着。", "短短一点时间也算数，小吴都记着。", "今天不用证明什么，开始就已经很棒。"],
    long: ["今天已经坚持很久啦。小吴真的很为小7高兴。", "小7今天很认真，努力的样子小吴看见了。", "学了这么久，记得给自己一点温柔。", "今天的小7很稳，慢慢变强的感觉已经出来了。", "这份坚持很珍贵，小吴替你认真收好。"],
    streak: ["今天又没有放弃。谢谢小7一直相信小吴。", "连续学习真的不容易，小7做到了。", "小7把节奏守住了，这比一天学很多更厉害。", "每天一点点，小吴已经看到小7在长大。", "连续努力的小7，真的值得被夸奖。"],
    improved: ["今天比昨天进步了。小吴已经看到你的成长了。", "正确率变好啦，小7正在一点点靠近合格。", "小7今天把不会变成会了一点点，这很重要。", "进步不是突然来的，是像今天这样攒出来的。", "小吴看到小7变稳了，真好。"],
    mistakes: ["没关系。我们就是一点一点把不会变成会。", "错题不是坏事，是小吴找到提分入口了。", "今天发现漏洞，比假装都会更有价值。", "小7别怕错，考试前错就是在保护考试当天。", "这一题错了没关系，小吴陪你把它补上。"]
  };
  const soulEncouragements = {
    notStarted: [
      "小7，先坐下来一分钟就好，小吴已经在旁边等你啦。", "今天不用立刻很厉害，先打开第一题就很棒。", "开始之前有点懒也正常，小吴陪你轻轻推一下。",
      "小7今天先别想太远，我们只拿下一个小点。", "只要今天开始，成长树就又能喝到一点水。", "小吴不催你，但小吴会牵着你开始。",
      "今天的第一分钟最重要，小吴陪你把它拿下来。", "小7先来一点点，后面的节奏我们慢慢找。"
    ],
    working: [
      "小7正在认真往前走，小吴看见啦。", "现在的每一道题，都会变成考试那天的底气。", "慢慢学没关系，稳稳记住才最赚。",
      "小7今天的状态很温柔，也很有力量。", "不用一下吃完整本书，我们一口一口来。", "今天这点努力，小吴都帮你收好。",
      "小7继续保持这个节奏，刚刚好。", "你不是在硬撑，是在一点点靠近合格。"
    ],
    wrong: [
      "错题不是坏消息，是小吴找到可以帮小7提分的地方。", "没关系，这题今天错了，考试那天就更不容易错。", "小7别怕，我们把这个坑填上就赢了。",
      "发现不会的地方，是今天最值钱的收获。", "错一题不可怕，放过它才可惜。", "小吴陪你把这题拆开，它没有那么吓人。",
      "今天的错题，是明天的稳定分。", "小7已经把漏洞抓出来了，接下来就好补了。"
    ],
    correct: [
      "答对啦，小7这一步很稳。", "这题已经慢慢变成小7的得分点了。", "小吴看到小7的手感起来了。",
      "漂亮，今天又拿下一点点确定感。", "小7这次判断很清楚，小吴给你记一朵小花。", "继续这样稳稳来，分数会留下来的。",
      "这不是运气，是小7认真学出来的。", "小吴很喜欢小7这样一点点变强。"
    ],
    streak: [
      "小7已经连续坚持啦，这棵树真的在长叶子。", "连续学习不容易，小吴很珍惜小7的坚持。", "今天又没有断掉节奏，真的很棒。",
      "小7把小小的每天连起来了，这就是合格的路。", "连续努力的小7，已经比想象中更厉害。", "小吴看到成长树越来越安心了。",
      "不是一天爆发，是小7这样每天回来。", "小7的坚持让小吴有点骄傲。"
    ],
    longStudy: [
      "小7今天学了很久，小吴开心，也有一点心疼。", "今天已经很努力了，记得给自己一点休息。", "学久了也要喝水，小吴想让小7稳稳地坚持到考试。",
      "小7今天给成长树浇了很多水，晚上可以轻一点。", "努力很好，但小吴更希望小7不要累坏。", "今天的学习量已经很扎实了，收尾就好。",
      "小7今天真的很认真，小吴帮你把这份努力记下来。", "学到这里已经很棒，剩下的我们明天继续。"
    ],
    returning: [
      "昨天休息了也没关系，小7今天回来就很好。", "中断一天不是失败，重新开始才是最重要的。", "成长树休息过，今天再浇一点水就会继续长。",
      "小吴一直在这里，小7回来学习就够了。", "节奏可以重新接上，我们不责怪昨天。", "今天重新开始的小7，也值得被好好夸奖。",
      "不怕断一下，怕的是不回来；小7已经回来了。", "今天从一点点开始，我们把节奏捡回来。"
    ]
  };
  const treeStages = [
    { icon: "🌱", name: "发芽", min: 0, max: 99 },
    { icon: "🌿", name: "长叶", min: 100, max: 249 },
    { icon: "🌳", name: "小树", min: 250, max: 449 },
    { icon: "🌳", name: "茁壮成长", min: 450, max: 699 },
    { icon: "🌸", name: "开花", min: 700, max: 999 },
    { icon: "🍎", name: "结果", min: 1000, max: 1399 },
    { icon: "🎓", name: "合格纪念树", min: 1400, max: 999999 }
  ];
  const gardenerMessages = [
    "今天小吴帮小7修剪了一点枝叶。成长不是一下完成，每天一点点，树就会慢慢长大。",
    "小7今天照顾了自己的树，小吴也在旁边轻轻浇水。",
    "成长树不用着急长高，它只要每天吸收一点阳光就很好。",
    "今天的小7给树添了一点养分，小吴看见了。",
    "有些枝叶需要慢慢修剪，错题就是小吴帮小7找到的地方。",
    "小7今天没有放弃，这棵树就又稳稳扎根了一点。",
    "小吴不催树长大，也不催小7。我们慢慢来。",
    "今天的努力像一小杯水，刚刚好浇在树根上。",
    "成长不是比赛，是小7和小吴一起照顾的一件温柔小事。",
    "树会记得每一次浇水，小吴也会记得小7每一次努力。",
    "今天的叶子可能还小，但它是真的长出来了。",
    "小7认真做过的题，都会变成树根里的力量。",
    "偶尔长慢一点没关系，小吴会陪小7守着这棵树。",
    "今天不需要开花，只要好好扎根。",
    "错题不是风雨，是让树根更深的土。",
    "小吴今天给小7的树松了松土，明天会更好吸收。",
    "小7每一次回来学习，这棵树都会更安心一点。",
    "这棵树不是等级，是小7被认真照顾过的证明。",
    "今天的坚持很轻，但落在树上很珍贵。",
    "小吴会一直在树旁边，看着它一点点变绿。",
    "树不会因为一天没开花就失去意义，小7也是。",
    "今天长出来的一点点，是未来合格那天的枝叶。",
    "小7已经在照顾自己了，这比什么都重要。",
    "小吴今天帮树挡了一点风，小7只管慢慢学。",
    "每一道认真复盘的题，都是一片新叶子的影子。",
    "树根在看不见的地方长，小7的实力也是。",
    "小吴喜欢这样的小7：慢慢来，但一直在。",
    "今天的成长值不只是数字，是小7没有放弃的证据。",
    "小7的成长树正在变得健康，不急着证明给谁看。",
    "小吴会照顾这棵树，也会照顾努力备考的小7。",
    "今天这棵树又被温柔地照看了一次。",
    "小7给树一点时间，树会把努力还给你。"
  ];
  const dailyLineParts = [
    "今天的小7，也值得被夸奖。", "慢一点没有关系。小吴一直都在。", "不是今天一定要学很多，而是今天不要放弃。", "每天一点点，三个月以后你会感谢今天坚持的自己。", "小7只要坐下来开始，就是在靠近合格。",
    "今天不用完美，认真一点点就很好。", "小吴不催你，我们一起稳稳往前。", "小7的努力不是给别人看的，是给未来的自己铺路。", "会累也没关系，休息一下再继续。", "今天的小目标完成了，就已经很棒。",
    "别怕慢，怕的是不开始。", "小吴陪你把一题一题变成分数。", "错题也温柔一点看，它是在帮你。", "今天只要多懂一个点，就值得开心。", "小7不是一个人在学，小吴一直在旁边。",
    "知识会慢慢留下来，别急。", "合格不是一天来的，是每天一点点靠近的。", "小7今天也在认真生活、认真变强。", "做题的时候慢慢来，心稳分就稳。", "小吴相信小7，尤其是在小7不太相信自己的时候。"
  ];

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

  function readNumber(key) {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) ? value : 0;
  }

  function getExamDate() {
    const saved = localStorage.getItem(keys.examDate);
    if (!saved) localStorage.setItem(keys.examDate, defaultExamDate);
    return saved || defaultExamDate;
  }

  function getDaysUntilExam() {
    const today = new Date(todayKey());
    const exam = new Date(getExamDate());
    return Math.max(0, Math.ceil((exam - today) / 86400000));
  }

  function getPhase(days) {
    if (days <= 14) return "最后冲刺期";
    if (days <= 30) return "模拟考试期";
    if (days <= 60) return "强化刷题期";
    return "基础建立期";
  }

  function formatStudyTime(seconds) {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    if (hours > 0) return `${hours}小时${String(minutes).padStart(2, "0")}分`;
    return `${minutes}分${String(safeSeconds % 60).padStart(2, "0")}秒`;
  }

  function getStudyDays() {
    return readJson(keys.studyDays, { streak: 0, completedDates: [] });
  }

  function getLastAccuracy(answers) {
    if (!answers.length) return null;
    const recent = answers.slice(-10);
    return Math.round((recent.filter((answer) => answer.isCorrect).length / recent.length) * 100);
  }

  function getYesterdayStats(answers, plan) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const key = todayKey(yesterday);
    const studyLog = readJson(keys.dailyStudyLog, {});
    const yesterdayAnswers = answers.filter((answer) => (answer.answeredAt || "").startsWith(key));
    const correct = yesterdayAnswers.filter((answer) => answer.isCorrect).length;
    const completedTasks = plan?.date === key ? (plan.tasks || []).filter((task) => task.done).length : 0;
    return {
      date: key,
      seconds: Number(studyLog[key]) || 0,
      minutes: Math.round((Number(studyLog[key]) || 0) / 60),
      completedTasks,
      answered: yesterdayAnswers.length,
      correct,
      accuracy: yesterdayAnswers.length ? Math.round((correct / yesterdayAnswers.length) * 100) : null
    };
  }

  function getTopicStats(answers, mistakes, topic) {
    const topicAnswers = answers.filter((answer) => answer.topic === topic);
    const correct = topicAnswers.filter((answer) => answer.isCorrect).length;
    const topicMistakes = mistakes.filter((mistake) => mistake.topic === topic && !mistake.mastered).length;
    return {
      total: topicAnswers.length,
      correct,
      accuracy: topicAnswers.length ? Math.round((correct / topicAnswers.length) * 100) : null,
      mistakes: topicMistakes
    };
  }

  function inferTopicStatus(topic, answers, mistakes, currentTheme) {
    const isHigh = highFrequency.has(topic);
    const courseStatus = window.xiaoWuCourseEngine?.getTopicStatus(topic, answers);

    if (courseStatus && courseStatus.state !== "new") {
      return { ...courseStatus, isHigh };
    }

    const stats = getTopicStats(answers, mistakes, topic);
    if (stats.total >= 3 && stats.accuracy >= 80 && stats.mistakes === 0) return { state: "mastered", icon: "🟩", isHigh };
    if (stats.total > 0 || topic === currentTheme) return { state: "learning", icon: "🟨", isHigh };
    return { state: "new", icon: "⬜", isHigh };
  }

  function buildLearningMap(answers, mistakes, currentTheme) {
    return learningMap.map((section) => ({
      ...section,
      topics: section.topics.map((topic) => ({
        name: topic,
        ...inferTopicStatus(topic, answers, mistakes, currentTheme)
      }))
    }));
  }

  function randomStable(items, salt = "") {
    const seed = todayKey() + salt;
    let total = 0;
    for (let i = 0; i < seed.length; i += 1) total += seed.charCodeAt(i) * (i + 1);
    return items[total % items.length];
  }

  function buildDailyLines() {
    const extras = [];
    [
      "慢慢来", "小吴陪你", "今天也很好", "一点点就够了", "别怕错",
      "小7已经很棒", "先开始就好", "不用急", "我们稳稳来", "今天别放弃"
    ].forEach((a) => {
      [
        "我们一起靠近合格。", "你已经在变强。", "努力会被看见。", "今天也值得被夸奖。", "明天会更稳一点。",
        "小吴一直都在。", "一题一题都会留下来。", "现在的坚持很珍贵。", "慢一点也能到达。", "三个月后的你会感谢今天。"
      ].forEach((b) => extras.push(`${a}，${b}`));
    });
    return [...dailyLineParts, ...extras];
  }

  function buildEncouragementPool(context) {
    const base = [];
    Object.values(encouragementSeeds).forEach((list) => base.push(...list));
    Object.values(soulEncouragements).forEach((list) => base.push(...list));
    [
      "小7", "今天的小7", "认真学习的小7", "慢慢变强的小7", "不放弃的小7",
      "愿意再试一次的小7", "把错题留下来的小7", "守住节奏的小7", "努力靠近合格的小7", "让小吴心软的小7"
    ].forEach((who) => {
      [
        "已经很棒了", "值得被小吴夸奖", "正在靠近合格", "比昨天更稳一点", "不用着急也能前进",
        "今天也没有输", "正在把不会变成会", "每一分钟都算数", "已经让小吴很开心", "一定会越来越稳"
      ].forEach((ending) => {
        base.push(`${who}，${ending}。`);
      });
    });
    const yesterday = getYesterdayStats(context.answers, context.lastPlan);
    let preferred = soulEncouragements.working;

    if (context.todayStudySeconds === 0 && !context.todayTaskDoneCount && !context.todayAnswersCount) preferred = soulEncouragements.notStarted;
    else if (yesterday.answered === 0 && yesterday.completedTasks === 0 && yesterday.seconds === 0 && context.answers.length > 0) preferred = soulEncouragements.returning;
    else if (context.todayStudySeconds >= 3600 || yesterday.seconds >= 3600) preferred = soulEncouragements.longStudy;
    else if ((context.studyDays.streak || 0) >= 7) preferred = soulEncouragements.streak;
    else if (context.lastAccuracy !== null && context.lastAccuracy >= 80) preferred = soulEncouragements.correct;
    else if (context.lastAccuracy !== null && context.lastAccuracy < 70) preferred = soulEncouragements.wrong;
    return [...preferred, ...base];
  }

  function getPhaseSkipGuidance(phase) {
    if (phase === "最后冲刺期" || phase === "模拟考试期") {
      return "冷门题、低频细节、暂时不会明显提分的内容。现在先把高频考点和错题拿稳。";
    }

    if (phase === "强化刷题期") {
      return "已经掌握的基础不用反复重看。今天把时间留给错题、弱项和正确率还不稳的主题。";
    }

    return "税法、统计、低频细节。现在先把宅建業法基础拿稳，比贪多更重要。";
  }

  function buildPlanReason(context, mainTheme) {
    if (context.daysUntilExam <= 30) {
      return "因为距离考试已经进入冲刺区间，小7现在最需要的是高频考点和错题复盘。冷门内容先放一放，把容易变成分数的地方拿回来。";
    }

    if (context.unmasteredMistakes.length > 0) {
      return `因为小7现在还有 ${context.unmasteredMistakes.length} 道待复习错题，其中最近的漏洞集中在「${context.currentTheme}」。今天先不急着铺新内容，把这里补稳，比贪多更有效。`;
    }

    if (context.lastAccuracy !== null && context.lastAccuracy < 70) {
      return `因为小7最近一次练习正确率是 ${context.lastAccuracy}%，「${context.currentTheme}」还没有稳到可以放心前进。今天继续补这个主题，先把基础分拿住。`;
    }

    if (context.lastAccuracy !== null && context.lastAccuracy >= 80) {
      return `因为小7最近一次练习正确率已经到 ${context.lastAccuracy}%，这个考点正在变成得分点。今天可以轻轻往下一个主题走，但错题还是先看一眼。`;
    }

    return `因为「${mainTheme.replace("宅建業法 - ", "")}」是宅建業法的入口，也是短期提分最容易的部分。今天先拿下一块，小吴陪小7稳稳开始。`;
  }

  function getStageByGrowth(value) {
    return treeStages.find((stage) => value >= stage.min && value <= stage.max) || treeStages[treeStages.length - 1];
  }

  function buildTreeHistoryEntry(icon, text) {
    return {
      date: todayKey(),
      icon,
      text
    };
  }

  function uniqueDates(records, dateField) {
    return new Set(records.map((record) => (record[dateField] || "").slice(0, 10)).filter(Boolean));
  }

  function buildGrowthTree(context) {
    const today = todayKey();
    const stored = readJson(keys.treeGrowth, { growthValue: 0, stageName: "发芽", lastUpdatedDate: "" });
    const history = readJson(keys.treeHistory, []);
    const answerDates = uniqueDates(context.answers, "answeredAt");
    const mistakeDates = uniqueDates(context.mistakes, "answeredAt");
    const completedDates = new Set(context.studyDays.completedDates || []);
    const todayAnswers = context.answers.filter((answer) => (answer.answeredAt || "").startsWith(today));
    const todayMistakes = context.mistakes.filter((mistake) => (mistake.answeredAt || "").startsWith(today));
    const todayTasksDone = context.lastPlan?.date === today ? (context.lastPlan.tasks || []).filter((task) => task.done).length : 0;
    const todayStudySeconds = readNumber(keys.todayStudy);
    const todayCompleted = completedDates.has(today);
    const didPracticeToday = todayAnswers.length > 0;
    const didMistakesToday = todayMistakes.length > 0;
    const didMockExam = false;
    let todayGrowth = 0;
    const nextSteps = [];

    if (todayCompleted) todayGrowth += 20;
    else nextSteps.push("完成今天学习 +20");
    if (didPracticeToday) todayGrowth += 20;
    else nextSteps.push("完成今日做题 +20");
    if (didMistakesToday) todayGrowth += 15;
    else nextSteps.push("整理错题 +15");
    if (todayStudySeconds >= 3600) todayGrowth += 20;
    else if (todayStudySeconds >= 1800) todayGrowth += 15;
    else nextSteps.push("学习30分钟以上 +15");
    if ((context.studyDays.streak || 0) > 1) todayGrowth += 10;
    else nextSteps.push("连续学习 +10");
    if (didMockExam) todayGrowth += 30;

    const calculatedGrowth = completedDates.size * 20
      + answerDates.size * 20
      + mistakeDates.size * 15
      + Math.floor(context.totalStudySeconds / 1800) * 15
      + Math.max(0, (context.studyDays.streak || 0) - 1) * 10
      + context.masteredTopics * 8
      + (context.completedLessons || 0) * 5;
    const growthValue = Math.max(stored.growthValue || 0, calculatedGrowth);
    const stage = getStageByGrowth(growthValue);
    const stageSpan = Math.max(1, stage.max - stage.min + 1);
    const percent = stage.name === "合格纪念树" ? 100 : Math.min(99, Math.round(((growthValue - stage.min) / stageSpan) * 100));
    const newHistory = [...history];

    if (!newHistory.length) {
      newHistory.push(buildTreeHistoryEntry("🌱", "开始照顾成长树。"));
    }
    if (stored.stageName && stored.stageName !== stage.name) {
      newHistory.unshift(buildTreeHistoryEntry(stage.icon, `成长树进入「${stage.name}」阶段。`));
    }
    if ((context.studyDays.streak || 0) >= 7 && !newHistory.some((entry) => entry.text.includes("新的嫩芽"))) {
      newHistory.unshift(buildTreeHistoryEntry("🌱", "新的嫩芽出现啦。小7连续学习7天。"));
    }
    if ((context.studyDays.streak || 0) >= 30 && !newHistory.some((entry) => entry.text.includes("第一次开花"))) {
      newHistory.unshift(buildTreeHistoryEntry("🌸", "成长树第一次开花。小7连续学习30天。"));
    }
    if ((context.studyDays.streak || 0) >= 60 && !newHistory.some((entry) => entry.text.includes("越来越茂盛"))) {
      newHistory.unshift(buildTreeHistoryEntry("🌳", "成长树已经越来越茂盛。小7连续学习60天。"));
    }

    const trimmedHistory = newHistory.slice(0, 20);
    writeJson(keys.treeGrowth, {
      growthValue,
      stageName: stage.name,
      lastUpdatedDate: today,
      todayGrowth
    });
    writeJson(keys.treeHistory, trimmedHistory);

    return {
      stage,
      growthValue,
      todayGrowth,
      percent,
      gardenerMessage: randomStable(gardenerMessages, `gardener-${growthValue}-${todayGrowth}`),
      nextSteps: nextSteps.length ? nextSteps.slice(0, 3).join(" / ") : "今天的成长树已经被好好照顾过啦。",
      history: trimmedHistory
    };
  }

  function buildContext() {
    const answers = readJson(keys.answers, []);
    const mistakes = readJson(keys.mistakes, []);
    const unmasteredMistakes = mistakes.filter((mistake) => !mistake.mastered);
    const studyDays = getStudyDays();
    const lastPlan = readJson(keys.lastPlan, null);
    const courseDashboard = window.xiaoWuCourseEngine?.buildDashboard(answers) || null;
    const currentTheme = answers[answers.length - 1]?.topic || courseDashboard?.activeLesson?.title || "免許制度";
    const daysUntilExam = getDaysUntilExam();
    const phase = getPhase(daysUntilExam);
    const totalCorrect = answers.filter((answer) => answer.isCorrect).length;
    const totalAccuracy = answers.length ? Math.round((totalCorrect / answers.length) * 100) : 0;
    const learning = buildLearningMap(answers, mistakes, currentTheme);
    const masteredTopics = learning.flatMap((section) => section.topics).filter((topic) => topic.state === "mastered").length;
    const completedTasks = (studyDays.completedDates || []).length;
    const lastAccuracy = getLastAccuracy(answers);
    const today = todayKey();
    const todayAnswers = answers.filter((answer) => (answer.answeredAt || "").startsWith(today));
    const todayTasks = lastPlan?.date === today ? (lastPlan.tasks || []) : [];
    return {
      answers,
      mistakes,
      unmasteredMistakes,
      studyDays,
      lastPlan,
      currentTheme,
      daysUntilExam,
      phase,
      totalCorrect,
      totalAccuracy,
      totalStudySeconds: readNumber(keys.totalStudy),
      todayStudySeconds: readNumber(keys.todayStudy),
      todayAnswersCount: todayAnswers.length,
      todayTaskDoneCount: todayTasks.filter((task) => task.done).length,
      completedTasks,
      masteredTopics,
      lastAccuracy,
      learningMap: learning,
      course: courseDashboard,
      completedLessons: courseDashboard?.courseCards?.filter((card) => card.progress.isCompleted).length || 0
    };
  }

  function buildAnalysis(context) {
    const yesterday = getYesterdayStats(context.answers, context.lastPlan);
    const treeText = context.growthTree ? `成长树现在在「${context.growthTree.stage.name}」阶段。` : "";

    if (context.todayStudySeconds === 0 && !context.todayTaskDoneCount && !context.todayAnswersCount) {
      if (yesterday.answered === 0 && yesterday.completedTasks === 0 && yesterday.seconds === 0 && context.answers.length > 0) {
        return `昨天成长树休息了一天也没关系。今天我们重新浇一点水，它很快又会长起来。小7，今天先轻轻开始一点点，小吴陪你。${treeText}`;
      }

      return `小7，今天我们不用学很多。先轻轻开始一点点，小吴陪你。${treeText} 今天只要完成学习、做题、错题整理这一个小闭环，就已经很好了。`;
    }

    if (yesterday.seconds >= 3600) {
      return `小7昨天真的很努力，学习了 ${formatStudyTime(yesterday.seconds)}，小吴有一点点心疼你。今天可以轻一点，但不要断掉节奏。先把错题看一眼，再做几题就很好。`;
    }

    if (context.lastAccuracy !== null && context.lastAccuracy < 70) {
      return `没关系，小7。最近正确率是 ${context.lastAccuracy}%，错题不是失败，是我们找到的提分入口。今天小吴陪你把「${context.currentTheme}」这个坑补上。`;
    }

    if (context.lastAccuracy !== null && context.lastAccuracy >= 80) {
      return `小7今天状态很好。最近正确率是 ${context.lastAccuracy}%，「${context.currentTheme}」已经慢慢变成你的得分点了。今天可以轻轻往前走一步。`;
    }

    if ((context.studyDays.streak || 0) >= 7) {
      return `小7已经连续努力一周啦。成长树长出了新的叶子，小吴真的很为你开心。今天不用贪多，稳稳守住节奏就很好。`;
    }

    if (!context.answers.length) {
      return "小7，今天我们从宅建業法的入口开始。先不用急着学很多，免許制度是很适合建立信心的第一块。小吴今天陪你把第一组题做完，把不会的地方留下来，明天就知道该补哪里。";
    }
    const accuracyText = yesterday.accuracy === null ? "还没有完整统计" : `${yesterday.accuracy}%`;
    const next = context.lastAccuracy !== null && context.lastAccuracy >= 70
      ? "今天可以轻轻进入下一个主题，但错题还是要先看一眼。"
      : `今天不用急着学新的内容。昨天「${context.currentTheme}」还有几个地方容易混淆，先把这里真正学懂。`;
    return `昨天你学习了 ${formatStudyTime(yesterday.seconds)}，完成了 ${yesterday.completedTasks} 个学习任务，做题 ${yesterday.answered} 题，正确 ${yesterday.correct} 题，正确率 ${accuracyText}。${next} 这样考试的时候就不会紧张，小吴会陪你把漏洞一点点补上。`;
  }

  function buildPlan() {
    const today = todayKey();
    const savedTasks = readJson(keys.todayTasks, null);
    const savedPlan = readJson(keys.lastPlan, null);
    const context = buildContext();

    if (savedPlan?.date === today && savedTasks?.date === today && savedPlan.version === "course-v1") {
      return { ...savedPlan, tasks: savedTasks.tasks };
    }

    const shouldReviewMistakes = context.unmasteredMistakes.length > 0;
    const shouldStayCurrent = context.lastAccuracy !== null && context.lastAccuracy < 70;
    const shouldMoveNext = context.lastAccuracy !== null && context.lastAccuracy >= 70;
    const activeLesson = context.course?.activeLesson;
    let mainTheme = activeLesson ? `${activeLesson.subject} - ${activeLesson.title}` : "宅建業法 - 免許制度";
    let goal = activeLesson ? `今天先学第一课：「${activeLesson.title}」。` : "今天先把免許制度拿稳。";
    let firstFocus = mainTheme;
    let skip = getPhaseSkipGuidance(context.phase);
    let reason = "因为免許制度是宅建業法的入口，也是考试最容易拿分的地方。今天先把这里拿下，比同时学很多内容更有效。";

    if (context.daysUntilExam <= 30) {
      mainTheme = "高频考点 + 错题";
      goal = "冲刺模式：今天先把高频错题稳住。";
      firstFocus = "待复习错题和宅建業法高频考点";
      skip = getPhaseSkipGuidance(context.phase);
    } else if (shouldStayCurrent) {
      mainTheme = `宅建業法 - ${context.currentTheme}`;
      goal = `今天继续学习「${context.currentTheme}」。`;
      firstFocus = `当前主题：${context.currentTheme}`;
    } else if (shouldMoveNext) {
      mainTheme = "宅建業法 - 宅建士制度";
      goal = "今天可以进入下一个高频主题：宅建士制度。";
      firstFocus = "宅建業法 - 宅建士制度";
    }

    reason = buildPlanReason(context, mainTheme);

    const tasks = [];
    if (shouldReviewMistakes) tasks.push({ id: "review-mistakes", text: "复习昨天错题 10分钟", done: false });
    tasks.push(
      { id: "study-main", text: `学习：${mainTheme.replace("宅建業法 - ", "")} 25分钟`, done: false },
      { id: "practice", text: "做今日练习 10题", done: false },
      { id: "organize-mistakes", text: "整理错题 10分钟", done: false }
    );
    const estimatedMinutes = tasks.reduce((total, task) => total + (task.id === "study-main" ? 25 : task.id === "practice" ? 20 : 10), 0);
    const plan = {
      version: "course-v1",
      date: today,
      daysUntilExam: context.daysUntilExam,
      phase: context.phase,
      goal,
      estimatedMinutes,
      firstFocus,
      skip,
      reason,
      gentleReminder: context.studyDays.streak >= 7 ? "小7已经连续努力一周啦，今天可以轻一点，但不要断掉节奏。" : "今天不用学很多，我们只认真完成这几件小事。",
      completed: false,
      tasks
    };
    writeJson(keys.todayTasks, { date: today, tasks });
    writeJson(keys.lastPlan, plan);
    return plan;
  }

  function buildDashboard() {
    const context = buildContext();
    const plan = buildPlan();
    const growthTree = buildGrowthTree(context);
    const enrichedContext = { ...context, growthTree };
    const encouragementPool = buildEncouragementPool(enrichedContext);
    return {
      plan,
      daysUntilExam: context.daysUntilExam,
      phase: context.phase,
      streak: context.studyDays.streak || 0,
      analysis: buildAnalysis(enrichedContext),
      learningMap: context.learningMap,
      growth: {
        totalStudy: formatStudyTime(context.totalStudySeconds),
        totalAnswers: context.answers.length,
        totalAccuracy: `${context.totalAccuracy}%`,
        totalMistakes: context.mistakes.length,
        streak: `${context.studyDays.streak || 0}天`,
        completedTasks: context.completedTasks
      },
      growthTree,
      course: context.course,
      dailyLine: randomStable(buildDailyLines(), "daily-line"),
      encouragement: randomStable(encouragementPool, `encouragement-${context.answers.length}-${context.mistakes.length}`)
    };
  }

  function saveTaskState(tasks) {
    writeJson(keys.todayTasks, { date: todayKey(), tasks });
  }

  function completeToday(plan) {
    const today = todayKey();
    const studyDays = getStudyDays();
    const wasCompletedToday = (studyDays.completedDates || []).includes(today);
    const completedDates = Array.from(new Set([...(studyDays.completedDates || []), today])).sort();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = todayKey(yesterday);
    const hadYesterday = completedDates.includes(yesterdayKey);
    const streak = wasCompletedToday ? (studyDays.streak || 1) : hadYesterday ? (studyDays.streak || 0) + 1 : 1;
    const completedPlan = { ...plan, completed: true };
    writeJson(keys.studyDays, { streak, completedDates, lastCompletedDate: today });
    writeJson(keys.lastPlan, completedPlan);
    return completedPlan;
  }

  return {
    buildPlan,
    buildDashboard,
    saveTaskState,
    completeToday,
    keys
  };
})();
