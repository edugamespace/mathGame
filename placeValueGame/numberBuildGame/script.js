// script.js
let currentDigitCount = 0;
let currentAnswerDigits = [];
let inputIndex = 0;
let correctCount = 0;
let currentIndex = 0;
const totalQuestions = 20;

document.querySelectorAll(".digit-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentDigitCount = parseInt(btn.dataset.digit);
    startGame();
  });
});

function startGame() {
  document.getElementById("startScreen").classList.add("hidden");
  document.getElementById("gameArea").classList.remove("hidden");
  correctCount = 0;
  currentIndex = 0;
  generateProgressGrid();
  generateNextQuestion();
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
    alert(`게임 종료! 정답 수: ${correctCount}/${totalQuestions}`);
    location.reload();
    return;
  }

  // 문제 숫자 생성 (예: 60000 + 500 + 40 + 7)
  currentAnswerDigits = Array.from({ length: currentDigitCount }, () => Math.floor(Math.random() * 10));
  if (currentAnswerDigits[0] === 0) currentAnswerDigits[0] = Math.floor(Math.random() * 9) + 1;

  const terms = currentAnswerDigits.map((d, i) => d * Math.pow(10, currentDigitCount - i - 1));
  const question = terms.join(" + ");

  document.getElementById("questionText").textContent = question + " =";
  renderSlots();
  renderChoices();
}

function renderSlots() {
  const container = document.getElementById("answerSlots");
  container.innerHTML = '';
  inputIndex = 0;

  for (let i = 0; i < currentAnswerDigits.length; i++) {
    const box = document.createElement("div");
    box.className = "slot-box";
    box.textContent = "";
    box.dataset.index = i;
    container.appendChild(box);
  }
}

function renderChoices() {
  const box = document.getElementById("choices");
  box.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const btn = document.createElement("button");
    btn.className = "num-btn";
    btn.textContent = i;
    btn.onclick = () => handleInput(i);
    box.appendChild(btn);
  }
}

function handleInput(num) {
  const slots = document.querySelectorAll(".slot-box");
  if (inputIndex >= slots.length) return;

  const correct = currentAnswerDigits[inputIndex];
  const box = slots[inputIndex];

  if (num === correct) {
    box.textContent = num;
    box.classList.add("correct");
    inputIndex++;
    if (inputIndex === currentAnswerDigits.length) {
      document.getElementById(`progress-${currentIndex}`).classList.add("correct");
      correctCount++;
      currentIndex++;
      setTimeout(generateNextQuestion, 800);
    }
  } else {
    box.classList.add("incorrect");
    document.getElementById(`progress-${currentIndex}`).classList.add("incorrect");
    currentIndex++;
    setTimeout(generateNextQuestion, 800);
  }
}
