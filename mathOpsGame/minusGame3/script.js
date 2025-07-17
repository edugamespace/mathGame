document.addEventListener("DOMContentLoaded", () => {
  let baseLevel = 0;
  let subLevel = 0;
  let borrowMode = "borrow2";
  let problems = [];
  let currentIndex = 0;
  let correctCount = 0;
  let startTime;

  const baseRanges = [
    [100, 199], [200, 299], [100, 599], [400, 799], [100, 999]
  ];
  const subRanges = [
    [10, 19], [20, 29], [10, 59], [40, 79], [10, 99]
  ];
const incorrectIndexes = new Set();

  const correctSound = new Audio('sounds/correct.mp3');
  const wrongSound = new Audio('sounds/wrong.mp3');

  const startScreen = document.getElementById("startScreen");
  const gameArea = document.getElementById("gameArea");
  const resultScreen = document.getElementById("resultScreen");
  const progressGrid = document.getElementById("progressGrid");
  const questionBox = document.getElementById("questionBox");
  const choicesBox = document.getElementById("choicesBox");
  const scoreEl = document.getElementById("score");
  const timeEl = document.getElementById("time");
  const recDiv = document.getElementById("recommendation");

  function getRandomFrom([min, max]) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateQuestion(baseRange, subRange) {
    let base, sub;
    while (true) {
      base = getRandomFrom(baseRange);
      sub = getRandomFrom(subRange);
      if (sub > base) continue;

      const unitBase = base % 10;
      const tenBase = Math.floor((base % 100) / 10);
      const unitSub = sub % 10;
      const tenSub = Math.floor((sub % 100) / 10);

      const borrowUnits = unitBase < unitSub;
      const borrowTens = tenBase < tenSub;

      if (borrowMode === "borrow1") {
        if (borrowUnits && borrowTens) continue;
      } else if (borrowMode === "noBorrow") {
        if (borrowUnits || borrowTens) continue;
      }

      break;
    }

    return { question: `${base} - ${sub}`, answer: base - sub };
  }

  function generateProblems() {
    problems = [];
    for (let i = 0; i < 20; i++) {
      problems.push(generateQuestion(baseRanges[baseLevel], subRanges[subLevel]));
    }
  }

  function generateChoices(answer) {
    const choices = new Set([answer]);
    while (choices.size < 5) {
      const fake = answer + Math.floor(Math.random() * 11 - 5);
      if (fake >= 0 && !choices.has(fake)) choices.add(fake);
    }
    return Array.from(choices).sort(() => Math.random() - 0.5);
  }

  function showQuestion() {
    const { question, answer } = problems[currentIndex];
    questionBox.innerHTML = `<h2>${question}</h2>`;
    choicesBox.innerHTML = "";

    generateChoices(answer).forEach((choice) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = choice;
      btn.onclick = () => checkAnswer(choice);
      choicesBox.appendChild(btn);
    });
  }

  function checkAnswer(choice) {
const isCorrect = choice === problems[currentIndex].answer;
const btn = document.querySelector(`#progress-${currentIndex}`);
btn.classList.remove("correct", "incorrect");
btn.classList.add(isCorrect ? "correct" : "incorrect");

if (isCorrect) {
  correctCount++;
  correctSound.play();
  incorrectIndexes.delete(currentIndex);  // 오답에서 제거
} else {
  wrongSound.play();
  incorrectIndexes.add(currentIndex);    // 오답 기록
}

    currentIndex++;
    if (currentIndex < 20) showQuestion();
    else endGame();
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
    btn.id = `progress-${i}`;
    
    // 오답일 경우 클릭 시 다시 풀 수 있게
    btn.addEventListener("click", () => {
      if (incorrectIndexes.has(i)) {
        currentIndex = i;
        showQuestion(); // 다시 해당 문제 표시
      }
    });

    progressGrid.appendChild(btn);
  }
}


  function endGame() {
    const durationSec = Math.round((new Date() - startTime) / 1000);
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
        <button onclick="startGame()" class="result-btn-secondary">이번 단계 한 번 더</button>`;
    } else {
      recDiv.innerHTML = `
        <p>🐱이번 단계를 한 번 더 해보는 게 좋겠어요!</p>
        <button onclick="startGame()" class="result-btn-primary">한번 더 해볼게요</button><br>
        <button onclick="stopGame()" class="result-btn-secondary">그만할래요</button>
        <button onclick="nextLevel()" class="result-btn-secondary">다음 단계로 넘어가기</button>`;
    }
  }

  function nextLevel() {
    baseLevel++;
    if (baseLevel >= baseRanges.length) {
      baseLevel = 0;
      subLevel++;
      if (subLevel >= subRanges.length) subLevel = 0;
    }
    startGame();
  }

  function stopGame() {
    startScreen.style.display = "block";
    gameArea.style.display = "none";
    resultScreen.style.display = "none";
  }

  document.querySelectorAll('.select-btn[data-type="base"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.select-btn[data-type="base"]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      baseLevel = parseInt(btn.dataset.index);
      checkStartReady();
    });
  });

  document.querySelectorAll('.select-btn[data-type="sub"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.select-btn[data-type="sub"]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      subLevel = parseInt(btn.dataset.index);
      checkStartReady();
    });
  });

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      borrowMode = btn.dataset.mode;
      checkStartReady();
    });
  });

  function checkStartReady() {
    const baseSelected = document.querySelector('.select-btn[data-type="base"].selected');
    const subSelected = document.querySelector('.select-btn[data-type="sub"].selected');
    const modeSelected = document.querySelector('.mode-btn.selected');
    document.getElementById('startButton').disabled = !(baseSelected && subSelected && modeSelected);
  }

 window.startSelectedGame = startGame;
  window.startGame = startGame;
  window.stopGame = stopGame;
  window.nextLevel = nextLevel;});
