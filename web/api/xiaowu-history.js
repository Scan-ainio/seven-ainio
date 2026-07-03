const USER_ID = "xiaoqi-default";
const HISTORY_KEY = `xiaowu:history:${USER_ID}`;
const MAX_HISTORY_ITEMS = 200;

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
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

function normalizeBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function getRedisConfig() {
  const url = normalizeBaseUrl(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL);
  const token = String(process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();

  return {
    url,
    token,
    envCheck: {
      hasKvRestApiUrl: Boolean(process.env.KV_REST_API_URL),
      hasKvRestApiToken: Boolean(process.env.KV_REST_API_TOKEN),
      hasUpstashRedisRestUrl: Boolean(process.env.UPSTASH_REDIS_REST_URL),
      hasUpstashRedisRestToken: Boolean(process.env.UPSTASH_REDIS_REST_TOKEN),
      selectedUrlEnv: process.env.KV_REST_API_URL ? "KV_REST_API_URL" : (process.env.UPSTASH_REDIS_REST_URL ? "UPSTASH_REDIS_REST_URL" : ""),
      selectedTokenEnv: process.env.KV_REST_API_TOKEN ? "KV_REST_API_TOKEN" : (process.env.UPSTASH_REDIS_REST_TOKEN ? "UPSTASH_REDIS_REST_TOKEN" : "")
    }
  };
}

function assertRedisConfigured(method) {
  const config = getRedisConfig();
  if (!config.url || !config.token) {
    const error = new Error("Upstash Redis REST environment variables are missing");
    error.code = "REDIS_ENV_MISSING";
    error.envCheck = config.envCheck;
    error.method = method;
    throw error;
  }
  return config;
}

function normalizeText(value, maxLength = 8000) {
  return String(value || "").trim().slice(0, maxLength);
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
  const status = normalizeText(input.status, 20);

  return {
    id: normalizeText(input.id, 80) || `chat-${Date.now()}`,
    userId: USER_ID,
    question: normalizeText(input.question, 4000),
    answer: normalizeText(input.answer, 12000),
    lessonLinks: normalizeLessonLinks(input.lessonLinks),
    createdAt: normalizeText(input.createdAt, 40) || now,
    lessonId: normalizeText(input.lessonId || input.currentLessonId, 60),
    deviceInfo: normalizeText(input.deviceInfo, 500),
    status: ["sending", "done", "error"].includes(status) ? status : (input.answer ? "done" : "sending"),
    updatedAt: now
  };
}

function mergeRecord(history, record) {
  const existing = history.find((item) => item.id === record.id);
  const merged = existing
    ? {
        ...existing,
        ...record,
        answer: record.answer || existing.answer || "",
        lessonLinks: record.lessonLinks?.length ? record.lessonLinks : (existing.lessonLinks || []),
        status: record.answer ? record.status : (existing.status || record.status)
      }
    : record;

  return [...history.filter((item) => item.id !== merged.id), merged]
    .sort((a, b) => {
      const left = new Date(a.createdAt).getTime() || 0;
      const right = new Date(b.createdAt).getTime() || 0;
      return left - right;
    })
    .slice(-MAX_HISTORY_ITEMS);
}

async function upstashFetch(path, options, method) {
  const { url, token, envCheck } = assertRedisConfigured(method);
  const response = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.error) {
    const error = new Error(data.error || `Upstash REST request failed with ${response.status}`);
    error.code = "UPSTASH_REST_FAILED";
    error.status = response.status;
    error.upstashResponse = data;
    error.envCheck = envCheck;
    error.method = method;
    throw error;
  }

  return { data, envCheck };
}

async function readHistory(method) {
  const encodedKey = encodeURIComponent(HISTORY_KEY);
  const { data } = await upstashFetch(`/get/${encodedKey}`, { method: "GET" }, method);
  const raw = data.result;

  if (!raw) return [];
  if (Array.isArray(raw)) return raw;

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === "string") {
      const parsedAgain = JSON.parse(parsed);
      return Array.isArray(parsedAgain) ? parsedAgain : [];
    }
    return [];
  } catch {
    return [];
  }
}

async function writeHistory(history, method) {
  const encodedKey = encodeURIComponent(HISTORY_KEY);
  await upstashFetch(`/set/${encodedKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(history.slice(-MAX_HISTORY_ITEMS))
  }, method);
  return history.slice(-MAX_HISTORY_ITEMS);
}

function buildErrorPayload(error, method) {
  return {
    ok: false,
    error: error.code || "XIAOWU_HISTORY_FAILED",
    message: "小吴老师云端记忆还没有连接成功 🌸",
    detail: error.message,
    envCheck: error.envCheck || getRedisConfig().envCheck,
    method,
    status: error.status || null,
    upstashResponse: error.upstashResponse || null
  };
}

module.exports = async function handler(req, res) {
  const method = req.method || "UNKNOWN";
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    if (method === "GET") {
      const history = await readHistory(method);
      sendJson(res, 200, {
        ok: true,
        userId: USER_ID,
        history,
        records: history,
        count: history.length,
        method,
        envCheck: getRedisConfig().envCheck
      });
      return;
    }

    if (method === "POST") {
      const body = await parseBody(req);
      const record = normalizeRecord(body);

      if (!record.question) {
        sendJson(res, 400, {
          ok: false,
          error: "QUESTION_REQUIRED",
          message: "question is required",
          envCheck: getRedisConfig().envCheck,
          method
        });
        return;
      }

      const current = await readHistory(method);
      const history = await writeHistory(mergeRecord(current, record), method);
      sendJson(res, 200, {
        ok: true,
        saved: true,
        userId: USER_ID,
        record,
        history,
        records: history,
        count: history.length,
        recordsCount: history.length,
        method,
        envCheck: getRedisConfig().envCheck
      });
      return;
    }

    sendJson(res, 405, {
      ok: false,
      error: "METHOD_NOT_ALLOWED",
      message: "Method not allowed",
      envCheck: getRedisConfig().envCheck,
      method
    });
  } catch (error) {
    console.error("[xiaowu-history] cloud memory API failed", {
      error: error.code || "XIAOWU_HISTORY_FAILED",
      message: error.message,
      envCheck: error.envCheck || getRedisConfig().envCheck,
      method,
      status: error.status || null,
      upstashResponse: error.upstashResponse || null
    });
    sendJson(res, 500, buildErrorPayload(error, method));
  }
};
