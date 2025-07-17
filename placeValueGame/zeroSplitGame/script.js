const totalQuestions = 20;
let currentIndex = 0;
let correctCount = 0;
let answerParts = [];
let inputParts = [];
let startTime;
const incorrectIndexes = new Set();

const COLORS = [
  "#f59e0b", // 주황
  "#ef4444", // 빨강
  "#0ea5e9", // 파랑
  "#10b981", // 초록
  "#8b5cf6", // 보라
  "#f97316", // 주황2
  "#2563eb"  // 파랑2
];

function startGame() {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  document.getElementById("resultScreen").style.display = "none";
  currentIndex = 0;
  correctCount = 0;
  incorrectIndexes.clear();
  generateProgressGrid();
  startTime = new Date();
  generateNextQuestion();
}

function generateProgressGrid() {
  const grid = document.getElementById("progressGrid");
  grid.innerHTML = '';
  for (let i = 0; i < totalQuestions; i++) {
    const box = document.createElement("div");
    box.className = "progress-btn";
    box.id = `progress-${i}`;
    box.addEventListener("click", () => {
      if (incorrectIndexes.has(i)) {
        currentIndex = i;
        generateNextQuestion();
      }
    });
    grid.appendChild(box);
  }
}

function countTrailingZeros(n) {
  return (n.toString().match(/0+$/) || [''])[0].length;
}

function generateNextQuestion() {
  if (currentIndex >= totalQuestions) {
    const elapsed = Math.floor((new Date() - startTime) / 1000);
    document.getElementById("gameArea").style.display = "none";
    document.getElementById("resultScreen").style.display = "block";
    document.getElementById("score").textContent = `${correctCount} / ${totalQuestions}`;
    document.getElementById("time").textContent = `⏱ 걸린 시간: ${elapsed}초`;
    return;
  }

  inputParts = [];

  const leftOptions = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 1000];
  const rightOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200];
  let a = leftOptions[Math.floor(Math.random() * leftOptions.length)];
  let b = rightOptions[Math.floor(Math.random() * rightOptions.length)];

  const aZeros = countTrailingZeros(a);
  const bZeros = countTrailingZeros(b);
  const coreA = a / Math.pow(10, aZeros);
  const coreB = b / Math.pow(10, bZeros);
  const productCore = coreA * coreB;
  const totalZeros = aZeros + bZeros;
  const zeroPart = "0".repeat(totalZeros);

  answerParts = [productCore.toString(), zeroPart];

  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const questionBox = document.getElementById("questionBox");
  const answerBox = document.getElementById("answerBox");
  questionBox.style.backgroundColor = "transparent";
  questionBox.style.color = color;
  answerBox.style.backgroundColor = "transparent";
  answerBox.style.borderColor = color;
  document.getElementById("slot-0").style.color = color;
  document.getElementById("slot-1").style.color = color;
  questionBox.innerHTML = `${a} × ${b} =`;
  document.getElementById("slot-0").textContent = "";
  document.getElementById("slot-1").textContent = "";

  renderNumberChoices(productCore.toString(), a, b);
  renderZeroChoices(zeroPart);
}

function renderNumberChoices(correctNum, a, b) {
  const box = document.getElementById("numberChoices");
  box.innerHTML = '';
  const choices = generateSmartDistractors(correctNum, a, b);
  choices.forEach(text => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = text;
    btn.onclick = () => handleChoice(text);
    box.appendChild(btn);
  });
}

function renderZeroChoices(correctZeros) {
  const box = document.getElementById("zeroChoices");
  box.innerHTML = '';
  const zerosList = ["0", "00", "000", "0000", "00000"];
  zerosList.forEach(z => {
    const btn = document.createElement("button");
    btn.className = "choice-btn zero";
    btn.textContent = z || '""';
    btn.onclick = () => handleChoice(z);
    box.appendChild(btn);
  });
}

function handleChoice(value) {
  if (inputParts.length >= 2) return;
  inputParts.push(value);
  const slot = document.getElementById(`slot-${inputParts.length - 1}`);
  slot.textContent = value;

  if (inputParts.length === 2) {
    const correct = inputParts[0] === answerParts[0] && inputParts[1] === answerParts[1];
    const resultBox = document.getElementById(`progress-${currentIndex}`);
    resultBox.classList.remove("correct", "incorrect");
    resultBox.classList.add(correct ? 'correct' : 'incorrect');

    if (correct) {
      document.getElementById("correctSound").play();
      correctCount++;
      incorrectIndexes.delete(currentIndex);
    } else {
      document.getElementById("wrongSound").play();
      incorrectIndexes.add(currentIndex);
    }

    currentIndex++;
    setTimeout(generateNextQuestion, 1000);
  }
}

function generateSmartDistractors(correct, a, b) {
  const correctNum = parseFloat(correct);
  const set = new Set([correct]);
  const deltas = [1, -1, 2, -2, 5, -5];
  deltas.forEach(d => {
    let alt = correctNum + d;
    if (alt > 0 && alt < 999 && !set.has(alt.toString())) {
      set.add(alt.toString());
    }
  });
  const alt1 = (a + 10) * b;
  const alt2 = a * (b + 10);
  [alt1, alt2].forEach(val => {
    const stripped = val / Math.pow(10, countTrailingZeros(val));
    if (!set.has(stripped.toString()) && stripped < 999) {
      set.add(stripped.toString());
    }
  });
  return Array.from(set).slice(0, 5).sort(() => Math.random() - 0.5);
}

function endGame() {
  const endTime = Date.now();
  const durationSec = Math.floor((endTime - startTime) / 1000);
  const score = Math.round((correctCount / totalQuestions) * 100);

  document.getElementById("score").textContent = `점수: ${score}점`;
  document.getElementById("time").textContent = `⏱ 걸린 시간: ${durationSec}초`;

  document.getElementById("progressGrid").style.display = "none";
  document.getElementById("questionBox").style.display = "none";
  document.getElementById("numberChoices").style.display = "none";
  document.getElementById("zeroChoices").style.display = "none";

  const recDiv = document.getElementById("recommendation");
  recDiv.innerHTML = `
    <button onclick="startGame()" class="result-btn-primary">다시할게요</button><br>
    <button onclick="stopGame()" class="result-btn-secondary">그만할래요</button>
  `;

  document.getElementById("resultScreen").style.display = 'block';
}

function stopGame() {
  alert("수고하셨어요! 게임을 종료합니다.");
  location.reload();
}
