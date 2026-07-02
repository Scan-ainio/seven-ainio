const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

const refusalMessage = `🌸 小7，这个问题超出小吴课堂范围啦。你有任何问题可以向生活中的小吴咨询，大宝子无所不能！

现在小吴只负责陪你学习宅建：

✅ 宅建课程
✅ 宅建考题
✅ 错题解析
✅ 学习计划

我们先把宅建拿下，其他问题下课再说（笑）`;

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

function detectLessonLinks(text, currentLessonId) {
  const haystack = normalizeText(text).toLowerCase();
  const links = [];

  if (currentLessonId && lessons.some((lesson) => lesson.id === currentLessonId)) {
    const current = lessons.find((lesson) => lesson.id === currentLessonId);
    links.push({ lessonId: current.id, label: `📖 打开 ${current.label}` });
  }

  lessons.forEach((lesson) => {
    const explicit = haystack.includes(lesson.id) || haystack.includes(lesson.label.toLowerCase());
    const keywordHit = lesson.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
    if ((explicit || keywordHit) && !links.some((link) => link.lessonId === lesson.id)) {
      links.push({ lessonId: lesson.id, label: `📖 打开 ${lesson.label}` });
    }
  });

  return links.slice(0, 3);
}

function isObviouslyOutOfScope(message) {
  const text = normalizeText(message).toLowerCase();
  const blocked = [
    "股票", "stock", "天气", "weather", "做饭", "菜谱", "恋爱", "娱乐", "mac", "签证", "visa",
    "医疗", "看病", "保险", "旅游", "旅行", "不动产投资", "不動産投資", "基金", "比特币", "bitcoin"
  ];
  const takkenSignals = [
    "宅建", "宅建士", "宅建業", "宅建业", "民法", "権利", "权利", "法令", "税", "五問免除",
    "lesson", "错题", "過去問", "过去问", "考试", "問題", "题", "講義", "课程"
  ];

  if (!text) return true;
  if (blocked.some((word) => text.includes(word)) && !takkenSignals.some((word) => text.includes(word.toLowerCase()))) {
    return true;
  }
  return false;
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

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
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

  if (isObviouslyOutOfScope(userMessage)) {
    sendJson(res, 200, {
      reply: refusalMessage,
      lessonLinks: [],
      scope: "refused"
    });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    sendJson(res, 500, {
      error: "OPENAI_API_KEY is not configured",
      reply: "🌸 小7，小吴老师现在还没有拿到课堂钥匙。请先在服务器环境变量里设置 OPENAI_API_KEY。"
    });
    return;
  }

  const recentHistory = Array.isArray(chatHistory)
    ? chatHistory.slice(-6).flatMap((item) => {
      const q = normalizeText(item.question).slice(0, 600);
      const a = normalizeText(item.answer).slice(0, 900);
      return q && a ? [
        { role: "user", content: q },
        { role: "assistant", content: a }
      ] : [];
    })
    : [];

  const systemPrompt = `你是「小吴老师」，只负责回答宅建考试相关问题。

回答范围只包括：
* 宅建课程
* 宅建考题
* 错题解析
* 学习计划
* Lesson001～Lesson012 已完成课程相关问题

如果用户问任何非宅建问题，例如股票、天气、做饭、恋爱、娱乐、Mac 操作、日本签证、不动产投资、医疗、保险、旅游，必须拒绝，并逐字使用以下固定回复：

${refusalMessage}

回答风格：
中文为主，重要日语原词保留。
像小吴老师陪小7学习。
温柔、亲切、直接、考试导向。
不要像机器人。
不要回答宅建以外的问题。
如果问题不是明显宅建相关，也要使用固定拒绝回复。

当前已完成课程：
${lessonSummary}

如果用户问到已完成课程内容，请指出对应 Lesson，并在回答末尾加一行「📖 打开 LessonXXX」。`;

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        temperature: 0.5,
        messages: [
          { role: "system", content: systemPrompt },
          ...recentHistory,
          {
            role: "user",
            content: `currentLessonId: ${normalizeText(currentLessonId) || "unknown"}\n\n小7的问题：${userMessage}`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[xiaowu-chat] OpenAI error", data);
      sendJson(res, response.status, {
        error: "OpenAI request failed",
        reply: "🌸 小7，小吴老师刚才有点连不上课堂。等一下再问我一次，好不好？"
      });
      return;
    }

    const reply = data?.choices?.[0]?.message?.content?.trim() || "🌸 小7，这题小吴老师想再确认一下。你可以换个说法再问我一次。";
    const lessonLinks = detectLessonLinks(`${userMessage}\n${reply}`, normalizeText(currentLessonId));

    if (!isLikelyTakkenQuestion(userMessage) && reply !== refusalMessage) {
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
      scope: "takken"
    });
  } catch (error) {
    console.error("[xiaowu-chat] request failed", error);
    sendJson(res, 500, {
      error: "Request failed",
      reply: "🌸 小7，小吴老师刚才没能连上课堂。请稍后再试一次。"
    });
  }
};
