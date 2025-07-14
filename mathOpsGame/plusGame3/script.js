// =========================
// 🔧 전역 변수 및 설정
// =========================
let baseLevel = 0;
let addLevel = 0;
let carryMode = "carry2"; // 기본값: 받아올림 2번 포함
let problems = [];
let currentIndex = 0;
let correctCount = 0;
let startTime;

 
const baseRanges = [
  [100, 199], [200, 299], [100, 599], [400, 799], [100, 999]
];
const addRanges = [
  [10, 19], [20, 29], [10, 59], [40, 79], [10, 99],
];

const correctSound = new Audio('sounds/correct.mp3');
const wrongSound = new Audio('sounds/wrong.mp3');

// =========================
// 📦 DOM 요소 가져오기
// =========================
const startScreen = document.getElementById("startScreen");
const gameArea = document.getElementById("gameArea");
const progressGrid = document.getElementById("progressGrid");
const questionBox = document.getElementById("questionBox");
const choicesBox = document.getElementById("choicesBox");
const resultScreen = document.getElementById("resultScreen");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const recDiv = document.getElementById("recommendation");

// =========================
// 🧠 게임 로직
// =========================
function getRandomFrom([min, max]) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion(baseRange, addRange) {
  let a, b;
  while (true) {
    a = getRandomFrom(baseRange);
    b = getRandomFrom(addRange);

    const unitA = a % 10;
    const tenA = Math.floor((a % 100) / 10);
    const unitB = b % 10;
    const tenB = Math.floor((b % 100) / 10);

    const unitSum = unitA + unitB;
    const tenSum = tenA + tenB;

    if (carryMode === "noCarry") {
      if (unitSum > 9 || tenSum > 9) continue;
    } else if (carryMode === "carry1") {
      if (unitSum > 9 && tenSum > 9) continue;
    }

    break;
  }

  return {
    question: `${a} + ${b}`,
    answer: a + b,
  };
}


function generateProblems() {
  problems = [];
  for (let i = 0; i < 20; i++) {
    problems.push(generateQuestion(baseRanges[baseLevel], addRanges[addLevel]));
  }
}

function generateChoices(answer) {
  const choices = new Set([answer]);
  while (choices.size < 5) {
    let fake = answer + Math.floor(Math.random() * 21 - 10);
    if (fake >= 0 && !choices.has(fake)) choices.add(fake);
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

function showQuestion() {
  const { question, answer } = problems[currentIndex];
  questionBox.innerHTML = `<h2>${question}</h2>`;

  const choices = generateChoices(answer);
  choicesBox.innerHTML = "";
  choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice;
    btn.onclick = () => checkAnswer(choice);
    choicesBox.appendChild(btn);
  });
}

function checkAnswer(choice) {
  const isCorrect = choice === problems[currentIndex].answer;
  const btn = document.querySelectorAll(".progress-btn")[currentIndex];
  btn.classList.add(isCorrect ? "correct" : "incorrect");

  if (isCorrect) {
    correctCount++;
    correctSound.play();
  } else {
    wrongSound.play();
  }

  currentIndex++;
  if (currentIndex < 20) {
    showQuestion();
  } else {
    endGame();
  }
}

function startGame() {
  currentIndex = 0;
  correctCount = 0;
  generateProblems();
  startTime = new Date();

  startScreen.style.display = "none";
  gameArea.style.display = "block";
  resultScreen.style.display = "none";

  setupProgressGrid();
  showQuestion();
}

function setupProgressGrid() {
  progressGrid.innerHTML = "";
  for (let i = 0; i < 20; i++) {
    const btn = document.createElement("button");
    btn.className = "progress-btn";
    progressGrid.appendChild(btn);
  }
}

function endGame() {
  const endTime = new Date();
  const durationSec = Math.round((endTime - startTime) / 1000);
  const score = Math.round((correctCount / 20) * 100);

  scoreEl.textContent = `${score}점`;
  timeEl.textContent = `걸린 시간: ${durationSec}초`;

  gameArea.style.display = "none";
  resultScreen.style.display = "block";

  if (score >= 90) {
    recDiv.innerHTML = `
      <p>🤩다음 단계로 넘어가보세요 🎉</p>
      <button onclick="nextLevel()" class="result-btn-primary">다음 단계로 넘어가기</button><br>
      <button onclick="stopGame()" class="result-btn-secondary">그만할래요</button>
      <button onclick="startGame()" class="result-btn-secondary">이번 단계 한 번 더</button>
    `;
    baseLevel++;
    if (baseLevel >= baseRanges.length) {
      baseLevel = 0;
      addLevel++;
    }
  } else {
    recDiv.innerHTML = `
      <p>🐱이번 단계를 한 번 더 해보는 게 좋겠어요!</p>
      <button onclick="startGame()" class="result-btn-primary">한번 더 해볼게요</button><br>
      <button onclick="stopGame()" class="result-btn-secondary">그만할래요</button>
      <button onclick="nextLevel()" class="result-btn-secondary">다음 단계로 넘어가기</button>
    `;
  }
}

function startSelectedGame() {
  startGame();
}

function nextLevel() {
  baseLevel++;
  if (baseLevel >= baseRanges.length) {
    baseLevel = 0;
    addLevel++;
    if (addLevel >= addRanges.length) {
      addLevel = 0; // 전체 다 돌았으면 처음으로
    }
  }
  startGame();
}

function stopGame() {
  startScreen.style.display = "block";
  gameArea.style.display = "none";
  resultScreen.style.display = "none";
}

// =========================
// 🎯 버튼 이벤트 핸들러
// =========================
document.querySelectorAll('.select-btn[data-type="base"]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.select-btn[data-type="base"]').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    baseLevel = parseInt(btn.dataset.index);
    checkStartReady();
  });
});

document.querySelectorAll('.select-btn[data-type="add"]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.select-btn[data-type="add"]').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    addLevel = parseInt(btn.dataset.index);
    checkStartReady();
  });
});

document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    carryMode = btn.dataset.mode;
  });
});

function checkStartReady() {
  const baseSelected = document.querySelector('.select-btn[data-type="base"].selected');
  const addSelected = document.querySelector('.select-btn[data-type="add"].selected');
  document.getElementById('startButton').disabled = !(baseSelected && addSelected);
}
