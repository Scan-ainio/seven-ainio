const USER_ID = "xiaoqi-default";
const HISTORY_KEY = `xiaowu:history:v2:${USER_ID}`;
const MAX_HISTORY_ITEMS = 500;

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

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

function normalizeText(value, maxLength = 8000) {
  return String(value || "").trim().slice(0, maxLength);
}

function getKvConfig() {
  return {
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN
  };
}

function assertKvConfigured() {
  const config = getKvConfig();
  if (!config.url || !config.token) {
    const error = new Error("Vercel KV is not configured");
    error.code = "KV_NOT_CONFIGURED";
    throw error;
  }
  return config;
}

async function kvCommand(command) {
  const { url, token } = assertKvConfigured();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(`KV command failed with ${response.status}`);
    error.details = data;
    throw error;
  }

  if (data.error) {
    const error = new Error(data.error);
    error.details = data;
    throw error;
  }

  return data.result;
}

async function readHistory() {
  const raw = await kvCommand(["GET", HISTORY_KEY]);
  if (!raw) return [];

  try {
    const records = JSON.parse(raw);
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

async function writeHistory(records) {
  const trimmed = records.slice(-MAX_HISTORY_ITEMS);
  await kvCommand(["SET", HISTORY_KEY, JSON.stringify(trimmed)]);
  return trimmed;
}

function normalizeLessonLinks(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((link) => link && link.lessonId)
    .map((link) => ({
      lessonId: normalizeText(link.lessonId, 40),
      label: normalizeText(link.label, 80)
    }))
    .slice(0, 5);
}

function normalizeRecord(input) {
  const now = new Date().toISOString();
  return {
    id: normalizeText(input.id, 80) || `chat-${Date.now()}`,
    userId: USER_ID,
    question: normalizeText(input.question, 4000),
    answer: normalizeText(input.answer, 12000),
    lessonLinks: normalizeLessonLinks(input.lessonLinks),
    createdAt: normalizeText(input.createdAt, 40) || now,
    lessonId: normalizeText(input.lessonId || input.currentLessonId, 60),
    deviceInfo: normalizeText(input.deviceInfo, 500)
  };
}

function mergeRecord(records, record) {
  const withoutSame = records.filter((item) => item.id !== record.id);
  return [...withoutSame, record].sort((a, b) => {
    const left = new Date(a.createdAt).getTime() || 0;
    const right = new Date(b.createdAt).getTime() || 0;
    return left - right;
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    if (req.method === "GET") {
      const records = await readHistory();
      sendJson(res, 200, { userId: USER_ID, records });
      return;
    }

    if (req.method === "POST") {
      const body = parseBody(req);
      const record = normalizeRecord(body);

      if (!record.question || !record.answer) {
        sendJson(res, 400, { error: "question and answer are required" });
        return;
      }

      const current = await readHistory();
      const records = await writeHistory(mergeRecord(current, record));
      sendJson(res, 200, { ok: true, userId: USER_ID, record, recordsCount: records.length });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error("[xiaowu-history] request failed", error);
    const status = error.code === "KV_NOT_CONFIGURED" ? 500 : 502;
    sendJson(res, status, {
      error: error.code || "HISTORY_SYNC_FAILED",
      message: "小吴老师正在同步历史记录 🌸",
      records: []
    });
  }
};
