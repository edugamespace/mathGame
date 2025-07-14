// ================================
// 전역 변수 및 설정
// ================================
let currentIndex = 0;
let correctCount = 0;
let startTime = null;
const totalQuestions = 20;

const correctSound = new Audio('sounds/correct.mp3');
const wrongSound = new Audio('sounds/wrong.mp3');

// ================================
// 게임 시작
// ================================
function startGame() {
  correctCount = 0;
  currentIndex = 0;
  startTime = Date.now();

  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  document.getElementById("resultScreen").style.display = "none";

  // ✅ 이 두 줄 추가
  document.getElementById("questionBox").style.display = "block";
  document.getElementById("choicesBox").style.display = "block";

  document.getElementById("progressGrid").style.display = "grid";

  generateProgressGrid();
  generateNextQuestion();
}


// ================================
// 문제 생성 및 표시
// ================================
function generateProgressGrid() {
  const grid = document.getElementById("progressGrid");
  grid.innerHTML = '';
  grid.style.display = 'grid';
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

  const a = rand(1, 9);
  const b = rand(1, 9);
  const correct = a * b;

  document.getElementById("questionBox").innerHTML = `<h2>${a} × ${b} = ?</h2>`;

  const options = new Set([correct]);
  while (options.size < 5) {
    const wrong = correct + rand(-5, 5);
    if (wrong > 0 && wrong !== correct) options.add(wrong);
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
      const isCorrect = (choice === correct);
      document.getElementById(`progress-${currentIndex}`).classList.add(isCorrect ? 'correct' : 'incorrect');
      if (isCorrect) {
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
// 게임 종료
// ================================
function endGame() {
  const endTime = Date.now();
  const durationSec = Math.floor((endTime - startTime) / 1000);
  const score = Math.round((correctCount / totalQuestions) * 100);

  document.getElementById("score").textContent = `${score}점`;
  document.getElementById("time").textContent = `${durationSec}초`;

  document.getElementById("progressGrid").style.display = "none";
  document.getElementById("questionBox").style.display = "none";
  document.getElementById("choicesBox").style.display = "none";
  document.getElementById("resultScreen").style.display = "block";

  const recDiv = document.getElementById("recommendation");
  recDiv.innerHTML = `
    <button onclick="startGame()" class="result-btn-primary">다시할게요</button><br>
    <button onclick="stopGame()" class="result-btn-secondary">그만할래요</button>
  `;
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
