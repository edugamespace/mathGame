const startTime = Date.now();

const problems = [];

while (problems.length < 20) {
  const num = Math.floor(Math.random() * 20) + 1; // 1~20
  const type = Math.floor(Math.random() * 5) + 1; // 1~5

  let answer, image;

  if (type === 1) {
  answer = num + 1;
  if (answer > 100) continue;
  image = `images/problems/plus_${num}_1.png`;
} else if (type === 2) {
  answer = num + 2;
  if (answer > 100) continue;
  image = `images/problems/plus_${num}_2.png`;
} else if (type === 3) {
  answer = num + 3;
  if (answer > 100) continue;
  image = `images/problems/plus_${num}_3.png`;
} else if (type === 4) {
  answer = num + 4;
  if (answer > 100) continue;
  image = `images/problems/plus_${num}_4.png`;
} else { // type === 5
  answer = num + 5;
  if (answer > 100) continue;
  image = `images/problems/plus_${num}_5.png`;
}
  problems.push({ image, answer });
}


const correctSound = new Audio('sounds/correct.mp3');
const wrongSound = new Audio('sounds/wrong.mp3');

const progressBar = document.getElementById('progress-bar');
const imageEl = document.getElementById('problemImage');
const container = document.getElementById('game-container');
const celebration = document.getElementById('celebration');

let currentIndex = 0;
const results = Array(problems.length).fill(null);

function updateProgressBar() {
  progressBar.innerHTML = '';
  results.forEach((res, i) => {
    const box = document.createElement('div');
    box.className = 'progress-box';
    if (res === true) box.classList.add('correct');
    else if (res === false) box.classList.add('incorrect');
    box.onclick = () => {
      currentIndex = i;
      loadProblem(currentIndex);
    };
    progressBar.appendChild(box);
  });
}

function loadProblem(index) {
  const prob = problems[index];
  imageEl.src = prob.image;

  const correct = prob.answer;
  const options = [];
  const offset = Math.floor(Math.random() * 4); // 0~3
  for (let i = correct - 2 + offset; i <= correct + 2 + offset; i++) {
    if (i >= 1 && i <= 100) options.push(i);
  }
  const unique = [...new Set(options)];
  const choices = unique.slice(0, 5);
  if (!choices.includes(correct)) choices[Math.floor(Math.random() * 5)] = correct;

  container.innerHTML = '';
  
// 문제 단위 색상 1개 선택
  const pastelColors = ['#fde6e6', '#f9ebe1', '#fcf0d4', '#fbfcd4', '#dfe9cd', '#e1fef6', '#bee7ee', '#dce3fd', '#e5ddfd', '#fef0fc'];
  const problemColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];

  choices.sort(() => Math.random() - 0.5).forEach(n => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.backgroundColor = problemColor;

    const img = document.createElement('img');
    img.src = `images/answers/${n}.png`;
    card.appendChild(img);

    card.onclick = () => {
      if (n === correct) {
        correctSound.play();
        results[index] = true;
        updateProgressBar();
        setTimeout(nextProblem, 700);
      } else {
        wrongSound.play();
        results[index] = false;
        updateProgressBar();
        setTimeout(nextProblem, 700);
      }
    };
    container.appendChild(card);
  });
}



updateProgressBar();
loadProblem(currentIndex);


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
  if (currentIndex < problems.length - 1) {
    currentIndex++;
    loadProblem(currentIndex);
  }
}
