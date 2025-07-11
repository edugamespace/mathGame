
let currentIndex = 0;
let correctCount = 0;
let startTime = null;
const totalQuestions = 30;
let baseLevel = 0;
let addLevel = 0;

const baseRanges = [
  [1, 10], [1, 20], [1, 30], [1, 50], [30, 50], [40, 70], [1, 100], [30, 100]
];
const addRanges = [
  [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], 
  [1, 3], [1, 5], [3, 5], [3, 9], [1, 9]
];

const correctSound = new Audio("correct.mp3");
const wrongSound = new Audio("wrong.mp3");

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCurrentRanges() {
  let base = baseRanges[Math.min(baseLevel, baseRanges.length - 1)];
  let add = addRanges[Math.min(addLevel, addRanges.length - 1)];
  return { base, add };
}

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

  const { base, add } = getCurrentRanges();
  const a = rand(...base);
  const b = rand(...add);
  const correct = a + b;

  document.getElementById("questionBox").innerHTML = `<h2>${a} + ${b} = ?</h2>`;

  const options = new Set([correct]);
  while (options.size < 5) {
    const wrong = correct + rand(-10, 10);
    if (wrong !== correct && wrong > 0) options.add(wrong);
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
      <p>좋아요! 1분 이내 + 85점 이상 달성했어요 🎉 다음 단계로 넘어가보세요!</p>
      <button onclick="nextLevel()" style="font-size:1.5rem;">다음 단계로 넘어가기</button><br>
      <button onclick="stopGame()" class="small-btn">그만할래요</button>
      <button onclick="startGame()" class="small-btn">이번 단계 한 번 더</button>
    `;
    baseLevel++;
    if (baseLevel >= baseRanges.length) {
      baseLevel = 0;
      addLevel++;
    }
  } else {
    recDiv.innerHTML = `
      <p>이번에는 1분 초과 또는 점수가 85점 미만이에요.<br>이번 단계를 한 번 더 해보는 걸 추천해요!</p>
      <button onclick="startGame()" style="font-size:1.6rem; padding: 14px 24px;">이번 단계 한 번 더</button><br>
      <button onclick="stopGame()" class="small-btn">그만할래요</button>
      <button onclick="nextLevel()" class="small-btn">그래도 다음 단계로</button>
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
