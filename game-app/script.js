const GRID_SIZE = 9;
const ROUND_DURATION = 30; // seconds
const MOLE_MIN_TIME = 500; // ms
const MOLE_MAX_TIME = 1100; // ms

const gridElement = document.querySelector('.grid');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const timerElement = document.getElementById('timer');
const startButton = document.getElementById('start-button');

let score = 0;
let highScore = Number(localStorage.getItem('wam-high-score')) || 0;
let timeRemaining = ROUND_DURATION;
let activeCellIndex = null;
let isPlaying = false;
let roundIntervalId = null;
let moleTimeoutId = null;
let streak = 0;

highScoreElement.textContent = highScore;

function createGrid() {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < GRID_SIZE; index += 1) {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cell';
    cell.setAttribute('aria-label', `Hole ${index + 1}`);
    cell.dataset.index = index.toString();

    const mole = document.createElement('div');
    mole.className = 'mole';

    const streakBadge = document.createElement('div');
    streakBadge.className = 'streak';
    streakBadge.textContent = '';

    cell.append(mole, streakBadge);
    cell.addEventListener('click', handleCellClick);
    fragment.appendChild(cell);
  }

  gridElement.appendChild(fragment);
}

function handleCellClick(event) {
  if (!isPlaying) return;

  const cell = event.currentTarget;
  const clickedIndex = Number(cell.dataset.index);
  const streakBadge = cell.querySelector('.streak');

  if (clickedIndex === activeCellIndex) {
    score += 1;
    streak += 1;
    scoreElement.textContent = score;
    streakBadge.textContent = `🔥 Streak x${streak}`;
    cell.classList.remove('active');
    activeCellIndex = null;
    triggerNextMole();
  } else {
    streak = 0;
    streakBadge.textContent = 'Miss!';
    setTimeout(() => {
      streakBadge.textContent = '';
    }, 600);
  }
}

function triggerNextMole() {
  clearTimeout(moleTimeoutId);

  const nextDelay = getRandomInt(MOLE_MIN_TIME, MOLE_MAX_TIME);

  moleTimeoutId = setTimeout(() => {
    const cells = Array.from(gridElement.children);

    if (activeCellIndex !== null) {
      cells[activeCellIndex].classList.remove('active');
      const badge = cells[activeCellIndex].querySelector('.streak');
      badge.textContent = '';
    }

    const availableIndices = cells
      .map((cell, index) => index)
      .filter((index) => index !== activeCellIndex);

    activeCellIndex =
      availableIndices[Math.floor(Math.random() * availableIndices.length)];
    cells[activeCellIndex].classList.add('active');
  }, nextDelay);
}

function startGame() {
  if (isPlaying) return;

  isPlaying = true;
  startButton.disabled = true;
  score = 0;
  streak = 0;
  timeRemaining = ROUND_DURATION;
  scoreElement.textContent = score;
  timerElement.textContent = timeRemaining;

  triggerNextMole();

  roundIntervalId = setInterval(() => {
    timeRemaining -= 1;
    timerElement.textContent = timeRemaining;

    if (timeRemaining <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  clearInterval(roundIntervalId);
  clearTimeout(moleTimeoutId);

  const cells = Array.from(gridElement.children);
  cells.forEach((cell) => {
    cell.classList.remove('active');
    const badge = cell.querySelector('.streak');
    badge.textContent = '';
  });

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('wam-high-score', highScore);
    highScoreElement.textContent = highScore;
  }

  activeCellIndex = null;
  isPlaying = false;
  startButton.disabled = false;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

createGrid();
startButton.addEventListener('click', startGame);
