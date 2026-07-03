const USER_ID = "xiaoqi-default";
const TOTAL_KEY = `xiaowu:chat-time:v1:${USER_ID}:total`;
const DAILY_KEY_PREFIX = `xiaowu:chat-time:v1:${USER_ID}:daily`;

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function parseBody(req) {
  if (req.body) {
    if (typeof req.body === "string") {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
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

function getTodayKey() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
}

function normalizeDate(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : getTodayKey();
}

function normalizeSeconds(value) {
  const seconds = Math.floor(Number(value));
  if (!Number.isFinite(seconds) || seconds <= 0) return 0;
  return Math.min(seconds, 60 * 60 * 12);
}

async function readTime(date) {
  const dailyKey = `${DAILY_KEY_PREFIX}:${date}`;
  const [todayRaw, totalRaw] = await Promise.all([
    kvCommand(["GET", dailyKey]),
    kvCommand(["GET", TOTAL_KEY])
  ]);

  return {
    userId: USER_ID,
    date,
    todaySeconds: Number(todayRaw) || 0,
    totalSeconds: Number(totalRaw) || 0
  };
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
      const requestUrl = new URL(req.url || "/api/xiaowu-chat-time", "https://takken.local");
      const date = normalizeDate(requestUrl.searchParams.get("date"));
      sendJson(res, 200, await readTime(date));
      return;
    }

    if (req.method === "POST") {
      const body = await parseBody(req);
      const date = normalizeDate(body.date);
      const deltaSeconds = normalizeSeconds(body.deltaSeconds);

      if (!deltaSeconds) {
        sendJson(res, 400, { error: "deltaSeconds is required" });
        return;
      }

      const dailyKey = `${DAILY_KEY_PREFIX}:${date}`;
      const [todaySeconds, totalSeconds] = await Promise.all([
        kvCommand(["INCRBY", dailyKey, deltaSeconds]),
        kvCommand(["INCRBY", TOTAL_KEY, deltaSeconds])
      ]);

      sendJson(res, 200, {
        ok: true,
        userId: USER_ID,
        date,
        todaySeconds: Number(todaySeconds) || 0,
        totalSeconds: Number(totalSeconds) || 0
      });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error("[xiaowu-chat-time] request failed", error);
    const status = error.code === "KV_NOT_CONFIGURED" ? 500 : 502;
    sendJson(res, status, {
      error: error.code || "CHAT_TIME_SYNC_FAILED",
      message: "小吴老师正在同步聊天时间 🌸"
    });
  }
};
