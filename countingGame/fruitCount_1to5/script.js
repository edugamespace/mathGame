
const totalQuestions = 20;
let current = 0;
let score = [];

const fruits = ['사과', '참외', '포도', '수박', '파인애플', '딸기', '망고', '레몬'];
const numberImagePath = (num) => `images/숫자 (${num}).png`;
const fruitImagePath = (fruit, count) => `images/${fruit} (${count}).png`;

const correctSound = new Audio('sounds/correct.mp3');
const wrongSound = new Audio('sounds/wrong.mp3');

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function loadQuestion() {
  if (current >= totalQuestions) {
    showResult();
    return;
  }

  const number = randomInt(1, 5);
  const fruit = fruits[randomInt(0, fruits.length - 1)];
  const choices = shuffle([1, 2, 3, 4, 5]);
  const correct = number;

  const numberDiv = document.getElementById('number-image');
  numberDiv.innerHTML = `<img src="${numberImagePath(number)}" alt="${number}" />`;

  const choicesDiv = document.getElementById('choices');
  choicesDiv.innerHTML = '';
  choices.forEach(choice => {
    const card = document.createElement('div');
    card.className = 'choice-card';
    const img = document.createElement('img');
    img.src = fruitImagePath(fruit, choice);
    img.alt = `${fruit} ${choice}`;
    card.appendChild(img);
    card.addEventListener('click', () => handleAnswer(choice === correct, choice));
    choicesDiv.appendChild(card);
  });
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

  const container = document.body;
  container.innerHTML = '';

  const resultText = document.createElement('div');
  resultText.textContent = `점수: ${correctCount} / ${totalQuestions}`;
  resultText.style.fontSize = '50px';
  resultText.style.fontWeight = 'bold';
  resultText.style.marginBottom = '40px';
  resultText.style.textAlign = 'center';

  const restartBtn = document.createElement('button');
  restartBtn.textContent = '다시 해볼래요';
  restartBtn.style.padding = '12px 24px';
  restartBtn.style.fontSize = '30px';
  restartBtn.style.borderRadius = '8px';
  restartBtn.style.cursor = 'pointer';
  restartBtn.onclick = restartGame;

  container.appendChild(resultText);
  container.appendChild(restartBtn);
}

function restartGame() {
  location.reload();
}

window.onload = () => {
  updateProgressBar();
  loadQuestion();
};
