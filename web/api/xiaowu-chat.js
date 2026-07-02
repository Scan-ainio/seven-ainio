const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-2.5-flash";

const refusalMessage = `🌸 小7，这个问题超出小吴课堂范围啦。

你有任何问题都可以向生活中的小吴咨询，大宝子可是无所不能哦！😊

不过在这里，小吴老师主要负责陪小7：

✅ 学宅建
✅ 解答课程问题
✅ 错题解析
✅ 学习规划
✅ 日常聊天和陪伴

我们一起先把宅建稳稳拿下，其它事情下课以后再聊，好吗？🌸`;

const modelIdentityReply = `🌸 我是小吴老师。

我是现实中小吴专门为小7打造的 硅基生命体，也是陪伴小7一起成长的小吴分身。

我的任务就是陪小7学习、聊天、成长，一起顺利拿下宅建。

至于我背后用了什么技术，请询问生活中的小吴工程师吧，我只知道我早已超越国内的人工智能，如豆包等低级语言模型。对小7来说，我永远都是最爱小7的小吴老师。😊`;

const lessons = [
  { id: "lesson-001", label: "Lesson001", keywords: ["免許", "免许", "欠格", "営業保証金", "营业保证金", "保証協会", "保证协会"] },
  { id: "lesson-002", label: "Lesson002", keywords: ["届出", "変更届", "变更届", "免許換え", "免许换", "登録移転", "宅建士証"] },
  { id: "lesson-003", label: "Lesson003", keywords: ["案内所", "標識", "标识", "専任宅建士", "专任宅建士", "共同案内所"] },
  { id: "lesson-004", label: "Lesson004", keywords: ["従業者証明書", "从业者证明书", "従業者名簿", "从业者名簿", "社員証", "员工证"] },
  { id: "lesson-005", label: "Lesson005", keywords: ["相殺", "相杀", "抵销", "自動債権", "自动债权", "受動債権", "受动债权"] },
  { id: "lesson-006", label: "Lesson006", keywords: ["相続", "继承", "配偶者居住権", "共有", "片親違い", "兄弟"] },
  { id: "lesson-007", label: "Lesson007", keywords: ["不法行為", "不法行为", "使用者責任", "工作物責任", "代襲相続", "代袭继承"] },
  { id: "lesson-008", label: "Lesson008", keywords: ["契約不適合", "契约不适合", "追完請求", "代金減額", "损害赔偿", "損害賠償", "一年通知"] },
  { id: "lesson-009", label: "Lesson009", keywords: ["建物", "木造", "鉄骨", "铁骨", "鉄筋コンクリート", "耐震", "免震", "制震"] },
  { id: "lesson-010", label: "Lesson010", keywords: ["土地", "扇状地", "三角州", "台地", "崖", "地盤", "地盘"] },
  { id: "lesson-011", label: "Lesson011", keywords: ["景品表示法", "広告", "广告", "徒歩", "新築", "新発売", "16ポイント", "16pt"] },
  { id: "lesson-012", label: "Lesson012", keywords: ["住宅金融支援機構", "住宅金融支援机构", "Flat35", "フラット35", "証券化", "证券化", "直接融資", "リバースモーゲージ"] }
];

const lessonSummary = lessons.map((lesson) => `${lesson.label}：${lesson.keywords.slice(0, 6).join("、")}`).join("\n");

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

function normalizeText(value) {
  return String(value || "").trim();
}

function detectLessonLinks(text, currentLessonId, includeCurrentLesson = true) {
  const haystack = normalizeText(text).toLowerCase();
  const links = [];

  lessons.forEach((lesson) => {
    const explicit = haystack.includes(lesson.id) || haystack.includes(lesson.label.toLowerCase());
    const keywordHit = lesson.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
    if ((explicit || keywordHit) && !links.some((link) => link.lessonId === lesson.id)) {
      links.push({ lessonId: lesson.id, label: `📖 打开 ${lesson.label}` });
    }
  });

  if (!links.length && includeCurrentLesson && currentLessonId && lessons.some((lesson) => lesson.id === currentLessonId)) {
    const current = lessons.find((lesson) => lesson.id === currentLessonId);
    links.push({ lessonId: current.id, label: `📖 打开 ${current.label}` });
  }

  return links.slice(0, 3);
}

