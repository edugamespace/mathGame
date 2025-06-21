const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');
const progressBar = document.getElementById('progress-bar');
const problemImg = document.getElementById('problemImg');
const placeholderLeft = document.getElementById('placeholderLeft');
const placeholderRight = document.getElementById('placeholderRight');
const container = document.getElementById('game-container');
const celebration = document.getElementById('celebration');

const results = Array(20).fill(null);
const problems = [];
let currentIndex = 0;
const startTime = Date.now();

// 문제 생성: 각 색상에서 2~10까지 총 5색 × 9문제 = 45문제 중 랜덤 20개
const colors = ['purple', 'blue', 'green', 'orange', 'yellow'];
let all = [];
colors.forEach(color => {
  for (let n = 2; n <= 10; n++) {
    all.push({ color, number: n });
  }
});
all = all.sort(() => Math.random() - 0.5).slice(0, 20);
const problemsData = all;

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
  const { color, number } = problemsData[index];
  const answer = Math.floor(Math.random() * (number - 1)) + 1; // 1 이상 number-1 이하
  const shown = number - answer; // 보여줄 숫자

  // 문제 이미지
  problemImg.src = `images/problems/problem_${color}${number}.png`;

  // placeholder: 한 쪽은 blank, 한 쪽은 shown
  const isLeftBlank = Math.random() < 0.5;
  if (isLeftBlank) {
    placeholderLeft.src = `images/placeholders/${color}_blank.png`;
    placeholderRight.src = `images/placeholders/${color}${shown}.png`;
  } else {
    placeholderLeft.src = `images/placeholders/${color}${shown}.png`;
    placeholderRight.src = `images/placeholders/${color}_blank.png`;
  }

  // 보기 구성
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
    const finalScore = score * 5;

    document.getElementById('final-score-text').textContent = `${finalScore}점`;
    document.getElementById('final-score-message').textContent =
      finalScore >= 55 ? '🎆 참 잘했어요!' : '😊 조금 더 연습해 볼까요?';

    const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
    const timeText = document.createElement('div');
    timeText.textContent = `⏱ 걸린 시간: ${elapsedSec}초`;
    timeText.style.marginTop = '60px';
    document.getElementById('final-score-message').insertAdjacentElement('afterend', timeText);

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
