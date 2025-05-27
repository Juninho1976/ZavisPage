// DOM Elements
const playerNameInputSnake = document.getElementById('player-name-input-snake');
const startGameButtonSnake = document.getElementById('start-game-button-snake');
const nameErrorSnake = document.getElementById('name-error-snake');
const playerNameSectionSnake = document.getElementById('player-name-section-snake');
const gameContentSnake = document.getElementById('game-content-snake');
const displayPlayerNameSnake = document.getElementById('display-player-name-snake');
const scoreDisplaySnake = document.getElementById('score-snake');
const gameOverSectionSnake = document.getElementById('game-over-section-snake');
const finalPlayerNameSnake = document.getElementById('final-player-name-snake');
const finalScoreDisplaySnake = document.getElementById('final-score-snake');
const playAgainButtonSnake = document.getElementById('play-again-button-snake');
const highScoresListSnake = document.getElementById('high-scores-list-snake');
const gameBoard = document.getElementById('game-board');
const ctx = gameBoard.getContext('2d');

// Game Constants
const GRID_SIZE = 20; // Size of each snake segment and food item in pixels
const CANVAS_WIDTH = gameBoard.width;
const CANVAS_HEIGHT = gameBoard.height;
const TILE_COUNT_X = CANVAS_WIDTH / GRID_SIZE;
const TILE_COUNT_Y = CANVAS_HEIGHT / GRID_SIZE;
const INITIAL_SNAKE_LENGTH = 3;
const GAME_SPEED = 150; // Milliseconds, lower is faster

// Game State
let currentPlayerNameSnake = '';
let scoreSnake = 0;
let snake;
let food;
let dx; // direction x
let dy; // direction y
let changingDirection; // To prevent rapid 180 turns
let gameLoopInterval;

const RUDE_WORDS_SNAKE = ["poop", "butt", "fart", "dummy", "stupid"]; // Shared or separate list
const MAX_HIGH_SCORES_SNAKE = 10;
let highScoresSnake = JSON.parse(localStorage.getItem('classicSnakeHighScores')) || [];

// Event Listeners
startGameButtonSnake.addEventListener('click', handleStartGameSnake);
playAgainButtonSnake.addEventListener('click', resetAndStartGameSnake);
playerNameInputSnake.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleStartGameSnake();
    }
});
document.addEventListener('keydown', changeDirection);

function isNameValidSnake(name) {
    if (!name.trim()) {
        nameErrorSnake.textContent = "Please enter a name!";
        return false;
    }
    const lowerCaseName = name.toLowerCase();
    for (const rudeWord of RUDE_WORDS_SNAKE) {
        if (lowerCaseName.includes(rudeWord)) {
            nameErrorSnake.textContent = "That name is a bit cheeky! Try another one.";
            return false;
        }
    }
    nameErrorSnake.textContent = "";
    return true;
}

function handleStartGameSnake() {
    const name = playerNameInputSnake.value;
    if (isNameValidSnake(name)) {
        currentPlayerNameSnake = name;
        playerNameSectionSnake.style.display = 'none';
        gameContentSnake.style.display = 'block';
        gameOverSectionSnake.style.display = 'none';
        displayPlayerNameSnake.textContent = currentPlayerNameSnake;
        initGame();
    }
}

function initGame() {
    scoreSnake = 0;
    scoreDisplaySnake.textContent = scoreSnake;
    snake = [];
    // Initial snake position (center-ish)
    const startX = Math.floor(TILE_COUNT_X / 2);
    const startY = Math.floor(TILE_COUNT_Y / 2);
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
        snake.push({ x: startX - i, y: startY });
    }
    dx = 1; // Moving right initially
    dy = 0;
    changingDirection = false;
    placeFood();
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameLoop, GAME_SPEED);
}

function resetAndStartGameSnake() {
    gameOverSectionSnake.style.display = 'none';
    playerNameSectionSnake.style.display = 'block';
    playerNameInputSnake.value = "";
    gameContentSnake.style.display = 'none';
}

