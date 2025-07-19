let selectedBoxes = 3;
let selectedStep = '+1';
let questionIndex = 0;
let correctCount = 0;
let startTime = 0;

const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const resultScreen = document.getElementById('resultScreen');

const progressBar = document.getElementById('progress-bar');
const boxesDiv = document.getElementById('boxes');
const choicesDiv = document.getElementById('choices');
const instruction = document.getElementById('instruction');

const results = Array(20).fill(null); // 정답 여부 저장
let problems = []; // 문제 데이터 저장

// 사운드
const sounds = {
  correct: new Audio('sounds/correct.mp3'),
  wrong: new Audio('sounds/wrong.mp3'),
};

// 박스 수 선택
document.querySelectorAll('.box-btn').forEach(btn => {
  btn.onclick = () => {
    selectedBoxes = parseInt(btn.dataset.boxes);
    document.querySelectorAll('.box-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    document.querySelectorAll('.step-btn').forEach(stepBtn => {
      const step = stepBtn.dataset.step;
      if ((step === '+2' || step === '-2') && selectedBoxes < 3) {
        stepBtn.disabled = true;
        stepBtn.classList.add('disabled');
      } else {
        stepBtn.disabled = false;
        stepBtn.classList.remove('disabled');
      }
    });
  };
});

// 단계 선택
document.querySelectorAll('.step-btn').forEach(btn => {
  btn.onclick = () => {
    if (btn.disabled) return;
    selectedStep = btn.dataset.step;
    document.querySelectorAll('.step-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  };
});

// 게임 시작 버튼 연결 (❗버그 수정됨)
document.getElementById('start-game').onclick = () => {
  startScreen.style.display = 'none';
  gameScreen.style.display = 'block';
  startTime = Date.now();
  correctCount = 0;
  questionIndex = 0;
  problems = Array.from({ length: 20 }, () => generateQuestion());
  updateProgressBar();
  showQuestion();
};

// 문제 생성
function generateQuestion() {
  const isMinus = selectedStep.includes('-');
  const step = parseInt(selectedStep);
  const blanks = Math.abs(step);
  const dir = isMinus ? -1 : 1;

  let start;
  if (isMinus) {
    // 충분히 큰 수에서 시작해서 역방향으로 만들기
    start = Math.floor(Math.random() * 50 + 30 + blanks);
  } else {
    start = Math.floor(Math.random() * 70 + 10);
  }

  const known = [];
  for (let i = 0; i < selectedBoxes - blanks; i++) {
    known.push(start);
    start += dir;
  }

  const answers = [];
  for (let i = 0; i < blanks; i++) {
    answers.push(start);
    start += dir;
  }

  const full = [...known, ...answers];
  if (isMinus) {
    const reversed = full.reverse();
    return {
      known: reversed.slice(blanks),
      answers: reversed.slice(0, blanks),
    };
  } else {
    return { known, answers };
  }
}


// 진행 바
function updateProgressBar() {
  progressBar.innerHTML = '';
  results.forEach((res, i) => {
    const box = document.createElement('div');
    box.className = 'progress-box';
    if (res === true) box.classList.add('correct');
    else if (res === false) box.classList.add('incorrect');
    box.onclick = () => {
      questionIndex = i;
      showQuestion();
    };
    progressBar.appendChild(box);
  });
}

// 문제 화면 출력
function showQuestion() {
  if (questionIndex >= 20) return showResult();

  const { known, answers } = problems[questionIndex];
  boxesDiv.innerHTML = '';
  choicesDiv.innerHTML = '';

  const isMinus = selectedStep.includes('-');
  const isDoubleStep = Math.abs(parseInt(selectedStep)) === 2;

if (isMinus) {
  const blanks = Math.abs(parseInt(selectedStep)); // -1이면 1, -2이면 2

  // 🔴 1) 정답칸: 항상 맨 앞에 추가
  const answerBox = document.createElement('div');
  answerBox.className = 'answer-blank';
  answerBox.innerText = '';
  boxesDiv.appendChild(answerBox);

  // ⬜ 2) -2인 경우만: 회색 빈칸 추가
  if (blanks === 2) {
    const emptyBox = document.createElement('div');
    emptyBox.className = 'question-box empty';
    emptyBox.innerText = '';
    boxesDiv.appendChild(emptyBox);
  }

  // 🔢 3) 힌트 숫자 출력 (나머지)
  known.forEach(n => {
    const div = document.createElement('div');
    div.className = 'question-box';
    div.innerText = n;
    boxesDiv.appendChild(div);
  });
}


else {
  const blanks = Math.abs(parseInt(selectedStep)); // +1 또는 +2

  // 힌트 숫자 출력
  known.forEach(n => {
    const box = document.createElement('div');
    box.className = 'question-box';
    box.innerText = n;
    boxesDiv.appendChild(box);
  });

  // +2일 경우: 회색 빈칸 먼저 추가
  if (blanks === 2) {
    const emptyBox = document.createElement('div');
    emptyBox.className = 'question-box empty';
    emptyBox.innerText = '';
    boxesDiv.appendChild(emptyBox);
  }

  // 빨간 정답칸 추가 (항상 마지막)
  const answerBox = document.createElement('div');
  answerBox.className = 'answer-blank';
  answerBox.innerText = '';
  boxesDiv.appendChild(answerBox);
}



  // 보기 버튼 생성
const correct = selectedStep.includes('-') ? answers[0] : answers[answers.length - 1];
  const set = new Set([correct]);
  while (set.size < 5) {
    const fake = correct + Math.floor(Math.random() * 11 - 5);
    if (fake !== correct && fake > 0 && fake < 120) set.add(fake);
  }

  Array.from(set).sort(() => Math.random() - 0.5).forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerText = choice;
    btn.onclick = () => {
      results[questionIndex] = parseInt(choice) === correct;
      if (results[questionIndex]) {
        correctCount++;
        sounds.correct.play();
      } else {
        sounds.wrong.play();
      }
      updateProgressBar();
      questionIndex++;
      showQuestion();
    };
    choicesDiv.appendChild(btn);
  });
}


// 결과 표시
function showResult() {
  gameScreen.style.display = 'none';
  resultScreen.style.display = 'block';
  const score = Math.round((correctCount / 20) * 100);
  const time = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById('score').innerText = `점수: ${score}점 (${correctCount}/20)`;
  document.getElementById('time').innerText = `걸린 시간: ${time}초`;
}

function goToStartScreen() {
  resultScreen.style.display = 'none';
  startScreen.style.display = 'block';
  // 게임 초기화
  questionIndex = 0;
  correctCount = 0;
  problems = [];
  results.fill(null);
  updateProgressBar();
}
