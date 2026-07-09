const USER_ID = "xiaoqi-default";
const LEARNING_KEY = `xiaowu:learning:${USER_ID}`;

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

async function parseBody(req) {
  if (req.body) return typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
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

async function readLearningData(method) {
  const encodedKey = encodeURIComponent(LEARNING_KEY);
  const { data } = await upstashFetch(`/get/${encodedKey}`, { method: "GET" }, method);
  if (!data.result) return null;
  if (typeof data.result === "object") return data.result;
  try {
    return JSON.parse(data.result);
  } catch {
    return null;
  }
}

async function writeLearningData(learningData, method) {
  const encodedKey = encodeURIComponent(LEARNING_KEY);
  await upstashFetch(`/set/${encodedKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(learningData || {})
  }, method);
}

function buildErrorPayload(error, method) {
  return {
    ok: false,
    error: error.code || "XIAOWU_LEARNING_FAILED",
    message: "小吴学习中心云端同步还没有连接成功 🌸",
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
      const learningData = await readLearningData(method);
      sendJson(res, 200, {
        ok: true,
        userId: USER_ID,
        learningData,
        envCheck: getRedisConfig().envCheck,
        method
      });
      return;
    }

    if (method === "POST") {
      const body = await parseBody(req);
      await writeLearningData(body.learningData || body, method);
      sendJson(res, 200, {
        ok: true,
        saved: true,
        userId: USER_ID,
        envCheck: getRedisConfig().envCheck,
        method
      });
      return;
    }

    sendJson(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED", method });
  } catch (error) {
    console.error("[xiaowu-learning]", error);
    sendJson(res, error.status || 500, buildErrorPayload(error, method));
  }
};
