const totalInput = document.querySelector("#totalQuestions");
const correctInput = document.querySelector("#correctQuestions");
const scoreBox = document.querySelector("#scoreBox");

function updateScoreAdvice() {
  const total = Number(totalInput.value);
  const correct = Number(correctInput.value);

  if (!total || total < 1) {
    scoreBox.textContent = "填写做题数量和正确题数后，这里会显示今日判断。";
    return;
  }

  const safeCorrect = Math.min(Math.max(correct, 0), total);
  const rate = Math.round((safeCorrect / total) * 100);

  if (rate >= 70) {
    scoreBox.textContent = `正确率 ${rate}%。明天可以进入“宅建士制度”，但先用 10 分钟复习免許制度。`;
    return;
  }

  scoreBox.textContent = `正确率 ${rate}%。明天先继续补“免許制度”，不要急着进入新主题。`;
}

totalInput.addEventListener("input", updateScoreAdvice);
correctInput.addEventListener("input", updateScoreAdvice);
