
let selectedRange = "1,3";
let selectedType = "pm";

// 선택 버튼 처리
document.querySelectorAll('.operation button').forEach(btn => {
  btn.onclick = () => {
    selectedRange = btn.dataset.range;
    document.querySelectorAll('.operation button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  };
});

document.querySelectorAll('#type-buttons button').forEach(btn => {
  btn.onclick = () => {
    selectedType = btn.dataset.type;
    document.querySelectorAll('#type-buttons button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  };
});

document.getElementById('start-game').onclick = () => {
  document.querySelector('.button-group.operation').style.display = 'none';
  document.getElementById('type-buttons').style.display = 'none';
  document.getElementById('start-game').style.display = 'none';
  document.querySelector('h1').style.display = 'none';

  document.getElementById('game-screen').style.display = 'block';
  startGame();
};

// 게임 로직
let currentNumber = 0;
let questionCount = 0;
let correctCount = 0;
let nextOp = 0;
let startTime = 0;
let lastClickedBtn = null;

const sounds = {
  correct: new Audio('sounds/correct.mp3'),
  wrong: new Audio('sounds/wrong.mp3'),
};

function playPromptSound(op) {
  let label = "";
  if (selectedType === 'pm') {
    label = op >= 0 ? `더하기${op}` : `빼기${Math.abs(op)}`;
  } else {
    label = `${Math.abs(op)}${op >= 0 ? '큰수' : '작은수'}`;
  }
  const sound = new Audio(`sounds/${label}.mp3`);
  sound.play();
}

function updateQuestion() {
  const q = document.getElementById('question');
  if (questionCount === 0) {
    q.innerText = `시작 수: ${currentNumber}`;
  } else {
    if (selectedType === 'pm') {
      q.innerText = `다음 연산: ${nextOp > 0 ? '+' : ''}${nextOp}`;
    } else {
      q.innerText = `다음 문제: ${Math.abs(nextOp)}${nextOp > 0 ? '큰 수' : '작은 수'}`;
    }
    playPromptSound(nextOp);
  }
}

function createGrid() {
  const grid = document.getElementById('number-grid');
  grid.innerHTML = '';
  for (let i = 1; i <= 100; i++) {
    const btn = document.createElement('button');
    btn.innerText = i;
    btn.className = `number-btn border-group-${Math.floor((i - 1) / 10) + 1}`;
    btn.onclick = () => handleAnswer(i, btn);
    grid.appendChild(btn);
  }
}

function handleAnswer(selected, btn) {
  if (lastClickedBtn) {
    lastClickedBtn.classList.remove('correct', 'incorrect');
  }

  // ✅ 모든 빨간 버튼 초기화
  document.querySelectorAll('.number-btn.incorrect').forEach(el => {
    el.classList.remove('incorrect');
  });
  
  if (questionCount === 0) {
    if (selected === currentNumber) {
      correctCount++;
      btn.classList.add('correct');
      sounds.correct.play();
      lastClickedBtn = btn;
      nextStep();
    } else {
      btn.classList.add('incorrect');
      sounds.wrong.play();

    }
  } else {
    const target = currentNumber + nextOp;
    if (selected === target) {
      correctCount++;
      currentNumber = target;
      btn.classList.add('correct');
      sounds.correct.play();
      lastClickedBtn = btn;
      nextStep();
    } else {
      btn.classList.add('incorrect');
      sounds.wrong.play();
    }
  }
}

function nextStep() {
  questionCount++;

  const [min, max] = selectedRange.split(',').map(Number);

  // 혼합 문제: 항상 20문제까지만
  if (selectedType === 'bigsmall' && min < 0 && max > 0) {
    if (questionCount >= 20) return endGame();
  }

  nextOp = getRandomInt(min, max);
  const nextNum = currentNumber + nextOp;

  // +만 있는 게임: 100 넘으면 종료
  if (min >= 1 && max >= 1 && nextNum > 100) return endGame();

  // -만 있는 게임: 1 미만이면 종료
  if (min < 0 && max < 0 && nextNum < 1) return endGame();

  updateQuestion();
}


function endGame() {
  document.getElementById('game-screen').style.display = 'none';
  const score = Math.round((correctCount / questionCount) * 100);
  const time = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById('result-screen').style.display = 'block';
  document.getElementById('final-score-text').innerText = `점수: ${score}점 (${correctCount}/${questionCount})`;
  document.getElementById('final-time-text').innerText = `걸린 시간: ${time}초`;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startGame() {
  const [min, max] = selectedRange.split(',').map(Number);

  if (min >= 1 && max >= 1) {
    // +만 있는 버튼
    currentNumber = getRandomInt(1, 3);
  } else if (min < 0 && max < 0) {
    // -만 있는 버튼
    currentNumber = getRandomInt(97, 100);
  } else {
    // +와 - 섞여 있는 버튼
    currentNumber = getRandomInt(48, 52);
  }

  startTime = Date.now();
  updateQuestion();
  createGrid();
}

