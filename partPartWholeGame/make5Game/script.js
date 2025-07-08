const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');
const progressBar = document.getElementById('progress-bar');
const problemLeft = document.getElementById('problemLeft');
const problemRight = document.getElementById('problemRight');
const placeholderImg = document.getElementById('placeholderImg');
const container = document.getElementById('game-container');
const celebration = document.getElementById('celebration');

const results = Array(20).fill(null);
let currentIndex = 0;
const startTime = Date.now();

const colors = ['purple', 'blue', 'green', 'orange', 'yellow'];
const all = [];

colors.forEach(color => {
  for (let n = 0; n <= 5; n++) {
    all.push({ color, number: n });
  }
});

const problemsData = all.sort(() => Math.random() - 0.5).slice(0, 20);
const selectedProblems = problemsData;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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
  const { color } = selectedProblems[index];
  const shown = Math.floor(Math.random() * 6); // 0~5
  const answer = 5 - shown;
  const isLeftBlank = Math.random() < 0.5;

   placeholderImg.src = `images/placeholders/${color}5.png`;

  if (isLeftBlank) {
    problemLeft.src = `images/problems/${color}_blank.png`;
    problemRight.src = `images/problems/${color}${shown}.png`;
  } else {
    problemLeft.src = `images/problems/${color}${shown}.png`;
    problemRight.src = `images/problems/${color}_blank.png`;
  }

  let choices = Array.from({ length: 6 }, (_, i) => i).filter(n => n !== answer);
  choices = shuffle(choices).slice(0, 4);
  choices.push(answer);
  choices = shuffle(choices);

  container.innerHTML = '';
  container.style.display = 'flex';
  container.style.flexWrap = 'wrap';
  container.style.justifyContent = 'center';
  container.style.gap = '12px';

  choices.forEach((choice) => {
    const img = document.createElement('img');
    img.src = `images/answers/${choice}.png`;
    img.className = 'answer-img';

    img.onclick = () => {
      const selectedImg = `images/problems/${color}${choice}.png`;

      if (choice === answer) {
        correctSound.play();
        results[index] = true;
      } else {
        wrongSound.play();
        results[index] = false;
      }

      // 클릭한 숫자가 문제칸의 빈칸에 채워지도록 설정
      if (isLeftBlank) {
        problemLeft.src = selectedImg;
      } else {
        problemRight.src = selectedImg;
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
