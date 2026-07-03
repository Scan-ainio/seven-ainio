(() => {
  const storageKey = "takken_xiaowu_teacher_chat_v2";
  const pendingHistoryKey = "takken_xiaowu_teacher_pending_history_v1";
  const collapsedKey = "takken_xiaowu_teacher_collapsed_v1";
  const autoSpeechKey = "takken_xiaowu_teacher_auto_speech_v1";
  const voiceChoiceKey = "takken_xiaowu_teacher_voice_uri_v1";
  const speechSpeedKey = "takken_xiaowu_teacher_speech_speed_v1";
  const chatTodayTimeKey = "takken_today_xiaowu_chat_seconds_v1";
  const chatTotalTimeKey = "takken_total_xiaowu_chat_seconds_v1";
  const chatTimeDateKey = "takken_today_xiaowu_chat_date_v1";
  const apiEndpoint = "/api/xiaowu-chat";
  const historyEndpoint = "/api/xiaowu-history";
  const chatTimeEndpoint = "/api/xiaowu-chat-time";
  const ttsEndpoint = "/api/xiaowu-tts";
  const xiaoWuTtsEngine = "azure";
  const xiaoWuVoiceName = "zh-CN-YunxiNeural";
  const maxHistoryForApi = 8;
  const debugPrefix = "[XiaoWu Teacher Chat]";

  const lessonTitles = {
    "lesson-001": "Lesson001｜免許・欠格・営業保証金・保証協会",
    "lesson-002": "Lesson002｜届出・免許換え・登録移転",
    "lesson-003": "Lesson003｜案内所・標識・専任宅建士",
    "lesson-004": "Lesson004｜従業者証明書・従業者名簿",
    "lesson-005": "Lesson005｜相殺・自動債権・受動債権",
    "lesson-006": "Lesson006｜相続・配偶者居住権・共有",
    "lesson-007": "Lesson007｜不法行為・使用者責任",
    "lesson-008": "Lesson008｜契約不適合責任",
    "lesson-009": "Lesson009｜建物",
    "lesson-010": "Lesson010｜土地",
    "lesson-011": "Lesson011｜景品表示法",
    "lesson-012": "Lesson012｜住宅金融支援機構"
  };

  let isOpen = false;
  let isSending = false;
  let chatRecords = readRecords();
  let expandedIds = new Set();
  let collapsedIds = new Set();
  let historySyncMessage = "";
  let isHistoryLoading = false;
  let recognition = null;
  let isListening = false;
  let voiceInputActive = false;
  let voiceAutoSend = false;
  let voiceAutoSendTimer = null;
  let voiceSessionId = 0;
  let voiceListenTimer = null;
  let currentlySpeakingId = "";
  let autoSpeechEnabled = localStorage.getItem(autoSpeechKey) !== "0";
  let currentAudio = null;
  let currentAudioUrl = "";
  let pendingPlayback = null;
  let selectedVoiceURI = localStorage.getItem(voiceChoiceKey) || "auto-male";
  let xiaoWuVoiceSpeed = Number(localStorage.getItem(speechSpeedKey)) || 1;
  if (![0.8, 1, 1.2, 1.5, 2].includes(xiaoWuVoiceSpeed)) xiaoWuVoiceSpeed = 1;
  let pageScrollBeforeChat = 0;
  let chatTimerId = null;
  let chatLastTick = null;
  let pendingServerChatSeconds = 0;
  let isChatTimeSyncing = false;
  let lastChatTimeSyncAt = 0;
  let historyAutoSyncTimerId = null;

  function readRecords() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function saveRecords() {
    localStorage.setItem(storageKey, JSON.stringify(chatRecords));
  }

  function readPendingHistoryRecords() {
    try {
      const value = JSON.parse(localStorage.getItem(pendingHistoryKey));
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function writePendingHistoryRecords(records) {
    localStorage.setItem(pendingHistoryKey, JSON.stringify(records.slice(-80)));
  }

  function queuePendingHistoryRecord(record) {
    if (!record?.id || !record.question) return;
    const current = readPendingHistoryRecords().filter((item) => item.id !== record.id);
    writePendingHistoryRecords([...current, record]);
  }

  function removePendingHistoryRecord(recordId) {
    if (!recordId) return;
    writePendingHistoryRecords(readPendingHistoryRecords().filter((item) => item.id !== recordId));
  }

  function getTodayKey() {
    const now = new Date();
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0")
    ].join("-");
  }

  function readNumberStorage(key) {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) ? value : 0;
  }

  function writeNumberStorage(key, value) {
    localStorage.setItem(key, String(Math.max(0, Math.floor(value))));
  }

  function ensureChatTimeDate() {
    const today = getTodayKey();
    if (localStorage.getItem(chatTimeDateKey) !== today) {
      localStorage.setItem(chatTimeDateKey, today);
      writeNumberStorage(chatTodayTimeKey, 0);
    }
  }

  function notifyChatTimeUpdated() {
    window.dispatchEvent(new CustomEvent("xiaowu-chat-time-updated"));
  }

  function applyServerChatTime(data) {
    if (!data || typeof data !== "object") return;
    const today = getTodayKey();
    if (data.date === today) {
      localStorage.setItem(chatTimeDateKey, today);
      writeNumberStorage(chatTodayTimeKey, Number(data.todaySeconds) || 0);
    }
    writeNumberStorage(chatTotalTimeKey, Number(data.totalSeconds) || 0);
    notifyChatTimeUpdated();
  }

  async function loadServerChatTime() {
    const date = getTodayKey();
    try {
      const response = await fetch(`${chatTimeEndpoint}?date=${encodeURIComponent(date)}`, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || `Chat time request failed with ${response.status}`);
      applyServerChatTime(data);
      console.log(debugPrefix, "chat time fetch complete", {
        url: chatTimeEndpoint,
        status: response.status,
        todaySeconds: data.todaySeconds,
        totalSeconds: data.totalSeconds
      });
    } catch (error) {
      console.error(debugPrefix, "chat time fetch failed", {
        url: chatTimeEndpoint,
        error
      });
      notifyChatTimeUpdated();
    }
  }

  function flushServerChatTime(options = {}) {
    if (!pendingServerChatSeconds || isChatTimeSyncing) return;
    const deltaSeconds = pendingServerChatSeconds;
    const date = getTodayKey();
    const payload = JSON.stringify({ deltaSeconds, date });

    pendingServerChatSeconds = 0;
    lastChatTimeSyncAt = Date.now();

    if (options.beacon && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      const queued = navigator.sendBeacon(chatTimeEndpoint, blob);
      if (!queued) pendingServerChatSeconds += deltaSeconds;
      return;
    }

    isChatTimeSyncing = true;
    fetch(chatTimeEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: Boolean(options.keepalive)
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || `Chat time save failed with ${response.status}`);
        applyServerChatTime(data);
        console.log(debugPrefix, "chat time save complete", {
          url: chatTimeEndpoint,
          status: response.status,
          deltaSeconds
        });
      })
      .catch((error) => {
        pendingServerChatSeconds += deltaSeconds;
        console.error(debugPrefix, "chat time save failed", {
          url: chatTimeEndpoint,
          error
        });
      })
      .finally(() => {
        isChatTimeSyncing = false;
      });
  }

  function saveChatTimeDelta() {
    if (!isOpen || !chatLastTick) return;

    const now = Date.now();
    const deltaSeconds = Math.floor((now - chatLastTick) / 1000);
    if (deltaSeconds <= 0) return;

    ensureChatTimeDate();
    writeNumberStorage(chatTodayTimeKey, readNumberStorage(chatTodayTimeKey) + deltaSeconds);
    writeNumberStorage(chatTotalTimeKey, readNumberStorage(chatTotalTimeKey) + deltaSeconds);
    pendingServerChatSeconds += deltaSeconds;
    chatLastTick += deltaSeconds * 1000;
    notifyChatTimeUpdated();

    if (pendingServerChatSeconds >= 5 || Date.now() - lastChatTimeSyncAt > 10000) {
      flushServerChatTime();
    }
  }

  function startChatTimer() {
    ensureChatTimeDate();
    if (document.visibilityState !== "visible") {
      notifyChatTimeUpdated();
      return;
    }
    chatLastTick = Date.now();
    if (!chatTimerId) {
      chatTimerId = setInterval(saveChatTimeDelta, 1000);
    }
    notifyChatTimeUpdated();
  }

  function stopChatTimer() {
    saveChatTimeDelta();
    flushServerChatTime({ keepalive: true, beacon: true });
    chatLastTick = null;
    if (chatTimerId) {
      clearInterval(chatTimerId);
      chatTimerId = null;
    }
    notifyChatTimeUpdated();
  }

  function mergeRecordFields(existingRecord, nextRecord) {
    if (!existingRecord) return nextRecord;
    if (!nextRecord) return existingRecord;

    const existingHasAnswer = Boolean(existingRecord.answer);
    const nextHasAnswer = Boolean(nextRecord.answer);

    return {
      ...existingRecord,
      ...nextRecord,
      answer: nextHasAnswer ? nextRecord.answer : (existingRecord.answer || ""),
      lessonLinks: nextRecord.lessonLinks?.length ? nextRecord.lessonLinks : (existingRecord.lessonLinks || []),
      status: nextHasAnswer ? (nextRecord.status || "done") : (existingHasAnswer ? (existingRecord.status || "done") : (nextRecord.status || existingRecord.status || "sending"))
    };
  }

  function mergeRecords(primaryRecords, secondaryRecords) {
    const recordsById = new Map();
    [...primaryRecords, ...secondaryRecords].forEach((record) => {
      if (!record?.id) return;
      recordsById.set(record.id, mergeRecordFields(recordsById.get(record.id), record));
    });
    return Array.from(recordsById.values()).sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime() || 0;
      const rightTime = new Date(right.createdAt).getTime() || 0;
      return leftTime - rightTime;
    });
  }

  function getCurrentLessonId() {
    const params = new URLSearchParams(window.location.search);
    const lessonId = params.get("id");
    if (lessonId) return lessonId;

    const selected = localStorage.getItem("takken_selected_lesson_v1");
    return selected || "lesson-001";
  }

  function formatTime(isoString) {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "";
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${month}/${day} ${hour}:${minute}`;
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function getLatestRecordId() {
    return chatRecords.length ? chatRecords[chatRecords.length - 1].id : "";
  }

  function getDeviceInfo() {
    return [
      navigator.userAgent || "unknown",
      window.location.pathname || "",
      window.location.search || ""
    ].join(" | ").slice(0, 500);
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderInlineMarkdown(text) {
    return escapeHtml(text)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }

  function renderMarkdown(text) {
    const lines = String(text || "").split(/\r?\n/);
    const html = [];
    let listOpen = false;
    let quoteOpen = false;
    let codeOpen = false;

    const closeList = () => {
      if (listOpen) {
        html.push("</ul>");
        listOpen = false;
      }
    };
    const closeQuote = () => {
      if (quoteOpen) {
        html.push("</blockquote>");
        quoteOpen = false;
      }
    };

    lines.forEach((rawLine) => {
      const line = rawLine.trimEnd();

      if (line.trim().startsWith("```")) {
        closeList();
        closeQuote();
        html.push(codeOpen ? "</code></pre>" : "<pre><code>");
        codeOpen = !codeOpen;
        return;
      }

      if (codeOpen) {
        html.push(`${escapeHtml(rawLine)}\n`);
        return;
      }

      if (!line.trim()) {
        closeList();
        closeQuote();
        return;
      }

      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        closeList();
        closeQuote();
        const level = heading[1].length + 3;
        html.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
        return;
      }

      const quote = line.match(/^>\s?(.+)$/);
      if (quote) {
        closeList();
        if (!quoteOpen) {
          html.push("<blockquote>");
          quoteOpen = true;
        }
        html.push(`<p>${renderInlineMarkdown(quote[1])}</p>`);
        return;
      }

      const bullet = line.match(/^[-*]\s+(.+)$/);
      if (bullet) {
        closeQuote();
        if (!listOpen) {
          html.push("<ul>");
          listOpen = true;
        }
        html.push(`<li>${renderInlineMarkdown(bullet[1])}</li>`);
        return;
      }

      closeList();
      closeQuote();
      html.push(`<p>${renderInlineMarkdown(line)}</p>`);
    });

    closeList();
    closeQuote();
    if (codeOpen) html.push("</code></pre>");
    return html.join("");
  }

  function scrollHistoryToBottom() {
    const history = document.querySelector("#xiaowuChatHistory");
    if (!history) return;
    requestAnimationFrame(() => {
      history.scrollTop = history.scrollHeight;
    });
  }

  function getSpeechRecognitionConstructor() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  function getSpeechLanguage() {
    const language = (navigator.language || "").toLowerCase();
    return language.startsWith("ja") ? "ja-JP" : "zh-CN";
  }

  function showChatNotice(message) {
    historySyncMessage = message;
    renderHistory();
  }

  function clearChatNotice(message) {
    if (!message || historySyncMessage === message) {
      historySyncMessage = "";
      renderHistory();
    }
  }

  function showCloudMemoryError(context, details = {}) {
    historySyncMessage = "小吴老师云端记忆还没有连接成功 🌸";
    console.error(debugPrefix, `cloud memory ${context} failed`, {
      url: historyEndpoint,
      ...details
    });
    renderHistory();
  }

  function setXiaoWuVoiceStatus(message = "") {
    const status = document.querySelector("#xiaowuVoiceStatus");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("active", Boolean(message));
  }

  async function getMicrophonePermissionState() {
    if (!navigator.permissions?.query) return "unknown";
    try {
      const result = await navigator.permissions.query({ name: "microphone" });
      return result.state || "unknown";
    } catch (error) {
      console.warn(debugPrefix, "microphone permission query unavailable", error);
      return "unknown";
    }
  }

  function stripForSpeech(text) {
    return String(text || "")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/[*#>`_~|[\]()]/g, " ")
      .replace(/[🌸❤️🎉✨⭐💯🌱🌷🎓📚📖✅❌☕🎤🎙️🔊⏹]/g, " ")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^[-*]\s+/gm, "")
      .replace(/^>\s?/gm, "")
      .replace(/📖\s*打开\s*Lesson\d+/g, "")
      .replace(/打开\s*Lesson\d+/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function cleanupCurrentAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.src = "";
      currentAudio = null;
    }
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      currentAudioUrl = "";
    }
  }

  function getPreferredSpeechVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    if (selectedVoiceURI && selectedVoiceURI !== "auto-male") {
      const selected = voices.find((voice) => voice.voiceURI === selectedVoiceURI);
      if (selected) return selected;
    }

    const languageOrder = ["zh-CN", "zh-TW", "ja-JP", "en-US"];
    const malePriority = [
      "Eddy", "Reed", "Rocko", "Grandpa", "Otoya", "Sinji", "Sin-Ji",
      "Yunxi", "Yunjian", "Yunyang", "Kangkang", "Danny", "Daniel",
      "Thomas", "Paul", "Mark", "David", "Microsoft", "Google"
    ];
    const naturalPriority = ["Natural", "Premium", "Enhanced", "Neural", "Online"];
    const femalePenalty = ["Kyoko", "Tingting", "Ting-Ting", "Mei-Jia", "Meijia", "Samantha", "Susan", "Zira", "Hanhan", "Huihui"];

    const scored = voices.map((voice) => {
      const langIndex = languageOrder.findIndex((lang) => voice.lang?.toLowerCase().startsWith(lang.toLowerCase()));
      const maleIndex = malePriority.findIndex((keyword) => voice.name?.toLowerCase().includes(keyword.toLowerCase()));
      const naturalIndex = naturalPriority.findIndex((keyword) => voice.name?.toLowerCase().includes(keyword.toLowerCase()));
      const femaleIndex = femalePenalty.findIndex((keyword) => voice.name?.toLowerCase().includes(keyword.toLowerCase()));
      return {
        voice,
        score:
          (maleIndex === -1 ? 40 : maleIndex) +
          (langIndex === -1 ? 25 : langIndex * 3) +
          (naturalIndex === -1 ? 8 : naturalIndex) +
          (femaleIndex === -1 ? 0 : 60)
      };
    });

    scored.sort((left, right) => left.score - right.score);
    return scored[0]?.voice || null;
  }

  function speakWithBrowserVoice(text, onEnd) {
    if (!("speechSynthesis" in window)) {
      showChatNotice("🌸 小7，这个浏览器暂时不支持朗读，可以先看文字版的小吴老师。");
      if (typeof onEnd === "function") onEnd();
      return false;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(stripForSpeech(text));
    const voice = getPreferredSpeechVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || "zh-CN";
    } else {
      utterance.lang = "zh-CN";
    }
    utterance.rate = xiaoWuVoiceSpeed;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    utterance.onend = () => {
      setXiaoWuVoiceStatus("");
      if (typeof onEnd === "function") onEnd();
    };
    utterance.onerror = () => {
      setXiaoWuVoiceStatus("");
      if (typeof onEnd === "function") onEnd();
    };
    setXiaoWuVoiceStatus("🔊 正在回答……");
    window.speechSynthesis.speak(utterance);
    return true;
  }

  async function speakWithXiaoWuVoice(text, onEnd, options = {}) {
    const speechText = stripForSpeech(text);
    if (!speechText) {
      if (typeof onEnd === "function") onEnd();
      return false;
    }

    stopXiaoWuSpeech({ silent: true });
    if (options.recordId) currentlySpeakingId = options.recordId;

    if (xiaoWuTtsEngine === "browser") {
      return speakWithBrowserVoice(speechText, onEnd);
    }

    try {
      const response = await fetch(ttsEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: speechText,
          voice: xiaoWuVoiceName,
          speed: xiaoWuVoiceSpeed
        })
      });

      if (!response.ok || !response.headers.get("content-type")?.startsWith("audio/")) {
        throw new Error(`Azure Speech TTS failed with ${response.status}`);
      }

      const audioBlob = await response.blob();
      currentAudioUrl = URL.createObjectURL(audioBlob);
      currentAudio = new Audio(currentAudioUrl);
      currentAudio.preload = "auto";
      currentAudio.volume = 1;
      currentAudio.onended = () => {
        cleanupCurrentAudio();
        pendingPlayback = null;
        setXiaoWuVoiceStatus("");
        if (typeof onEnd === "function") onEnd();
      };
      currentAudio.onerror = () => {
        cleanupCurrentAudio();
        pendingPlayback = null;
        setXiaoWuVoiceStatus("");
        if (typeof onEnd === "function") onEnd();
      };

      try {
        setXiaoWuVoiceStatus("🔊 正在回答……");
        await currentAudio.play();
        if (options.recordId) currentlySpeakingId = options.recordId;
        pendingPlayback = null;
        renderHistory();
        return true;
      } catch (playError) {
        console.warn(debugPrefix, "Azure audio autoplay blocked", playError);
        pendingPlayback = {
          recordId: options.recordId || "",
          text,
          audioUrl: currentAudioUrl
        };
        currentlySpeakingId = "";
        setXiaoWuVoiceStatus("");
        renderHistory();
        return false;
      }
    } catch (error) {
      console.warn(debugPrefix, "Azure Speech unavailable, falling back to SpeechSynthesis", error);
      cleanupCurrentAudio();
      pendingPlayback = null;
      return speakWithBrowserVoice(text, onEnd);
    }
  }

  window.speakWithXiaoWuVoice = speakWithXiaoWuVoice;

  function buildWidget() {
    const root = createElement("div", "xiaowu-chat-root");
    root.innerHTML = `
      <button class="xiaowu-chat-fab" id="xiaowuChatFab" type="button" aria-haspopup="dialog" aria-expanded="false">🌸 问小吴老师</button>
      <section class="xiaowu-chat-window hidden" id="xiaowuChatWindow" role="dialog" aria-modal="true" aria-label="小吴老师问答窗口">
        <header class="xiaowu-chat-header">
          <div>
            <strong>🌸 小吴老师</strong>
            <span>只陪小7学宅建。</span>
          </div>
          <button class="xiaowu-auto-speech-toggle" id="xiaowuAutoSpeechToggle" type="button" aria-pressed="${autoSpeechEnabled ? "true" : "false"}">${autoSpeechEnabled ? "🔊 自动朗读：开" : "🔇 自动朗读：关"}</button>
          <label class="xiaowu-speed-select-wrap" for="xiaowuSpeechSpeedSelect">
            <span>🔊 语速</span>
            <select id="xiaowuSpeechSpeedSelect" aria-label="选择小吴老师朗读语速">
              <option value="0.8">0.8x</option>
              <option value="1">1.0x</option>
              <option value="1.2">1.2x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2.0x</option>
            </select>
          </label>
          <label class="xiaowu-voice-select-wrap" for="xiaowuVoiceSelect">
            <span>声音</span>
            <select id="xiaowuVoiceSelect" aria-label="选择小吴老师声音">
              <option value="auto-male">男声优先</option>
            </select>
          </label>
          <button class="xiaowu-chat-close" id="xiaowuChatClose" type="button" aria-label="退出小吴老师">× 退出</button>
        </header>
        <div class="xiaowu-voice-status" id="xiaowuVoiceStatus" aria-live="polite"></div>
        <div class="xiaowu-chat-history" id="xiaowuChatHistory"></div>
        <form class="xiaowu-chat-form" id="xiaowuChatForm">
          <button class="xiaowu-voice-button" type="button" aria-label="语音输入">🎤</button>
          <textarea id="xiaowuChatInput" rows="2" placeholder="小7，问我宅建问题就好。比如：契約不適合責任怎么记？"></textarea>
          <button class="xiaowu-send-button" id="xiaowuChatSend" type="submit">发送</button>
        </form>
      </section>
    `;
    document.body.appendChild(root);

    document.querySelector("#xiaowuChatFab").addEventListener("click", openChat);
    document.querySelector("#xiaowuChatClose").addEventListener("click", closeChat);
    document.querySelector("#xiaowuAutoSpeechToggle").addEventListener("click", toggleAutoSpeech);
    document.querySelector("#xiaowuSpeechSpeedSelect").addEventListener("change", handleSpeechSpeedChange);
    document.querySelector("#xiaowuVoiceSelect").addEventListener("change", handleVoiceSelectChange);
    document.querySelector("#xiaowuChatForm").addEventListener("submit", handleSubmit);
    document.querySelector("#xiaowuChatSend").addEventListener("click", () => {
      console.log(debugPrefix, "send button clicked");
    });
    document.querySelector(".xiaowu-voice-button").addEventListener("click", toggleVoiceInput);
    document.querySelector("#xiaowuChatInput").addEventListener("keydown", handleInputKeydown);
    populateVoiceSelect();
    updateSpeechSpeedSelect();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = populateVoiceSelect;
    }
    startHistoryAutoSync();
    loadServerChatTime();
    flushPendingHistoryRecords();
    renderHistory();
  }

  function openChat() {
    isOpen = true;
    pageScrollBeforeChat = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.classList.add("xiaowu-chat-open");
    document.body.style.top = `-${pageScrollBeforeChat}px`;
    document.querySelector("#xiaowuChatWindow").classList.remove("hidden");
    document.querySelector("#xiaowuChatFab").setAttribute("aria-expanded", "true");
    startChatTimer();
    renderHistory();
    loadServerChatTime();
    flushPendingHistoryRecords();
    loadServerHistory();
    checkMicrophonePermissionForChat();
    setTimeout(() => document.querySelector("#xiaowuChatInput")?.focus(), 50);
  }

  async function checkMicrophonePermissionForChat() {
    const permissionState = await getMicrophonePermissionState();
    console.log(debugPrefix, "microphone permission state", permissionState);
    if (permissionState === "denied") {
      showChatNotice("🌸 小7，请到浏览器设置开启麦克风权限。");
    }
  }

  function closeChat() {
    stopChatTimer();
    isOpen = false;
    expandedIds = new Set();
    collapsedIds = new Set();
    localStorage.setItem(collapsedKey, "1");
    document.querySelector("#xiaowuChatWindow").classList.add("hidden");
    document.querySelector("#xiaowuChatFab").setAttribute("aria-expanded", "false");
    document.body.classList.remove("xiaowu-chat-open");
    document.body.style.top = "";
    stopVoiceInput({ forceAbort: true });
    stopXiaoWuSpeech();
    renderHistory();
    requestAnimationFrame(() => window.scrollTo(0, pageScrollBeforeChat));
  }

  function toggleAutoSpeech() {
    autoSpeechEnabled = !autoSpeechEnabled;
    localStorage.setItem(autoSpeechKey, autoSpeechEnabled ? "1" : "0");
    updateAutoSpeechToggle();
    if (!autoSpeechEnabled) stopXiaoWuSpeech();
  }

  function updateAutoSpeechToggle() {
    const toggle = document.querySelector("#xiaowuAutoSpeechToggle");
    if (!toggle) return;
    toggle.textContent = autoSpeechEnabled ? "🔊 自动朗读：开" : "🔇 自动朗读：关";
    toggle.setAttribute("aria-pressed", autoSpeechEnabled ? "true" : "false");
  }

  function updateSpeechSpeedSelect() {
    const select = document.querySelector("#xiaowuSpeechSpeedSelect");
    if (!select) return;
    select.value = String(xiaoWuVoiceSpeed);
  }

  function handleSpeechSpeedChange(event) {
    const nextSpeed = Number(event.target.value);
    xiaoWuVoiceSpeed = [0.8, 1, 1.2, 1.5, 2].includes(nextSpeed) ? nextSpeed : 1;
    localStorage.setItem(speechSpeedKey, String(xiaoWuVoiceSpeed));
  }

  function scoreVoiceForList(voice) {
    const name = voice.name || "";
    const maleWords = ["Eddy", "Reed", "Rocko", "Grandpa", "Otoya", "Yunxi", "Yunjian", "Yunyang", "Kangkang", "Danny", "Daniel", "Thomas", "Paul", "Mark", "David"];
    const naturalWords = ["Natural", "Premium", "Enhanced", "Neural", "Online"];
    const maleHit = maleWords.some((word) => name.toLowerCase().includes(word.toLowerCase()));
    const naturalHit = naturalWords.some((word) => name.toLowerCase().includes(word.toLowerCase()));
    const langScore = voice.lang?.startsWith("zh") ? 0 : voice.lang?.startsWith("ja") ? 1 : voice.lang?.startsWith("en") ? 2 : 3;
    return (maleHit ? 0 : 20) + langScore + (naturalHit ? 0 : 5);
  }

  function populateVoiceSelect() {
    const select = document.querySelector("#xiaowuVoiceSelect");
    if (!select || !("speechSynthesis" in window)) return;

    const voices = window.speechSynthesis.getVoices();
    const currentValue = selectedVoiceURI || "auto-male";
    select.innerHTML = '<option value="auto-male">男声优先</option>';

    voices
      .slice()
      .sort((left, right) => scoreVoiceForList(left) - scoreVoiceForList(right))
      .forEach((voice) => {
        const option = document.createElement("option");
        option.value = voice.voiceURI;
        option.textContent = `${voice.name}｜${voice.lang || "unknown"}`;
        select.appendChild(option);
      });

    if ([...select.options].some((option) => option.value === currentValue)) {
      select.value = currentValue;
    } else {
      select.value = "auto-male";
      selectedVoiceURI = "auto-male";
    }
  }

  function handleVoiceSelectChange(event) {
    selectedVoiceURI = event.target.value || "auto-male";
    localStorage.setItem(voiceChoiceKey, selectedVoiceURI);
    stopXiaoWuSpeech();
  }

  async function toggleVoiceInput() {
    if (voiceInputActive || isListening) {
      stopVoiceInput();
      return;
    }
    const isInterruptingSpeech = Boolean(currentlySpeakingId || currentAudio || ("speechSynthesis" in window && window.speechSynthesis.speaking));
    if (isInterruptingSpeech) {
      stopXiaoWuSpeech();
      await startVoiceInput({ autoSend: true });
      return;
    }
    await startVoiceInput();
  }

  async function startVoiceInput(options = {}) {
    const Recognition = getSpeechRecognitionConstructor();
    const listeningMessage = options.autoSend ? "🎙️ 小吴先听小7说，听完会自动发送。" : "🎙️ 正在听小7说话……";

    if (!Recognition) {
      showChatNotice("🌸 小7，这个浏览器暂时不支持语音输入，可以先打字问小吴老师。");
      return;
    }

    stopVoiceInput({ silent: true, forceAbort: true });
    stopXiaoWuSpeech({ silent: true });

    const permissionState = await getMicrophonePermissionState();
    if (permissionState === "denied") {
      showChatNotice("🌸 小7，请到浏览器设置开启麦克风权限。");
      setXiaoWuVoiceStatus("");
      return;
    }

    const sessionId = Date.now();
    voiceSessionId = sessionId;
    voiceInputActive = true;
    voiceAutoSend = Boolean(options.autoSend);
    startRecognitionSession(Recognition, sessionId, listeningMessage, permissionState);
  }

  function startRecognitionSession(Recognition, sessionId, listeningMessage, permissionState = "unknown") {
    const voiceButton = document.querySelector(".xiaowu-voice-button");
    const input = document.querySelector("#xiaowuChatInput");
    const activeRecognition = new Recognition();
    recognition = activeRecognition;
    activeRecognition.lang = getSpeechLanguage();
    activeRecognition.interimResults = true;
    activeRecognition.continuous = false;
    activeRecognition.maxAlternatives = 1;

    const originalValue = input?.value || "";
    let sessionFinalTranscript = "";
    let hadResult = false;
    let voiceErrorMessage = "";

    activeRecognition.onstart = () => {
      if (voiceSessionId !== sessionId) return;
      isListening = true;
      if (voiceButton) {
        voiceButton.classList.add("listening");
        voiceButton.textContent = voiceAutoSend ? "🎙️ 插话中……" : "🎙️ 正在听小7说话……";
        voiceButton.setAttribute("aria-label", "正在听小7说话，再次点击停止");
        voiceButton.title = voiceAutoSend ? "小吴正在听小7插话，停顿后会自动发送。" : "正在听小7说话……";
      }
      document.querySelector("#xiaowuChatForm")?.classList.add("listening");
      setXiaoWuVoiceStatus("🎤 正在听……");
      showChatNotice(listeningMessage);
    };

    activeRecognition.onresult = (event) => {
      if (voiceSessionId !== sessionId) return;
      let interimTranscript = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript || "";
        if (event.results[index].isFinal) {
          sessionFinalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      hadResult = Boolean((sessionFinalTranscript || interimTranscript).trim());
      if (input) {
        const spokenText = `${sessionFinalTranscript}${interimTranscript}`.trim();
        const nextText = `${originalValue}${originalValue && spokenText ? " " : ""}${spokenText}`.trimStart();
        input.value = nextText;
      }
      if (voiceAutoSend && hadResult) scheduleVoiceAutoSend(sessionId);
    };

    activeRecognition.onerror = (event) => {
      if (voiceSessionId !== sessionId) return;
      console.error(debugPrefix, "speech recognition failed", event);
      const errorMessages = {
        "audio-capture": "🌸 小7，没有找到麦克风。可以检查一下浏览器麦克风权限。",
        "not-allowed": "🌸 小7，请到浏览器设置开启麦克风权限。",
        "service-not-allowed": "🌸 小7，浏览器暂时不允许语音输入，可以先打字问小吴老师。",
        "no-speech": "🌸 小7，这次没有听到声音，小吴还在继续听。",
        "network": "🌸 小7，语音识别网络有点卡，可以再试一次。"
      };
      voiceErrorMessage = errorMessages[event.error] || "🌸 小7，刚才没有听清楚。可以再点一次麦克风，慢慢说。";
      showChatNotice(voiceErrorMessage);
      const fatalErrors = ["audio-capture", "not-allowed", "service-not-allowed"];
      if (fatalErrors.includes(event.error)) {
        resetVoiceInputState({ keepNotice: true, sessionId });
      }
    };

    activeRecognition.onend = () => {
      if (voiceSessionId !== sessionId) return;
      cleanupRecognitionHandlers(activeRecognition);
      recognition = null;
      isListening = false;

      if (sessionFinalTranscript.trim()) {
        clearChatNotice(listeningMessage);
      }

      resetVoiceInputState({ keepNotice: Boolean(voiceErrorMessage) || !hadResult, sessionId });
      input?.focus();
    };

    try {
      activeRecognition.start();
    } catch (error) {
      console.error(debugPrefix, "speech recognition start failed", error);
      showChatNotice(permissionState === "prompt"
        ? "🌸 小7，请允许浏览器使用麦克风后再试一次。"
        : "🌸 小7，这个浏览器暂时不支持语音输入，可以先打字问小吴老师。");
      resetVoiceInputState({ keepNotice: true, sessionId });
    }
  }

  function stopVoiceInput(options = {}) {
    voiceInputActive = false;
    voiceAutoSend = false;
    clearVoiceAutoSendTimer();
    const activeRecognition = recognition;
    if (activeRecognition) {
      try {
        activeRecognition.abort();
      } catch (error) {
        console.error(debugPrefix, "speech recognition abort failed", error);
      }
      try {
        activeRecognition.stop();
      } catch (error) {
        console.error(debugPrefix, "speech recognition stop cleanup failed", error);
      }
    }
    resetVoiceInputState(options);
  }

  function cleanupRecognitionHandlers(targetRecognition = recognition) {
    if (targetRecognition) {
      targetRecognition.onstart = null;
      targetRecognition.onresult = null;
      targetRecognition.onerror = null;
      targetRecognition.onend = null;
    }
  }

  function clearVoiceAutoSendTimer() {
    if (voiceAutoSendTimer) {
      window.clearTimeout(voiceAutoSendTimer);
      voiceAutoSendTimer = null;
    }
  }

  function scheduleVoiceAutoSend(sessionId) {
    clearVoiceAutoSendTimer();
    voiceAutoSendTimer = window.setTimeout(() => {
      if (voiceSessionId !== sessionId || !voiceAutoSend) return;
      const input = document.querySelector("#xiaowuChatInput");
      if (!input?.value.trim() || isSending) return;
      document.querySelector("#xiaowuChatForm")?.requestSubmit();
    }, 1300);
  }

  function resetVoiceInputState(options = {}) {
    if (options.sessionId && options.sessionId !== voiceSessionId) return;
    const voiceButton = document.querySelector(".xiaowu-voice-button");
    if (voiceListenTimer) {
      window.clearTimeout(voiceListenTimer);
      voiceListenTimer = null;
    }
    if (!options.sessionId) voiceSessionId += 1;
    clearVoiceAutoSendTimer();
    cleanupRecognitionHandlers();
    recognition = null;
    isListening = false;
    voiceInputActive = false;
    voiceAutoSend = false;
    setXiaoWuVoiceStatus("");
    if (voiceButton) {
      voiceButton.classList.remove("listening");
      voiceButton.textContent = "🎤";
      voiceButton.setAttribute("aria-label", "语音输入");
      voiceButton.title = "";
    }
    document.querySelector("#xiaowuChatForm")?.classList.remove("listening");
    if (!options.keepNotice && historySyncMessage.startsWith("🎙️")) {
      historySyncMessage = "";
      renderHistory();
    }
  }

  function handleInputKeydown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      document.querySelector("#xiaowuChatForm").requestSubmit();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSending) return;

    const input = document.querySelector("#xiaowuChatInput");
    stopVoiceInput({ forceAbort: true, silent: true });
    const message = input.value.trim();
    if (!message) return;

    const record = {
      id: `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      question: message,
      answer: "",
      lessonLinks: [],
      createdAt: new Date().toISOString(),
      status: "sending"
    };

    chatRecords = [...chatRecords, record];
    expandedIds = new Set([record.id]);
    saveRecords();
    saveServerRecord(record);
    input.value = "";
    setSending(true);
    setXiaoWuVoiceStatus("🧠 正在思考……");
    renderHistory();
    scrollHistoryToBottom();

    try {
      console.log(debugPrefix, "fetch start", {
        url: apiEndpoint,
        currentLessonId: getCurrentLessonId(),
        messageLength: message.length
      });

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          currentLessonId: getCurrentLessonId(),
          chatHistory: chatRecords
            .filter((item) => item.answer)
            .slice(-maxHistoryForApi)
            .map((item) => ({ question: item.question, answer: item.answer }))
        })
      });

      const data = await response.json().catch(() => ({}));
      console.log(debugPrefix, "fetch complete", {
        url: apiEndpoint,
        status: response.status,
        ok: response.ok
      });
      const answer = data.reply || "🌸 小7，小吴老师刚才没能回答成功。稍后再问我一次，好不好？";
      updateRecord(record.id, {
        answer,
        lessonLinks: normalizeLessonLinks(data.lessonLinks),
        status: response.ok ? "done" : "error"
      });
      renderHistory();
      scrollHistoryToBottom();
      maybeAutoSpeak(record.id, answer);
      await saveServerRecord({ ...record, answer, lessonLinks: normalizeLessonLinks(data.lessonLinks), status: response.ok ? "done" : "error" });
    } catch (error) {
      console.error(debugPrefix, "fetch failed", {
        url: apiEndpoint,
        error
      });
      updateRecord(record.id, {
        answer: "🌸 小7，小吴老师现在连不上课堂。请确认后端接口已经启动，再问我一次。",
        lessonLinks: [],
        status: "error"
      });
      renderHistory();
      scrollHistoryToBottom();
      maybeAutoSpeak(record.id, "🌸 小7，小吴老师现在连不上课堂。请确认后端接口已经启动，再问我一次。");
      await saveServerRecord({
        ...record,
        answer: "🌸 小7，小吴老师现在连不上课堂。请确认后端接口已经启动，再问我一次。",
        lessonLinks: [],
        status: "error"
      });
    } finally {
      setSending(false);
      renderHistory();
      expandedIds.add(record.id);
      renderHistory();
      scrollHistoryToBottom();
    }
  }

  async function loadServerHistory() {
    if (isHistoryLoading) return;
    isHistoryLoading = true;
    try {
      console.log(debugPrefix, "history fetch start", { url: historyEndpoint });
      const response = await fetch(historyEndpoint, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !Array.isArray(data.records)) {
        const error = new Error(data.message || `History request failed with ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      chatRecords = mergeRecords(readRecords(), data.records);
      historySyncMessage = "";
      saveRecords();
      renderHistory();
      scrollHistoryToBottom();
      console.log(debugPrefix, "history fetch complete", {
        url: historyEndpoint,
        status: response.status,
        records: data.records.length
      });
    } catch (error) {
      showCloudMemoryError("GET /api/xiaowu-history", {
        status: error.status,
        serverError: error.data?.error,
        serverMessage: error.data?.message,
        detail: error.data?.detail,
        error
      });
      chatRecords = mergeRecords(chatRecords, readRecords());
    } finally {
      isHistoryLoading = false;
    }
  }

  async function flushPendingHistoryRecords() {
    const pendingRecords = readPendingHistoryRecords();
    if (!pendingRecords.length) return;

    console.log(debugPrefix, "history pending sync start", {
      url: historyEndpoint,
      count: pendingRecords.length
    });

    for (const record of pendingRecords) {
      await saveServerRecord(record, { alreadyQueued: true });
    }
  }

  function startHistoryAutoSync() {
    if (historyAutoSyncTimerId) return;
    historyAutoSyncTimerId = window.setInterval(() => {
      flushPendingHistoryRecords();
    }, 10000);
  }

  function flushPendingHistoryRecordsWithBeacon() {
    if (!navigator.sendBeacon) return;
    const pendingRecords = readPendingHistoryRecords();
    if (!pendingRecords.length) return;

    pendingRecords.forEach((record) => {
      if (!record?.question) return;
      const payload = JSON.stringify({
        id: record.id,
        question: record.question,
        answer: record.answer || "",
        lessonLinks: normalizeLessonLinks(record.lessonLinks),
        createdAt: record.createdAt,
        status: record.status || (record.answer ? "done" : "sending"),
        lessonId: getCurrentLessonId(),
        deviceInfo: getDeviceInfo()
      });
      navigator.sendBeacon(historyEndpoint, new Blob([payload], { type: "application/json" }));
    });
  }

  async function saveServerRecord(record, options = {}) {
    if (!record?.question) return false;

    if (!options.alreadyQueued) {
      queuePendingHistoryRecord(record);
    }

    const payload = {
      id: record.id,
      question: record.question,
      answer: record.answer || "",
      lessonLinks: normalizeLessonLinks(record.lessonLinks),
      createdAt: record.createdAt,
      status: record.status || (record.answer ? "done" : "sending"),
      lessonId: getCurrentLessonId(),
      deviceInfo: getDeviceInfo()
    };

    try {
      const response = await fetch(historyEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(data.message || `History save failed with ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }
      historySyncMessage = "";
      removePendingHistoryRecord(record.id);
      console.log(debugPrefix, "history save complete", {
        url: historyEndpoint,
        status: response.status,
        recordsCount: data.recordsCount
      });
      return true;
    } catch (error) {
      showCloudMemoryError("POST /api/xiaowu-history", {
        status: error.status,
        serverError: error.data?.error,
        serverMessage: error.data?.message,
        detail: error.data?.detail,
        error
      });
      return false;
    }
  }

  window.xiaoWuCheckCloudMemory = async function xiaoWuCheckCloudMemory() {
    const testId = `cloud-test-${Date.now()}`;
    const report = {
      endpoint: historyEndpoint,
      getBefore: null,
      post: null,
      getAfter: null
    };

    async function readResponse(response) {
      const data = await response.json().catch(() => ({}));
      return {
        ok: response.ok,
        status: response.status,
        error: data.error || "",
        message: data.message || "",
        detail: data.detail || "",
        recordsCount: Array.isArray(data.records) ? data.records.length : data.recordsCount
      };
    }

    try {
      report.getBefore = await readResponse(await fetch(historyEndpoint, { headers: { "Accept": "application/json" } }));
      report.post = await readResponse(await fetch(historyEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: testId,
          question: "云端记忆连接测试",
          answer: "云端记忆测试成功",
          status: "done",
          createdAt: new Date().toISOString(),
          lessonId: getCurrentLessonId(),
          deviceInfo: getDeviceInfo()
        })
      }));
      report.getAfter = await readResponse(await fetch(historyEndpoint, { headers: { "Accept": "application/json" } }));
      console.log(debugPrefix, "cloud memory check", report);
      return report;
    } catch (error) {
      report.error = String(error?.message || error);
      console.error(debugPrefix, "cloud memory check failed", report);
      return report;
    }
  };

  function normalizeLessonLinks(links) {
    if (!Array.isArray(links)) return [];
    return links
      .filter((link) => link && lessonTitles[link.lessonId])
      .map((link) => ({
        lessonId: link.lessonId,
        label: link.label || `📖 打开 ${link.lessonId.replace("lesson-", "Lesson")}`
      }))
      .slice(0, 3);
  }

  function updateRecord(id, patch) {
    chatRecords = chatRecords.map((item) => item.id === id ? { ...item, ...patch } : item);
    saveRecords();
  }

  function setSending(nextValue) {
    isSending = nextValue;
    const sendButton = document.querySelector("#xiaowuChatSend");
    const input = document.querySelector("#xiaowuChatInput");
    if (sendButton) {
      sendButton.disabled = nextValue;
      sendButton.textContent = nextValue ? "思考中" : "发送";
    }
    if (input) input.disabled = nextValue;
    if (!nextValue && !currentlySpeakingId && !isListening) setXiaoWuVoiceStatus("");
  }

  function toggleAnswerSpeech(record) {
    if (!record?.answer || record.status === "sending") return;

    if (currentlySpeakingId === record.id && "speechSynthesis" in window) {
      stopXiaoWuSpeech();
      return;
    }

    startAnswerSpeech(record.id, record.answer);
  }

  function maybeAutoSpeak(recordId, answer) {
    if (!autoSpeechEnabled || !isOpen) return;
    requestAnimationFrame(() => startAnswerSpeech(recordId, answer));
  }

  function startAnswerSpeech(recordId, answer) {
    currentlySpeakingId = recordId;
    speakWithXiaoWuVoice(answer, () => {
      currentlySpeakingId = "";
      renderHistory();
    }, { recordId });
    renderHistory();
  }

  function playPendingXiaoWuSpeech(record) {
    if (!pendingPlayback?.audioUrl || pendingPlayback.recordId !== record.id) {
      startAnswerSpeech(record.id, record.answer);
      return;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    currentlySpeakingId = record.id;
    currentAudioUrl = pendingPlayback.audioUrl;
    if (!currentAudio || currentAudio.src !== currentAudioUrl) {
      currentAudio = new Audio(currentAudioUrl);
    }
    currentAudio.volume = 1;
    currentAudio.onended = () => {
      cleanupCurrentAudio();
      pendingPlayback = null;
      currentlySpeakingId = "";
      renderHistory();
    };
    currentAudio.onerror = () => {
      cleanupCurrentAudio();
      pendingPlayback = null;
      currentlySpeakingId = "";
      renderHistory();
    };
    currentAudio.play().then(() => {
      pendingPlayback = null;
      renderHistory();
    }).catch((error) => {
      console.warn(debugPrefix, "manual Azure playback failed", error);
      pendingPlayback = null;
      currentlySpeakingId = "";
      speakWithBrowserVoice(record.answer, () => renderHistory());
      renderHistory();
    });
    renderHistory();
  }

  function stopXiaoWuSpeech(options = {}) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    cleanupCurrentAudio();
    if (!options.keepPending) pendingPlayback = null;
    currentlySpeakingId = "";
    setXiaoWuVoiceStatus("");
    if (!options.silent) renderHistory();
  }

  function renderHistory() {
    const history = document.querySelector("#xiaowuChatHistory");
    if (!history) return;
    history.innerHTML = "";
    const latestRecordId = getLatestRecordId();

    if (historySyncMessage) {
      const syncNote = createElement("div", "xiaowu-sync-note", historySyncMessage);
      history.appendChild(syncNote);
    }

    if (!chatRecords.length) {
      const empty = createElement("div", "xiaowu-chat-empty");
      empty.innerHTML = "小7，还没有问过小吴老师。<br>可以从今天的课程、错题、过去问开始。";
      history.appendChild(empty);
      return;
    }

    chatRecords.forEach((record) => {
      const expanded = !collapsedIds.has(record.id) && (record.id === latestRecordId || expandedIds.has(record.id));
      const item = createElement("article", `xiaowu-chat-item${expanded ? " expanded" : ""}`);

      const userRow = createElement("div", "xiaowu-message-row user");
      const userBubble = createElement("div", "xiaowu-message-bubble user");
      const userMeta = createElement("div", "xiaowu-message-meta");
      userMeta.innerHTML = `<span>小7</span><time>${formatTime(record.createdAt)}</time>`;
      const userText = createElement("p", "xiaowu-question-text", record.question);
      userBubble.appendChild(userMeta);
      userBubble.appendChild(userText);
      userRow.appendChild(userBubble);
      item.appendChild(userRow);

      const toggleButton = createElement("button", "xiaowu-answer-toggle", expanded ? "▼ 收起回答" : "▶ 展开回答");
      toggleButton.type = "button";
      toggleButton.addEventListener("click", () => {
        if (expanded) {
          expandedIds.delete(record.id);
          collapsedIds.add(record.id);
        } else {
          expandedIds.add(record.id);
          collapsedIds.delete(record.id);
        }
        renderHistory();
      });
      item.appendChild(toggleButton);

      if (expanded) {
        const answerRow = createElement("div", "xiaowu-message-row teacher");
        const avatar = createElement("div", "xiaowu-teacher-avatar", "🌸");
        const answer = createElement("div", "xiaowu-message-bubble teacher");
        const answerMeta = createElement("div", "xiaowu-message-meta");
        answerMeta.innerHTML = `<span>小吴老师</span><time>${formatTime(record.createdAt)}</time>`;
        const answerText = createElement("div", "xiaowu-answer-markdown");
        answerText.innerHTML = record.status === "sending"
          ? "<p>🌸 小吴老师正在认真想这题...</p>"
          : renderMarkdown(record.answer);
        answer.appendChild(answerMeta);
        answer.appendChild(answerText);

        if (record.answer && record.status !== "sending") {
          const isPendingPlayback = pendingPlayback?.recordId === record.id;
          const speechButton = createElement(
            "button",
            "xiaowu-speech-button",
            currentlySpeakingId === record.id ? "⏹ 停止" : (isPendingPlayback ? "▶ 播放小吴老师声音" : "🔊 重听")
          );
          speechButton.type = "button";
          speechButton.addEventListener("click", () => {
            if (isPendingPlayback) {
              playPendingXiaoWuSpeech(record);
            } else {
              toggleAnswerSpeech(record);
            }
          });
          answer.appendChild(speechButton);
        }

        if (record.lessonLinks?.length) {
          const links = createElement("div", "xiaowu-lesson-links");
          record.lessonLinks.forEach((link) => {
            const anchor = createElement("a", "xiaowu-lesson-link", link.label);
            anchor.href = `course.html?id=${link.lessonId}`;
            anchor.title = lessonTitles[link.lessonId] || link.label;
            links.appendChild(anchor);
          });
          answer.appendChild(links);
        }

        answerRow.appendChild(avatar);
        answerRow.appendChild(answer);
        item.appendChild(answerRow);
      }

      history.appendChild(item);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildWidget);
  } else {
    buildWidget();
  }

  document.addEventListener("visibilitychange", () => {
    if (!isOpen) return;
    if (document.visibilityState === "hidden") {
      stopChatTimer();
    } else {
      startChatTimer();
    }
  });

  window.addEventListener("beforeunload", () => {
    flushPendingHistoryRecordsWithBeacon();
    stopChatTimer();
  });
  window.addEventListener("pagehide", flushPendingHistoryRecordsWithBeacon);
})();
