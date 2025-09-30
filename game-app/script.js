const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
const startButton = document.getElementById('start-button');
const statusElement = document.getElementById('status');
const scoreElement = document.getElementById('score');
const healthElement = document.getElementById('health');
const highScoreElement = document.getElementById('high-score');

const keysPressed = new Set();
const pointer = { x: canvas.width / 2, y: canvas.height / 2 };

const PLAYER_RADIUS = 20;
const BULLET_RADIUS = 6;
const ENEMY_RADIUS = 24;
const FIRE_RATE = 0.18; // seconds between shots
const ENEMY_SPAWN_INTERVAL = 1.2; // seconds

let animationFrameId = null;
let lastTimestamp = 0;
let spawnAccumulator = 0;
let highScore = Number(localStorage.getItem('neon-arena-high-score')) || 0;

const gameState = {
  active: false,
  score: 0,
  health: 3,
  player: {
    x: canvas.width / 2,
    y: canvas.height / 2,
    speed: 280,
    angle: 0,
  },
  bullets: [],
  enemies: [],
  fireCooldown: 0,
  isShooting: false,
};

highScoreElement.textContent = highScore.toString();

function startGame() {
  if (gameState.active) return;

  resetGame();
  gameState.active = true;
  statusElement.classList.add('hidden');
  startButton.disabled = true;
  lastTimestamp = performance.now();
  animationFrameId = requestAnimationFrame(loop);
}

function resetGame() {
  gameState.score = 0;
  gameState.health = 3;
  gameState.player.x = canvas.width / 2;
  gameState.player.y = canvas.height / 2;
  gameState.player.angle = 0;
  gameState.bullets.length = 0;
  gameState.enemies.length = 0;
  gameState.fireCooldown = 0;
  spawnAccumulator = 0;
  updateHUD();
}

function endGame(message) {
  gameState.active = false;
  cancelAnimationFrame(animationFrameId);
  startButton.disabled = false;
  statusElement.innerHTML = `<h2>${message}</h2><p>Press Start Match to try again.</p>`;
  statusElement.classList.remove('hidden');

  if (gameState.score > highScore) {
    highScore = gameState.score;
    highScoreElement.textContent = highScore.toString();
    localStorage.setItem('neon-arena-high-score', String(highScore));
  }
}

function loop(timestamp) {
  const delta = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  update(delta);
  render();

  if (gameState.active) {
    animationFrameId = requestAnimationFrame(loop);
  }
}

function update(delta) {
  handleMovement(delta);
  handleShooting(delta);
  updateBullets(delta);
  updateEnemies(delta);
  detectCollisions();
}

function handleMovement(delta) {
  const horizontal = (keysPressed.has('d') || keysPressed.has('ArrowRight') ? 1 : 0) -
    (keysPressed.has('a') || keysPressed.has('ArrowLeft') ? 1 : 0);
  const vertical = (keysPressed.has('s') || keysPressed.has('ArrowDown') ? 1 : 0) -
    (keysPressed.has('w') || keysPressed.has('ArrowUp') ? 1 : 0);

  const magnitude = Math.hypot(horizontal, vertical);
  if (magnitude > 0) {
    const normalizedX = horizontal / magnitude;
    const normalizedY = vertical / magnitude;
    gameState.player.x += normalizedX * gameState.player.speed * delta;
    gameState.player.y += normalizedY * gameState.player.speed * delta;
  }

  gameState.player.x = Math.max(PLAYER_RADIUS, Math.min(canvas.width - PLAYER_RADIUS, gameState.player.x));
  gameState.player.y = Math.max(PLAYER_RADIUS, Math.min(canvas.height - PLAYER_RADIUS, gameState.player.y));
  gameState.player.angle = Math.atan2(pointer.y - gameState.player.y, pointer.x - gameState.player.x);
}

function handleShooting(delta) {
  gameState.fireCooldown = Math.max(0, gameState.fireCooldown - delta);
  if (!gameState.isShooting || gameState.fireCooldown > 0) return;

  spawnBullet();
  gameState.fireCooldown = FIRE_RATE;
}

function spawnBullet() {
  const bulletSpeed = 620;
  gameState.bullets.push({
    x: gameState.player.x + Math.cos(gameState.player.angle) * (PLAYER_RADIUS + 6),
    y: gameState.player.y + Math.sin(gameState.player.angle) * (PLAYER_RADIUS + 6),
    angle: gameState.player.angle,
    speed: bulletSpeed,
    lifetime: 0,
  });
}

function updateBullets(delta) {
  for (let index = gameState.bullets.length - 1; index >= 0; index -= 1) {
    const bullet = gameState.bullets[index];
    bullet.x += Math.cos(bullet.angle) * bullet.speed * delta;
    bullet.y += Math.sin(bullet.angle) * bullet.speed * delta;
    bullet.lifetime += delta;

    if (
      bullet.x < -BULLET_RADIUS ||
      bullet.x > canvas.width + BULLET_RADIUS ||
      bullet.y < -BULLET_RADIUS ||
      bullet.y > canvas.height + BULLET_RADIUS ||
      bullet.lifetime > 2.2
    ) {
      gameState.bullets.splice(index, 1);
    }
  }
}

function updateEnemies(delta) {
  spawnAccumulator += delta;
  if (spawnAccumulator >= ENEMY_SPAWN_INTERVAL) {
    spawnAccumulator -= ENEMY_SPAWN_INTERVAL;
    spawnEnemy();
  }

  for (let index = gameState.enemies.length - 1; index >= 0; index -= 1) {
    const enemy = gameState.enemies[index];
    const angleToPlayer = Math.atan2(gameState.player.y - enemy.y, gameState.player.x - enemy.x);
    enemy.x += Math.cos(angleToPlayer) * enemy.speed * delta;
    enemy.y += Math.sin(angleToPlayer) * enemy.speed * delta;
    enemy.rotation = angleToPlayer;
  }
}

