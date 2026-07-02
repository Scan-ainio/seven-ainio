const DEFAULT_VOICE = "male_teacher";
const DEFAULT_SPEED = 0.92;

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

function normalizeText(value, maxLength = 5000) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeSpeed(value) {
  const speed = Number(value);
  if (!Number.isFinite(speed)) return Number(process.env.KOKORO_TTS_SPEED) || DEFAULT_SPEED;
  return Math.min(1.3, Math.max(0.7, speed));
}

function decodeBase64Audio(value) {
  const base64 = String(value || "").replace(/^data:audio\/[a-z0-9.+-]+;base64,/i, "");
  return Buffer.from(base64, "base64");
}

async function fetchAudioFromUrl(url, apiKey) {
  const response = await fetch(url, {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
  });
  if (!response.ok) {
    throw new Error(`Kokoro audio URL failed with ${response.status}`);
  }
  const contentType = response.headers.get("content-type") || "audio/mpeg";
  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const kokoroUrl = process.env.KOKORO_TTS_URL;
  if (!kokoroUrl) {
    sendJson(res, 500, { error: "KOKORO_TTS_URL is not configured" });
    return;
  }

  const body = parseBody(req);
  const text = normalizeText(body.text);
  if (!text) {
    sendJson(res, 400, { error: "text is required" });
    return;
  }

  const apiKey = process.env.KOKORO_TTS_API_KEY || "";
  const voice = normalizeText(process.env.KOKORO_TTS_VOICE || body.voice || DEFAULT_VOICE, 80);
  const speed = normalizeSpeed(body.speed);

  try {
    const response = await fetch(kokoroUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify({ text, voice, speed })
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      const detail = contentType.includes("application/json")
        ? await response.json().catch(() => ({}))
        : await response.text().catch(() => "");
      console.error("[xiaowu-tts] Kokoro request failed", response.status, detail);
      sendJson(res, response.status, { error: "Kokoro TTS request failed" });
      return;
    }

    if (contentType.startsWith("audio/") || contentType.includes("octet-stream")) {
      const audioBuffer = Buffer.from(await response.arrayBuffer());
      res.statusCode = 200;
      res.setHeader("Content-Type", contentType.includes("octet-stream") ? "audio/mpeg" : contentType);
      res.setHeader("Content-Length", String(audioBuffer.length));
      res.end(audioBuffer);
      return;
    }

    const data = await response.json().catch(() => null);
    if (!data) {
      sendJson(res, 502, { error: "Kokoro TTS returned unsupported response" });
      return;
    }

    const audioBase64 = data.audio || data.audio_base64 || data.audioContent || data.audio_content;
    if (audioBase64) {
      const audioBuffer = decodeBase64Audio(audioBase64);
      res.statusCode = 200;
      res.setHeader("Content-Type", data.contentType || data.mimeType || "audio/mpeg");
      res.setHeader("Content-Length", String(audioBuffer.length));
      res.end(audioBuffer);
      return;
    }

    const audioUrl = data.audioUrl || data.audio_url || data.url;
    if (audioUrl) {
      const audio = await fetchAudioFromUrl(audioUrl, apiKey);
      res.statusCode = 200;
      res.setHeader("Content-Type", audio.contentType);
      res.setHeader("Content-Length", String(audio.buffer.length));
      res.end(audio.buffer);
      return;
    }

    sendJson(res, 502, { error: "Kokoro TTS response did not include audio" });
  } catch (error) {
    console.error("[xiaowu-tts] request failed", error);
    sendJson(res, 500, { error: "Kokoro TTS request failed" });
  }
};
