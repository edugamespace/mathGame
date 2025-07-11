
let currentIndex = 0;
let correctCount = 0;
let startTime = null;
const totalQuestions = 20;
let baseLevel = 0;
let addLevel = 0;

const baseRanges = [
  [1, 10], [1, 20], [1, 30], [1, 50], [30, 50], [40, 70], [1, 100], [30, 100]
];
const subRanges = [
  [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], 
  [1, 3], [1, 5], [3, 5], [3, 9], [1, 9]
];

// Improved fully shuffled pick
function shuffledPick(min, max, label) {
  if (!window._pickPools) window._pickPools = {};
  const key = `${label}-${min}-${max}`;

  if (!window._pickPools[key] || window._pickPools[key].pool.length === 0) {
    const numbers = [];
    const repetitions = 3;
    for (let i = 0; i < repetitions; i++) {
      for (let n = min; n <= max; n++) {
        numbers.push(n);
      }
    }
    // Fisher-Yates shuffle
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    window._pickPools[key] = { pool: numbers };
  }

  return window._pickPools[key].pool.pop();
}

const correctSound = new Audio('sounds/correct.mp3');
const wrongSound = new Audio('sounds/wrong.mp3');

function startGame() {
  correctCount = 0;
  currentIndex = 0;
  startTime = Date.now();
  document.getElementById("resultScreen").style.display = "none";
  document.getElementById("questionBox").style.display = "block";
  document.getElementById("choicesBox").style.display = "block";
  generateProgressGrid();
  generateNextQuestion();
}

function getCurrentRanges() {
  let base = baseRanges[Math.min(baseLevel, baseRanges.length - 1)];
  let sub = subRanges[Math.min(addLevel, subRanges.length - 1)];
  return { base, sub };
}

function generateProgressGrid() {
  const grid = document.getElementById("progressGrid");
  grid.innerHTML = '';
  for (let i = 0; i < totalQuestions; i++) {
    const btn = document.createElement("div");
    btn.className = "progress-btn";
    btn.id = `progress-${i}`;
    grid.appendChild(btn);
  }
}

function generateNextQuestion() {
  if (currentIndex >= totalQuestions) {
    endGame();
    return;
  }

  const { base, sub } = getCurrentRanges();
  let a = shuffledPick(...base, 'base');
  let b = shuffledPick(...sub, 'sub');

  if (a < b) [a, b] = [b, a]; // no negatives
  const correct = a - b;

  document.getElementById("questionBox").innerHTML = `<h2>${a} - ${b} = ?</h2>`;

  const options = new Set([correct]);
  while (options.size < 5) {
    let wrong = correct + Math.floor(Math.random() * 21) - 10;
    if (wrong !== correct && wrong >= 0) options.add(wrong);
  }

  const shuffled = [...options].sort(() => Math.random() - 0.5);
  const box = document.getElementById("choicesBox");
  box.innerHTML = '';
  shuffled.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.className = "choice-btn";
    btn.onclick = () => {
      const correctAnswer = (choice === correct);
      document.getElementById(`progress-${currentIndex}`).classList.add(correctAnswer ? 'correct' : 'incorrect');
      if (correctAnswer) {
        correctCount++;
        correctSound.play();
      } else {
        wrongSound.play();
      }
      currentIndex++;
      generateNextQuestion();
    };
    box.appendChild(btn);
  });
}

function endGame() {
  const endTime = Date.now();
  const durationSec = Math.floor((endTime - startTime) / 1000);
  const score = Math.round((correctCount / totalQuestions) * 100);

  document.getElementById("score").textContent = `점수: ${score}점`;
  document.getElementById("time").textContent = `소요 시간: ${durationSec}초`;

  const recDiv = document.getElementById("recommendation");
  recDiv.innerHTML = '';

  const passedTime = durationSec <= 60;
  const passedScore = score >= 85;

  if (passedTime && passedScore) {
    recDiv.innerHTML = `
      <p>참 잘했습니다. 다음 단계로 넘어가보세요 🎉</p>
      <button onclick="nextLevel()" style="font-size:1.5rem;">다음 단계로 넘어가기</button><br>
      <button onclick="stopGame()" style="font-size:0.8rem;">그만할래요</button>
      <button onclick="startGame()" style="font-size:0.8rem;">이번 단계 한 번 더</button>
    `;
    baseLevel++;
    if (baseLevel >= baseRanges.length) {
      baseLevel = 0;
      addLevel++;
    }
  } else {
    recDiv.innerHTML = `
      <p>끝났습니다. 이번 단계를 한 번 더 해보는 게 좋겠어요!</p>
      <button onclick="startGame()" style="font-size:1.5rem;">한번 더 해볼게요</button><br>
      <button onclick="stopGame()" style="font-size:0.8rem;">그만할래요</button>
      <button onclick="nextLevel()" style="font-size:0.8rem;">다음 단계로 넘어가기</button>
    `;
  }

  document.getElementById("resultScreen").style.display = 'block';
  document.getElementById("questionBox").style.display = 'none';
  document.getElementById("choicesBox").style.display = 'none';
}

function nextLevel() {
  startGame();
}

function stopGame() {
  alert("수고하셨어요! 게임을 종료합니다.");
  location.reload();
}

window.onload = startGame;
