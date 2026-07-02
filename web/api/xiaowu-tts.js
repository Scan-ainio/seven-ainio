const DEFAULT_VOICE = "zh-CN-YunxiNeural";
const DEFAULT_SPEED = 0.92;
const OUTPUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3";

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

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function speedToRate(speedValue) {
  const speed = Number(speedValue);
  if (!Number.isFinite(speed)) return "-8%";
  const percent = Math.round((Math.min(1.3, Math.max(0.7, speed)) - 1) * 100);
  return `${percent > 0 ? "+" : ""}${percent}%`;
}

function buildSsml(text, voice, speed) {
  return [
    '<speak version="1.0" xml:lang="zh-CN">',
    `  <voice name="${escapeXml(voice)}">`,
    `    <prosody rate="${escapeXml(speedToRate(speed))}" pitch="+0%">`,
    `      ${escapeXml(text)}`,
    "    </prosody>",
    "  </voice>",
    "</speak>"
  ].join("\n");
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

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    sendJson(res, 503, {
      error: "AZURE_SPEECH_NOT_CONFIGURED",
      message: "Azure Speech 还没有配置好 🌸"
    });
    return;
  }

  const body = parseBody(req);
  const text = normalizeText(body.text);

  if (!text) {
    sendJson(res, 400, { error: "text is required" });
    return;
  }

  const voice = normalizeText(process.env.AZURE_SPEECH_VOICE || body.voice || DEFAULT_VOICE, 80);
  const speed = body.speed ?? DEFAULT_SPEED;
  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": OUTPUT_FORMAT,
        "User-Agent": "xiaowu-teacher"
      },
      body: buildSsml(text, voice, speed)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("[xiaowu-tts] Azure Speech error", response.status, errorText);
      sendJson(res, response.status, {
        error: "Azure Speech request failed",
        message: "Azure Speech 暂时没有朗读成功 🌸"
      });
      return;
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    res.statusCode = 200;
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", String(audioBuffer.length));
    res.end(audioBuffer);
  } catch (error) {
    console.error("[xiaowu-tts] request failed", error);
    sendJson(res, 500, {
      error: "Azure Speech request failed",
      message: "Azure Speech 暂时没有朗读成功 🌸"
    });
  }
};
