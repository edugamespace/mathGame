const totalQuestions = 20;
let current = 0;
let score = [];

const fruits = ['사과', '참외', '포도', '수박', '파인애플', '딸기', '망고', '레몬'];
const fruitImagePath = (fruit, count) => `images/${fruit} (${count}).png`;
const numberImagePath = (num) => `images/숫자 (${num}).png`;

const correctSound = new Audio('sounds/correct.mp3');
const wrongSound = new Audio('sounds/wrong.mp3');

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loadQuestion() {
  if (current >= totalQuestions) {
    showResult();
    return;
  }

  // 문제용 무작위 과일 & 개수
  const count = randomInt(1, 5);
  const fruit = fruits[randomInt(0, fruits.length - 1)];
  const correct = count;

  // 문제 영역: 과일 (개수).png 1장만
  const numberDiv = document.getElementById('number-image');
  numberDiv.innerHTML = '';
  const img = document.createElement('img');
  img.src = fruitImagePath(fruit, count);
  img.alt = `${fruit} ${count}`;
  numberDiv.appendChild(img);

  // 보기는 숫자 1~5 고정
  const choicesDiv = document.getElementById('choices');
  choicesDiv.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const card = document.createElement('div');
    card.className = 'choice-card';
    const img = document.createElement('img');
    img.src = numberImagePath(i);
    img.alt = `${i}`;
    card.appendChild(img);
    card.addEventListener('click', () => handleAnswer(i === correct, i));
    choicesDiv.appendChild(card);
  }
}

function handleAnswer(isCorrect, choice) {
  const numberSound = new Audio(`sounds/${choice}.mp3`);
  numberSound.play().then(() => {
    setTimeout(() => {
      if (isCorrect) correctSound.play();
      else wrongSound.play();
    }, 300);
  });

  score[current] = isCorrect ? 'correct' : 'wrong';
  updateProgressBar();
  current++;
  setTimeout(loadQuestion, 1000);
}

function updateProgressBar() {
  const bar = document.getElementById('progress-bar');
  bar.innerHTML = '';
  for (let i = 0; i < totalQuestions; i++) {
    const box = document.createElement('div');
    box.className = 'progress-box';
    if (score[i]) box.classList.add(score[i]);
    bar.appendChild(box);
  }
}

function showResult() {
  const correctCount = score.filter(s => s === 'correct').length;
  const percent = Math.round((correctCount / totalQuestions) * 100);

  const textEl = document.getElementById('final-score-text');
  const messageEl = document.getElementById('final-score-message');
  const celebrationEl = document.getElementById('celebration');

  textEl.textContent = `${percent}점`;

  if (percent >= 55) {
    messageEl.textContent = '🎉 참 잘했어요!';
    messageEl.style.color = '#72defc';
  } else {
    messageEl.textContent = '😊 조금 더 연습해 볼까요?';
    messageEl.style.color = '#fc9373';
  }

  celebrationEl.style.display = 'flex';
}

window.onload = () => {
  updateProgressBar();
  loadQuestion();
};
