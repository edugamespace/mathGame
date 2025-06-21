const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');
const progressBar = document.getElementById('progress-bar');
const num1El = document.getElementById('num1');
const num2El = document.getElementById('num2');
const placeholder = document.getElementById('placeholder');
const container = document.getElementById('game-container');
const celebration = document.getElementById('celebration');

const results = Array(20).fill(null);
const problems = [];
let currentIndex = 0;
const startTime = Date.now();

for (let i = 0; i < results.length; i++) {
  const n1 = Math.floor(Math.random() * 5) + 1;
  const n2 = Math.floor(Math.random() * 5) + 1;
  problems.push({ n1, n2, answer: n1 + n2 });
}

function updateProgressBar() {
  progressBar.innerHTML = '';
  results.forEach((res, i) => {
    const box = document.createElement('div');
    box.className = 'progress-box';
    if (res === true) box.classList.add('correct');
    else if (res === false) box.classList.add('incorrect');
    box.onclick = () => {
      currentIndex = i;
      loadProblem(i);
    };
    progressBar.appendChild(box);
  });
}

function loadProblem(index) {

    // ✅ 이전 문제의 숫자 이미지 제거
  const placeholderNumImg = document.getElementById('placeholder-number');
  placeholderNumImg.src = '';
  
  const { n1, n2, answer } = problems[index];

  // 🎨 사용할 색상들
  const colorKeys = ['purple', 'blue', 'green', 'orange', 'yellow'];
  const color = colorKeys[Math.floor(Math.random() * colorKeys.length)];

  // 문제 이미지 경로 설정
  num1El.src = `images/problems/${color}${n1}.png`;
  num2El.src = `images/problems/${color}${n2}.png`;

  // placeholder 이미지도 동일한 색상으로 설정
  placeholder.src = `images/placeholders/blank_box_${color}.png`;

  // 정답 포함 보기 5개 생성
  let choices = [answer - 2, answer - 1, answer, answer + 1, answer + 2]
    .filter(n => n >= 1 && n <= 12);
  choices = [...new Set(choices)];
  if (!choices.includes(answer)) {
    choices[Math.floor(Math.random() * choices.length)] = answer;
  }
  choices.sort(() => Math.random() - 0.5);

  container.innerHTML = '';
  choices.forEach(choice => {
    const img = document.createElement('img');
    img.src = `images/answers/${choice}.png`;
    img.className = 'answer-img';
   img.onclick = () => {
  // ✅ 클릭한 숫자를 placeholder 위에 표시
  const placeholderNumImg = document.getElementById('placeholder-number');
  placeholderNumImg.src = `images/answers/${choice}.png`;

  // ✅ 정답 판별
  if (choice === answer) {
    correctSound.play();
    results[index] = true;
  } else {
    wrongSound.play();
    results[index] = false;
  }

  updateProgressBar();
  setTimeout(nextProblem, 700);
};

    container.appendChild(img);
  });
}



function nextProblem() {
  if (results.every(r => r !== null)) {
    const score = results.filter(r => r).length;
      const finalScore = score * 5; // 100점 만점 환산

    const scoreText = document.getElementById('final-score-text');
    const messageText = document.getElementById('final-score-message');

    scoreText.textContent = `${finalScore}점`;
    if (finalScore >= 55) {
      messageText.textContent = '🎆 참 잘했어요!';
    } else {
      messageText.textContent = '😊 조금 더 연습해 볼까요?';
    }

// ✅ 시간 계산
  const endTime = Date.now();
  const elapsedSec = Math.floor((endTime - startTime) / 1000);
  const timeText = document.createElement('div');
  timeText.textContent = `⏱ 걸린 시간: ${elapsedSec}초`;
  timeText.style.marginTop = '60px';
  messageText.insertAdjacentElement('afterend', timeText);

    celebration.style.display = 'flex';
    return;
  }
  if (currentIndex < results.length - 1) {
    currentIndex++;
    loadProblem(currentIndex);
  }
}

updateProgressBar();
loadProblem(currentIndex);