function gameLoop() {
    if (checkCollision()) {
        gameOver();
        return;
    }
    changingDirection = false;
    clearCanvas();
    moveSnake();
    drawFood();
    drawSnake();
}

function clearCanvas() {
    ctx.fillStyle = '#000'; // Black background
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawSnakeSegment(segment) {
    ctx.fillStyle = '#32cd32'; // LimeGreen for snake
    ctx.strokeStyle = '#006400'; // DarkGreen border
    ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    ctx.strokeRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
}

function drawSnake() {
    snake.forEach(drawSnakeSegment);
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head); // Add new head

    // Check if food is eaten
    if (head.x === food.x && head.y === food.y) {
        scoreSnake++;
        scoreDisplaySnake.textContent = scoreSnake;
        placeFood(); // Place new food
    } else {
        snake.pop(); // Remove tail if no food eaten
    }
}

function placeFood() {
    food = {
        x: Math.floor(Math.random() * TILE_COUNT_X),
        y: Math.floor(Math.random() * TILE_COUNT_Y)
    };
    // Ensure food doesn't spawn on the snake
    for (const segment of snake) {
        if (food.x === segment.x && food.y === segment.y) {
            placeFood(); // Recursively try again
            return;
        }
    }
}

function drawFood() {
    ctx.fillStyle = '#ff4500'; // OrangeRed for food
    ctx.strokeStyle = '#dc143c'; // Crimson border
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    ctx.strokeRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
}

function changeDirection(event) {
    if (changingDirection) return;
    changingDirection = true;

    const keyPressed = event.key;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if ((keyPressed === "ArrowLeft" || keyPressed.toLowerCase() === "a") && !goingRight) {
        dx = -1; dy = 0;
    } else if ((keyPressed === "ArrowUp" || keyPressed.toLowerCase() === "w") && !goingDown) {
        dx = 0; dy = -1;
    } else if ((keyPressed === "ArrowRight" || keyPressed.toLowerCase() === "d") && !goingLeft) {
        dx = 1; dy = 0;
    } else if ((keyPressed === "ArrowDown" || keyPressed.toLowerCase() === "s") && !goingUp) {
        dx = 0; dy = 1;
    }
}

function checkCollision() {
    const head = snake[0];
    // Wall collision
    if (head.x < 0 || head.x >= TILE_COUNT_X || head.y < 0 || head.y >= TILE_COUNT_Y) {
        return true;
    }
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function gameOver() {
    clearInterval(gameLoopInterval);
    gameContentSnake.style.display = 'none';
    gameOverSectionSnake.style.display = 'block';
    finalPlayerNameSnake.textContent = currentPlayerNameSnake;
    finalScoreDisplaySnake.textContent = scoreSnake;
    updateHighScoresSnake(currentPlayerNameSnake, scoreSnake);
    displayHighScoresSnake();
}

function updateHighScoresSnake(name, score) {
    highScoresSnake.push({ name, score });
    highScoresSnake.sort((a, b) => b.score - a.score);
    highScoresSnake = highScoresSnake.slice(0, MAX_HIGH_SCORES_SNAKE);
    localStorage.setItem('classicSnakeHighScores', JSON.stringify(highScoresSnake));
}

function displayHighScoresSnake() {
    highScoresListSnake.innerHTML = '';
    if (highScoresSnake.length === 0) {
        highScoresListSnake.innerHTML = '<li>No high scores yet. Slither your way to the top!</li>';
        return;
    }
    highScoresSnake.forEach(scoreEntry => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${scoreEntry.name}:</strong> ${scoreEntry.score}`;
        highScoresListSnake.appendChild(li);
    });
}

// Initial display of high scores if game over section is visible
// (e.g. on page load if it was last state)
// displayHighScoresSnake(); // Call if you want to show it always, even before first game over.