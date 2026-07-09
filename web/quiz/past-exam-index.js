window.xiaoWuPastExamIndex = [
  "令和8年",
  "令和7年",
  "令和6年",
  "令和5年",
  "令和4年",
  "令和3年",
  "令和2年",
  "令和元年",
  "平成30年"
].map((label) => ({
  examId: label.replace(/[年月]/g, "").replace("令和元", "r01").replace("平成", "h"),
  label,
  totalQuestions: 50,
  durationMinutes: 120,
  order: "official",
  questions: []
}));