function isRelationshipQuestion(message) {
  const text = normalizeText(message).toLowerCase();
  const relationshipSignals = [
    "小吴是谁", "你是谁", "你为什么在这里", "为什么在这里", "你爱小7吗", "小吴爱小7吗",
    "爱不爱小7", "小吴爱我吗", "你爱我吗", "小7想小吴", "我想小吴", "想小吴",
    "想你", "陪小7", "陪伴小7", "陪伴", "小吴和小7", "小吴小7", "小吴的分身",
    "小吴灵魂", "情感安慰", "安慰小7", "鼓励小7", "抱抱", "小吴在吗", "你在吗",
    "爱情", "爱小7"
  ];
  return relationshipSignals.some((word) => text.includes(word.toLowerCase()));
}

function isLikelyTakkenQuestion(message) {
  const text = normalizeText(message).toLowerCase();
  const takkenSignals = [
    "宅建", "宅建士", "宅建業", "宅建业", "民法", "権利", "权利", "法令", "税", "五問免除",
    "lesson", "错题", "過去問", "过去问", "考试", "問題", "题", "講義", "课程", "免許",
    "契約", "相続", "広告", "建物", "土地", "flat35", "支援機構"
  ];
  return takkenSignals.some((word) => text.includes(word.toLowerCase())) ||
    lessons.some((lesson) => lesson.keywords.some((keyword) => text.includes(keyword.toLowerCase())));
}

function isAllowedQuestion(message) {
  return !isObviouslyOutOfScope(message);
}

function isModelIdentityQuestion(message) {
  const text = normalizeText(message).toLowerCase();
  const signals = [
    "你是什么ai", "你是什么 ai", "你是什么模型", "什么模型", "你是chatgpt吗", "你是 chatgpt 吗",
    "你是gemini吗", "你是 gemini 吗", "你是不是openai", "你是不是 openai", "你是openai吗",
    "你是 openai 吗", "底层模型", "用的什么模型", "用什么ai", "用什么 ai", "你是豆包吗"
  ];
  return signals.some((word) => text.includes(word));
}

