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

// 사운드
const sounds = {
  correct: new Audio('sounds/correct.mp3'),
  wrong: new Audio('sounds/wrong.mp3'),
};

// 박스 버튼
document.querySelectorAll('.box-btn').forEach(btn => {
  btn.onclick = () => {
    selectedBoxes = parseInt(btn.dataset.boxes);
    document.querySelectorAll('.box-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    // 2칸 선택 시 +2, -2 버튼 비활성화
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

// 단계 버튼
document.querySelectorAll('.step-btn').forEach(btn => {
  btn.onclick = () => {
    if (btn.disabled) return;
    selectedStep = btn.dataset.step;
    document.querySelectorAll('.step-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  };
});

// 게임 시작
document.getElementById('start-game').onclick = () => {
  startScreen.style.display = 'none';
  gameScreen.style.display = 'block';
  startTime = Date.now();
  createProgress();
  showQuestion();
};

// 진행 표시
function createProgress() {
  progressBar.innerHTML = '';
  for (let i = 0; i < 20; i++) {
    const dot = document.createElement('button');
    dot.className = 'progress-btn';
    progressBar.appendChild(dot);
  }
}

// 문제 만들기
function generateSequence() {
  const stepValue = parseInt(selectedStep.replace(/[^\d]/g, '')) || 1;
  const isMinus = selectedStep.includes('-') || selectedStep.includes('작은');
  const direction = isMinus ? -1 : 1;
  const blanks = stepValue; // +2/-2 → 빈칸 2개

  const baseStart = Math.floor(Math.random() * (100 - selectedBoxes));
  const sequence = [];

  for (let i = 0; i < selectedBoxes - blanks; i++) {
    sequence.push(baseStart + i * direction);
  }

  const answers = [];
  for (let i = 1; i <= blanks; i++) {
    answers.push(sequence[sequence.length - 1] + i * direction);
  }

  return { sequence, answers };
}

// 문제 표시
function showQuestion() {
  if (questionIndex >= 20) return showResult();

  const { sequence, answers } = generateSequence();
  boxesDiv.innerHTML = '';
  choicesDiv.innerHTML = '';
  instruction.innerText = `${selectedStep} 숫자를 찾으세요.`;

  // 힌트 숫자
  sequence.forEach(n => {
    const box = document.createElement('div');
    box.className = 'progress-btn';
    box.innerText = n;
    boxesDiv.appendChild(box);
  });

 // 빈칸 (정답 숫자 수만큼 빨간 네모로 표시)
answers.forEach((val, idx) => {
  const blank = document.createElement('div');
  blank.className = 'progress-btn';
  if (idx < answers.length - 1) {
    // 힌트 숫자는 그대로 보여줌
    blank.innerText = val;
    blank.style.backgroundColor = '#eee';
  } else {
    // 마지막 숫자만 빈칸
    blank.innerText = '?';
    blank.classList.add('answer-blank');
    blank.style.backgroundColor = 'salmon';
  }
  boxesDiv.appendChild(blank);
});

// 정답은 항상 마지막 숫자 하나
const correctAnswer = answers[answers.length - 1];
const choices = new Set([correctAnswer]);

// 보기 숫자 후보 생성 (정답을 기준으로 ±3 이내)
while (choices.size < 5) {
  const fake = correctAnswer + Math.floor(Math.random() * 7 - 3);
  if (fake !== correctAnswer && fake > 0 && fake < 120) {
    choices.add(fake);
  }
}

// 보기 버튼 생성 (숫자 1개만 표시)
Array.from(choices)
  .sort(() => Math.random() - 0.5)
  .forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerText = choice;

    btn.onclick = () => {
      if (Number(choice) === correctAnswer) {
        correctCount++;
        progressBar.children[questionIndex].classList.add('correct');
        sounds.correct.play();
      } else {
        progressBar.children[questionIndex].classList.add('incorrect');
        sounds.wrong.play();
      }
      questionIndex++;
      showQuestion();
    };

    choicesDiv.appendChild(btn);
  });



// 결과
function showResult() {
  gameScreen.style.display = 'none';
  resultScreen.style.display = 'block';
  const score = Math.round((correctCount / 20) * 100);
  const timeTaken = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById('score').innerText = `점수: ${score}점 (${correctCount}/20)`;
  document.getElementById('time').innerText = `걸린 시간: ${timeTaken}초`;
}