function spawnEnemy() {
  const perimeter = Math.random() * (canvas.width * 2 + canvas.height * 2);
  let x;
  let y;

  if (perimeter < canvas.width) {
    x = perimeter;
    y = -ENEMY_RADIUS;
  } else if (perimeter < canvas.width + canvas.height) {
    x = canvas.width + ENEMY_RADIUS;
    y = perimeter - canvas.width;
  } else if (perimeter < canvas.width * 2 + canvas.height) {
    x = perimeter - (canvas.width + canvas.height);
    y = canvas.height + ENEMY_RADIUS;
  } else {
    x = -ENEMY_RADIUS;
    y = perimeter - (canvas.width * 2 + canvas.height);
  }

  const speed = 80 + Math.random() * 70 + gameState.score * 0.2;
  gameState.enemies.push({ x, y, speed, rotation: 0, health: 1 });
}

function detectCollisions() {
  // Bullets hitting enemies
  for (let bulletIndex = gameState.bullets.length - 1; bulletIndex >= 0; bulletIndex -= 1) {
    const bullet = gameState.bullets[bulletIndex];

    for (let enemyIndex = gameState.enemies.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
      const enemy = gameState.enemies[enemyIndex];
      if (circleIntersect(bullet.x, bullet.y, BULLET_RADIUS, enemy.x, enemy.y, ENEMY_RADIUS)) {
        gameState.bullets.splice(bulletIndex, 1);
        gameState.enemies.splice(enemyIndex, 1);
        gameState.score += 10;
        updateHUD();
        break;
      }
    }
  }

  // Enemies hitting the player
  for (let index = gameState.enemies.length - 1; index >= 0; index -= 1) {
    const enemy = gameState.enemies[index];
    if (circleIntersect(enemy.x, enemy.y, ENEMY_RADIUS - 6, gameState.player.x, gameState.player.y, PLAYER_RADIUS)) {
      gameState.enemies.splice(index, 1);
      gameState.health -= 1;
      updateHUD();
      if (gameState.health <= 0) {
        endGame('Mission Failed');
      }
    }
  }
}

function circleIntersect(x1, y1, r1, x2, y2, r2) {
  const distance = Math.hypot(x2 - x1, y2 - y1);
  return distance < r1 + r2;
}

function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawPlayer();
  drawBullets();
  drawEnemies();
  drawPointer();
}

function drawBackground() {
  const gradient = context.createRadialGradient(
    gameState.player.x,
    gameState.player.y,
    40,
    canvas.width / 2,
    canvas.height / 2,
    Math.max(canvas.width, canvas.height)
  );
  gradient.addColorStop(0, 'rgba(14, 165, 233, 0.15)');
  gradient.addColorStop(1, 'rgba(15, 23, 42, 0.85)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  context.lineWidth = 1;
  const gridSize = 60;
  for (let x = gridSize; x < canvas.width; x += gridSize) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }
  for (let y = gridSize; y < canvas.height; y += gridSize) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }
}

function drawPlayer() {
  context.save();
  context.translate(gameState.player.x, gameState.player.y);
  context.rotate(gameState.player.angle);

  context.fillStyle = '#38bdf8';
  context.beginPath();
  context.arc(0, 0, PLAYER_RADIUS, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#0f172a';
  context.fillRect(0, -6, PLAYER_RADIUS + 14, 12);

  context.restore();
}

function drawBullets() {
  context.fillStyle = '#facc15';
  gameState.bullets.forEach((bullet) => {
    context.beginPath();
    context.arc(bullet.x, bullet.y, BULLET_RADIUS, 0, Math.PI * 2);
    context.fill();
  });
}

function drawEnemies() {
  gameState.enemies.forEach((enemy) => {
    context.save();
    context.translate(enemy.x, enemy.y);
    context.rotate(enemy.rotation);

    context.fillStyle = '#f97316';
    context.beginPath();
    context.arc(0, 0, ENEMY_RADIUS, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = '#1f2937';
    context.fillRect(-ENEMY_RADIUS / 2, -6, ENEMY_RADIUS, 12);
    context.restore();
  });
}

function drawPointer() {
  context.save();
  context.strokeStyle = 'rgba(248, 250, 252, 0.8)';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(pointer.x - 12, pointer.y);
  context.lineTo(pointer.x + 12, pointer.y);
  context.moveTo(pointer.x, pointer.y - 12);
  context.lineTo(pointer.x, pointer.y + 12);
  context.stroke();
  context.restore();
}

function updateHUD() {
  scoreElement.textContent = gameState.score.toString();
  healthElement.textContent = gameState.health.toString();
}

function handleKeydown(event) {
  if (event.repeat) return;
  if (event.code === 'Space') {
    gameState.isShooting = true;
    event.preventDefault();
  }
  keysPressed.add(event.key);
}

function handleKeyup(event) {
  keysPressed.delete(event.key);
  if (event.code === 'Space') {
    gameState.isShooting = false;
  }
}

function handleMouseMove(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = (event.clientX - rect.left) * (canvas.width / rect.width);
  pointer.y = (event.clientY - rect.top) * (canvas.height / rect.height);
}

function handleMouseDown(event) {
  if (event.button !== 0) return;
  gameState.isShooting = true;
}

function handleMouseUp(event) {
  if (event.button !== 0) return;
  gameState.isShooting = false;
}

function handleLeave() {
  gameState.isShooting = false;
}

startButton.addEventListener('click', startGame);
document.addEventListener('keydown', handleKeydown);
document.addEventListener('keyup', handleKeyup);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mouseleave', handleLeave);

updateHUD();
render();