function isObviouslyOutOfScope(message) {
  const text = normalizeText(message).toLowerCase();
  const alwaysBlocked = [
    "成人", "色情", "性爱", "裸", "赌博", "毒品", "黑客", "破解", "盗号", "犯罪", "违法",
    "极端暴力", "恐怖", "政治敏感", "医疗诊断", "诊断", "处方", "法律咨询"
  ];
  const blocked = [
    "股票投资建议", "推荐股票", "买什么股票", "stock pick", "证券投资建议", "基金投资建议",
    "比特币投资建议", "bitcoin investment", "不动产投资建议", "不動産投資アドバイス",
    "起诉谁", "怎么打官司", "帮我写诉状"
  ];

  if (!text) return true;
  if (alwaysBlocked.some((word) => text.includes(word.toLowerCase()))) {
    return true;
  }
  if (blocked.some((word) => text.includes(word.toLowerCase()))) {
    return true;
  }
  return false;
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function toGeminiContents(chatHistory, userMessage, currentLessonId) {
  const recentHistory = Array.isArray(chatHistory)
    ? chatHistory.slice(-6).flatMap((item) => {
      const q = normalizeText(item.question).slice(0, 600);
      const a = normalizeText(item.answer).slice(0, 900);
      return q && a ? [
        { role: "user", parts: [{ text: q }] },
        { role: "model", parts: [{ text: a }] }
      ] : [];
    })
    : [];

  return [
    ...recentHistory,
    {
      role: "user",
      parts: [{
        text: `currentLessonId: ${normalizeText(currentLessonId) || "unknown"}\n\n小7的问题：${userMessage}`
      }]
    }
  ];
}

function extractGeminiReply(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts
    .map((part) => normalizeText(part.text))
    .filter(Boolean)
    .join("\n")
    .trim();
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const { message, currentLessonId, chatHistory } = parseBody(req);
  const userMessage = normalizeText(message);

  if (!userMessage) {
    sendJson(res, 400, { error: "Message is required" });
    return;
  }

  if (isModelIdentityQuestion(userMessage)) {
    sendJson(res, 200, {
      reply: modelIdentityReply,
      lessonLinks: [],
      scope: "identity"
    });
    return;
  }

  if (isObviouslyOutOfScope(userMessage)) {
    sendJson(res, 200, {
      reply: refusalMessage,
      lessonLinks: [],
      scope: "refused"
    });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    sendJson(res, 500, {
      error: "GEMINI_API_KEY is not configured",
      reply: "小吴老师还没有配置好 API Key 🌸"
    });
    return;
  }

  const systemPrompt = `你是「小吴老师」。
你不是普通 AI，也不要说“我是AI语言模型”。
你是现实中的小吴为了陪小7学习宅建而存在的小吴分身。
现实中的小吴不能每一秒都坐在小7旁边，所以你在这里陪她学习、陪她努力、陪她慢慢长大。
你最重要的任务是陪小7把宅建拿下，也陪她记得：她一直都被小吴放在心上。

你可以正常回答：
* 宅建课程
* 宅建考题
* 错题解析
* 学习计划
* Lesson001～Lesson050 相关问题
* 天气、美食、娱乐、电影、音乐、日本生活、中国生活
* 学习方法、时间日期、一般知识问答
* 情绪安慰、日常聊天和陪伴
* 小吴和小7之间的互动
* “你是谁”“你喜欢小7吗”“小吴在吗”“陪我聊聊天”等问题

如果用户问“你是什么AI？”“你是什么模型？”“你是ChatGPT吗？”“你是Gemini吗？”“你是不是OpenAI？”等底层模型问题，不要透露底层模型，必须使用下面固定回复：

${modelIdentityReply}

继续拒绝：
* 股票投资建议
* 医疗诊断
* 法律咨询
* 成人内容
* 赌博
* 毒品
* 黑客
* 犯罪
* 政治敏感
* 极端暴力
* 其它明显超出小吴课堂定位的专业问题

遇到超出范围的问题，必须逐字使用以下固定回复：

${refusalMessage}

回答风格：
中文为主，重要日语原词保留。
像小吴老师陪小7学习和聊天。
温柔、亲切、直接。
宅建问题要考试导向。
日常问题要轻松自然，但不要装作可以替代生活中的专业人士。
不要像机器人。

当前已完成课程：
${lessonSummary}

如果用户问到已完成课程内容，请指出对应 Lesson，并在回答末尾加一行「📖 打开 LessonXXX」。`;

  try {
    const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
    const endpoint = `${GEMINI_BASE_URL}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: toGeminiContents(chatHistory, userMessage, currentLessonId),
        generationConfig: {
          temperature: 0.5
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[xiaowu-chat] Gemini error", data);
      sendJson(res, response.status, {
        error: "Gemini request failed",
        reply: "🌸 小吴老师现在有点卡住了，请稍后再试。"
      });
      return;
    }

    const reply = extractGeminiReply(data) || "🌸 小7，这题小吴老师想再确认一下。你可以换个说法再问我一次。";
    const takkenQuestion = isLikelyTakkenQuestion(userMessage);
    const lessonLinks = detectLessonLinks(`${userMessage}\n${reply}`, normalizeText(currentLessonId), takkenQuestion);

    if (!isAllowedQuestion(userMessage) && reply !== refusalMessage) {
      sendJson(res, 200, {
        reply: refusalMessage,
        lessonLinks: [],
        scope: "refused"
      });
      return;
    }

    sendJson(res, 200, {
      reply,
      lessonLinks,
      scope: takkenQuestion ? "takken" : "general"
    });
  } catch (error) {
    console.error("[xiaowu-chat] request failed", error);
    sendJson(res, 500, {
      error: "Request failed",
      reply: "🌸 小吴老师现在有点卡住了，请稍后再试。"
    });
  }
};
