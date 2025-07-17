// script.js
const totalQuestions = 20;
let currentIndex = 0;
let correctCount = 0;
let answerParts = [];
let inputParts = [];
let startTime;
const COLORS = ["#ffe0e0", "#e0f0ff", "#e0ffe0", "#fff3e0", "#f0e0ff", "#e0fff9", "#f9e0ff"];
const unitMapByDigitCount = {
  2: ["십", ""],
  3: ["백", "십", ""],
  4: ["천", "백", "십", ""],
  5: ["만", "천", "백", "십", ""]
};
let currentTerms = [];
let currentDigitCount = 0;
let gameMode = "";
let allQuestions = [];

window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".digit-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".digit-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      currentDigitCount = parseInt(btn.dataset['digit']);
      checkReady();
    });
  });

  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      gameMode = btn.dataset['mode'];
      checkReady();
    });
  });

  document.getElementById("startGameBtn").addEventListener("click", () => {
    startGame();
  });
});

function checkReady() {
  const startBtn = document.getElementById("startGameBtn");
  if (currentDigitCount > 0 && gameMode !== "") {
    startBtn.disabled = false;
    startBtn.classList.remove("disabled");
  } else {
    startBtn.disabled = true;
    startBtn.classList.add("disabled");
  }
}

function startGame() {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  document.getElementById("resultScreen").style.display = "none";
  currentIndex = 0;
  correctCount = 0;
  allQuestions = [];
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
      if (box.classList.contains("incorrect")) {
        retryQuestion(i);
      }
    });
    grid.appendChild(box);
  }
}

function generateQuestion(digits) {
  const placeValuesByDigitCount = {
    2: [10, 1],
    3: [100, 10, 1],
    4: [1000, 100, 10, 1],
    5: [10000, 1000, 100, 10, 1]
  };
  const placeValues = placeValuesByDigitCount[currentDigitCount];

  let terms = digits.map((d, i) => ({
    digit: d,
    unitIndex: i,
    used: false
  }));

  if (gameMode === "shuffled") {
    terms = shuffleArray(terms);
  }

  const answer = [...terms].sort((a, b) => a.unitIndex - b.unitIndex).map(t => t.digit);

  let expression;
  if (currentDigitCount === 2) {
    // 두 자릿수 문제는 항상 두 항을 표시
    expression = terms.map((t, i) => t.digit * placeValues[t.unitIndex]).join(" + ");
  } else {
    // 그 외에는 0이 아닌 항만 표시
    expression = terms.map((t, i) => t.digit * placeValues[t.unitIndex])
                      .filter(v => v !== 0)
                      .join(" + ");
  }

  return { terms, answer, expression };
}

function generateNextQuestion() {
  if (currentIndex >= totalQuestions) {
    const elapsed = Math.floor((new Date() - startTime) / 1000);
    document.getElementById("gameArea").style.display = "none";
    document.getElementById("resultScreen").style.display = "block";
    document.getElementById("score").textContent = `${correctCount * 5}점`;
    document.getElementById("time").textContent = `⏱ 걸린 시간: ${elapsed}초`;
    return;
  }

  inputParts = [];

  const digits = Array.from({ length: currentDigitCount }, () => Math.floor(Math.random() * 10));
  if (digits[0] === 0) digits[0] = Math.floor(Math.random() * 9) + 1;

  const q = generateQuestion(digits);
  currentTerms = q.terms;
  answerParts = q.answer;
  allQuestions[currentIndex] = digits;

  document.getElementById("questionText").textContent = q.expression + " =";
  renderSlots();
  renderChoices();
}

function retryQuestion(index) {
  inputParts = [];
  const digits = allQuestions[index];
  const q = generateQuestion(digits);
  currentTerms = q.terms;
  answerParts = q.answer;
  document.getElementById("questionText").textContent = q.expression + " =";
  currentIndex = index;
  renderSlots();
  renderChoices();
}

function renderSlots() {
  const slots = document.getElementById("answerSlots");
  slots.innerHTML = '';
  for (let i = 0; i < currentDigitCount; i++) {
    const div = document.createElement("div");
    div.className = "slot-box";
    div.id = `slot-${i}`;
    slots.appendChild(div);
  }
}

function renderChoices() {
  const container = document.getElementById("choicesContainer");
  container.innerHTML = '';
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  nums.forEach(num => {
    const btn = document.createElement("button");
    btn.textContent = num;
    btn.className = "num-btn";
    btn.onclick = () => handleInput(num);
    container.appendChild(btn);
  });
}

function handleInput(num) {
  if (inputParts.length >= currentDigitCount) return;

  const index = inputParts.length;
  const targetSlot = document.getElementById(`slot-${index}`);
  targetSlot.textContent = num;
  inputParts.push(num);

  const unitArray = unitMapByDigitCount[currentDigitCount];
  const unitSound = unitArray[index];

 if (num !== 0) {
  if (num === 1 && index !== currentDigitCount - 1 && unitSound !== "") {
    // 숫자 1이고 일의 자리가 아닐 경우: 자릿값만 재생
    playSound(unitSound);
  } else {
    // 숫자 소리 + 자릿값 소리
    playSound(num);
    if (unitSound) {
      setTimeout(() => playSound(unitSound), 300);
    }
  }
}


  if (inputParts.length === currentDigitCount) {
    const correct = inputParts.every((v, i) => v === answerParts[i]);
    const resultBox = document.getElementById(`progress-${currentIndex}`);
    resultBox.classList.remove('correct', 'incorrect');
    resultBox.classList.add(correct ? 'correct' : 'incorrect');
    if (correct) correctCount++;
    currentIndex++;
    setTimeout(generateNextQuestion, 1000);
  }
}

function playSound(id) {
  const audio = new Audio(`./sounds/${id}.mp3`);
  audio.play();
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function restartGameFromResult() {
  document.getElementById("resultScreen").style.display = "none";
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameArea").style.display = "block";

  currentIndex = 0;
  correctCount = 0;
  allQuestions = [];
  generateProgressGrid();
  startTime = new Date();
  generateNextQuestion();
}




function endGame() {
  alert("게임을 종료합니다.");
  location.reload();
}