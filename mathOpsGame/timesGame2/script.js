// ================================
// 전역 변수 및 설정
// ================================
let selectedBase = null;
let selectedMul = null;
let carryMode = 'withCarry';

let currentIndex = 0;
let correctCount = 0;
let startTime = null;
const totalQuestions = 20;
let baseLevel = 0;
let mulLevel = 0;

const baseRanges = [
  [1, 9], [10, 19], [10, 29], [10, 49], [30, 69], [10, 99],
];
const mulRanges = [
  [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9],
  [2, 5], [6, 9], [2, 9],
];

const correctSound = new Audio('sounds/correct.mp3');
const wrongSound = new Audio('sounds/wrong.mp3');

// ================================
// 초기 이벤트 리스너 설정
// ================================
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".select-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;
      const index = parseInt(btn.dataset.index);

      if (type === "mul") {
        const mulMax = mulRanges[index][1];
        const noCarryBtn = document.querySelector(".mode-btn[data-mode='noCarry']");
        if (mulMax >= 6) {
          noCarryBtn.classList.add('disabled-btn');
          carryMode = 'withCarry';
          document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
          document.querySelector(".mode-btn[data-mode='withCarry']").classList.add('selected');
        } else {
          noCarryBtn.classList.remove('disabled-btn');
        }
      }

      if (type === "base") {
        selectedBase = index;
        document.querySelectorAll('[data-type="base"]').forEach(b => b.classList.remove("selected"));
      } else {
        selectedMul = index;
        document.querySelectorAll('[data-type="mul"]').forEach(b => b.classList.remove("selected"));
      }

      btn.classList.add("selected");
      document.getElementById("startButton").disabled = !(selectedBase !== null && selectedMul !== null);
    });
  });

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('disabled-btn')) return;
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      carryMode = btn.dataset.mode;
    });
  });
});

// ================================
// 게임 시작 및 초기화
// ================================
function startSelectedGame() {
  baseLevel = selectedBase;
  mulLevel = selectedMul;
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  startGame();
}

function startGame() {
  correctCount = 0;
  currentIndex = 0;
  startTime = Date.now();
  document.getElementById("resultScreen").style.display = "none";
  document.getElementById("questionBox").style.display = "block";
  document.getElementById("choicesBox").style.display = "block";
  progressGrid.style.display = "grid";

  generateProgressGrid();
  generateNextQuestion();
}

// ================================
// 문제 생성 및 표시
// ================================
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

  const { base, mul } = {
    base: baseRanges[Math.min(baseLevel, baseRanges.length - 1)],
    mul: mulRanges[Math.min(mulLevel, mulRanges.length - 1)]
  };

  let a, b, attempts = 0;
  do {
    a = rand(...base);
    b = rand(...mul);
    attempts++;
    if (attempts > 100) break;
  } while (carryMode === 'noCarry' && ((a % 10) * (b % 10) >= 10));

  const correct = a * b;
  document.getElementById("questionBox").innerHTML = `<h2>${a} × ${b} = ?</h2>`;

  const options = new Set([correct]);
  while (options.size < 5) {
    const wrong = correct + rand(-Math.floor(correct * 0.3), Math.floor(correct * 0.3));
    const rounded = Math.round(wrong);
    if (rounded !== correct && rounded > 0) options.add(rounded);
  }

  const shuffled = [...options].sort(() => Math.random() - 0.5);
  const box = document.getElementById("choicesBox");
  box.innerHTML = '';

  const pastelColors = ["#ffe0b2", "#c5e1a5", "#b2dfdb", "#f8bbd0", "#c7aff4ff", "#ffccbc", "#c8e6c9", "#f0f4c3", "#b3e5fc", "#e1bee7"];
  const choiceColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];

  shuffled.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.className = "choice-btn";
    btn.style.backgroundColor = choiceColor;

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

// ================================
// 게임 종료 및 결과 처리
// ================================
function endGame() {
  const endTime = Date.now();
  const durationSec = Math.floor((endTime - startTime) / 1000);
  const score = Math.round((correctCount / totalQuestions) * 100);

  document.getElementById("score").textContent = `${score}점`;
  document.getElementById("time").textContent = `${durationSec}초`;
  document.getElementById("progressGrid").style.display = "none";

  const recDiv = document.getElementById("recommendation");
  recDiv.innerHTML = '';

  if (score >= 90) {
    recDiv.innerHTML = `
      <p>🤩다음 단계로 넘어가보세요!</p>
      <button onclick="nextLevel()" class="result-btn-primary">다음 단계로 넘어가기</button><br>
      <button onclick="stopGame()" class="result-btn-secondary">그만할래요</button>
      <button onclick="startGame()" class="result-btn-secondary">이번 단계 한 번 더</button>
    `;
    baseLevel++;
    if (baseLevel >= baseRanges.length) {
      baseLevel = 0;
      mulLevel++;
    }
  } else {
    recDiv.innerHTML = `
      <p>🐱이번 단계를 한 번 더 해보는 게 좋겠어요!</p>
      <button onclick="startGame()" class="result-btn-primary">한번 더 해볼게요</button><br>
      <button onclick="stopGame()" class="result-btn-secondary">그만할래요</button>
      <button onclick="nextLevel()" class="result-btn-secondary">다음 단계로 넘어가기</button>
    `;
  }

  document.getElementById("resultScreen").style.display = 'block';
  document.getElementById("questionBox").style.display = 'none';
  document.getElementById("choicesBox").style.display = 'none';
}

function nextLevel() {
  baseLevel++;
  if (baseLevel >= baseRanges.length) {
    baseLevel = 0;
    mulLevel++;
    if (mulLevel >= mulRanges.length) {
      mulLevel = 0;
    }
  }
  selectedBase = baseLevel;
  selectedMul = mulLevel;
  startGame();
}

function stopGame() {
  alert("수고하셨어요! 게임을 종료합니다.");
  location.reload();
}

// ================================
// 유틸 함수
// ================================
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
