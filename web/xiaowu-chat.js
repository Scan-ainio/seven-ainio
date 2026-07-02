(() => {
  const storageKey = "takken_xiaowu_teacher_chat_v1";
  const collapsedKey = "takken_xiaowu_teacher_collapsed_v1";
  const apiEndpoint = "/api/xiaowu-chat";
  const maxHistoryForApi = 8;

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

  function buildWidget() {
    const root = createElement("div", "xiaowu-chat-root");
    root.innerHTML = `
      <button class="xiaowu-chat-fab" id="xiaowuChatFab" type="button" aria-haspopup="dialog" aria-expanded="false">🌸 问小吴老师</button>
      <section class="xiaowu-chat-window hidden" id="xiaowuChatWindow" role="dialog" aria-label="小吴老师问答窗口">
        <header class="xiaowu-chat-header">
          <div>
            <strong>🌸 小吴老师</strong>
            <span>只陪小7学宅建。</span>
          </div>
          <button class="xiaowu-chat-close" id="xiaowuChatClose" type="button" aria-label="关闭小吴老师">×</button>
        </header>
        <div class="xiaowu-chat-history" id="xiaowuChatHistory"></div>
        <form class="xiaowu-chat-form" id="xiaowuChatForm">
          <button class="xiaowu-voice-button" type="button" aria-label="语音功能预留">🎤</button>
          <textarea id="xiaowuChatInput" rows="2" placeholder="小7，问我宅建问题就好。比如：契約不適合責任怎么记？"></textarea>
          <button class="xiaowu-send-button" id="xiaowuChatSend" type="submit">发送</button>
        </form>
      </section>
    `;
    document.body.appendChild(root);

    document.querySelector("#xiaowuChatFab").addEventListener("click", openChat);
    document.querySelector("#xiaowuChatClose").addEventListener("click", closeChat);
    document.querySelector("#xiaowuChatForm").addEventListener("submit", handleSubmit);
    document.querySelector("#xiaowuChatInput").addEventListener("keydown", handleInputKeydown);
    renderHistory();
  }

  function openChat() {
    isOpen = true;
    document.querySelector("#xiaowuChatWindow").classList.remove("hidden");
    document.querySelector("#xiaowuChatFab").setAttribute("aria-expanded", "true");
    renderHistory();
    setTimeout(() => document.querySelector("#xiaowuChatInput")?.focus(), 50);
  }

  function closeChat() {
    isOpen = false;
    expandedIds = new Set();
    localStorage.setItem(collapsedKey, "1");
    document.querySelector("#xiaowuChatWindow").classList.add("hidden");
    document.querySelector("#xiaowuChatFab").setAttribute("aria-expanded", "false");
    renderHistory();
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
    expandedIds.add(record.id);
    saveRecords();
    input.value = "";
    setSending(true);
    renderHistory();

    try {
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
      const answer = data.reply || "🌸 小7，小吴老师刚才没能回答成功。稍后再问我一次，好不好？";
      updateRecord(record.id, {
        answer,
        lessonLinks: normalizeLessonLinks(data.lessonLinks),
        status: response.ok ? "done" : "error"
      });
    } catch {
      updateRecord(record.id, {
        answer: "🌸 小7，小吴老师现在连不上课堂。请确认后端接口已经启动，再问我一次。",
        lessonLinks: [],
        status: "error"
      });
    } finally {
      setSending(false);
      renderHistory();
    }
  }

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
  }

  function renderHistory() {
    const history = document.querySelector("#xiaowuChatHistory");
    if (!history) return;
    history.innerHTML = "";

    if (!chatRecords.length) {
      const empty = createElement("div", "xiaowu-chat-empty");
      empty.innerHTML = "小7，还没有问过小吴老师。<br>可以从今天的课程、错题、过去问开始。";
      history.appendChild(empty);
      return;
    }

    chatRecords.slice().reverse().forEach((record) => {
      const expanded = expandedIds.has(record.id);
      const item = createElement("article", `xiaowu-chat-item${expanded ? " expanded" : ""}`);

      const questionButton = createElement("button", "xiaowu-question-button");
      questionButton.type = "button";
      questionButton.innerHTML = `
        <span class="xiaowu-question-text"></span>
        <time>${formatTime(record.createdAt)}</time>
      `;
      questionButton.querySelector(".xiaowu-question-text").textContent = `小7：${record.question}`;
      questionButton.addEventListener("click", () => {
        if (expandedIds.has(record.id)) {
          expandedIds.delete(record.id);
        } else {
          expandedIds.add(record.id);
        }
        renderHistory();
      });
      item.appendChild(questionButton);

      if (expanded) {
        const answer = createElement("div", "xiaowu-answer");
        const answerText = createElement("p");
        answerText.textContent = record.status === "sending" ? "🌸 小吴老师正在认真想这题..." : record.answer;
        answer.appendChild(answerText);

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

        item.appendChild(answer);
      }

      history.appendChild(item);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildWidget);
  } else {
    buildWidget();
  }
})();
