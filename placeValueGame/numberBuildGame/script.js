let currentDigitCount = 0;
let gameMode = "";
let currentAnswerDigits = [];
let inputIndex = 0;
let correctCount = 0;
let currentIndex = 0;
const startBtn = document.getElementById("startGameBtn");
const totalQuestions = 20;

const unitMap = ["만", "천", "백", "십", ""];

function playSound(id) {
  const sound = document.getElementById(id);
  if (sound) {
    sound.currentTime = 0;
    sound.play();
  }
}

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

function checkReady() {
  if (currentDigitCount > 0 && gameMode !== "") {
    startBtn.disabled = false;
  }
}

startBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  gameArea.style.display = "block";
  startGame();
});



function startGame() {
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

  // 자릿수 숫자 생성
   let digits = Array.from({ length: currentDigitCount }, () => Math.floor(Math.random() * 10));
  if (digits[0] === 0) digits[0] = Math.floor(Math.random() * 9) + 1;

  let terms = digits.map((d, i) => ({
    digit: d,
    term: d * Math.pow(10, currentDigitCount - i - 1),
    place: Math.pow(10, currentDigitCount - i - 1)
  }));

  if (gameMode === "shuffled") {
    terms = shuffleArray(terms);
  }

  // 정답: 큰 자릿수부터 내림차순으로 정렬해 digit만 추출
  currentAnswerDigits = [...terms]
    .sort((a, b) => b.place - a.place)
    .map(t => t.digit);

  // 문제로는 섞인 순서대로 항만 출력
  const question = terms.map(t => t.term).filter(n => n > 0).join(" + ");
  document.getElementById("questionText").textContent = question + " =";

  renderSlots();
  renderChoices();
}


function shuffleArray(arr) {
  return arr
    .map(item => ({ ...item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort);
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

const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");

function handleInput(num) {
  const slots = document.querySelectorAll(".slot-box");
  if (inputIndex >= slots.length) return;

  const correct = currentAnswerDigits[inputIndex];
  const box = slots[inputIndex];

  box.textContent = num;
  box.classList.remove("correct", "incorrect");

  if (num === correct) {
  box.classList.add("correct");
  inputIndex++;

  document.getElementById("correctSound").play();

  if (num > 0) {
  playSound(`sound-${num}`);

  // ✅ 자릿값 재생: currentTerms에서 실제 자릿값 찾기
  const correctTerm = currentTerms.find(t => t.digit === num && !t.used);
  if (correctTerm) {
    correctTerm.used = true;
    const unitIndex = correctTerm.unitIndex;

    // ✅ 자릿값이 일의자리가 아닌 경우에만 재생
    if (unitIndex < unitMap.length - 1) {
      const unitLabel = unitMap[unitIndex];
      if (unitLabel) {
        playSound(`sound-${unitLabel}`);
      }
    }
  }
}



    if (inputIndex === currentAnswerDigits.length) {
      document.getElementById(`progress-${currentIndex}`).classList.add("correct");
      correctCount++;
      currentIndex++;
      setTimeout(generateNextQuestion, 800);
    }
  } else {
    box.classList.add("incorrect");
    document.getElementById("wrongSound").play(); // ✅ 오답 소리
  }
}


