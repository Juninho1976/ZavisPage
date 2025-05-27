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
let GRID_SIZE = 20; // Will be calculated
let CANVAS_WIDTH = gameBoard.width; // Initial, will be updated
let CANVAS_HEIGHT = gameBoard.height; // Initial, will be updated
const BASE_TILE_COUNT = 20; // We aim for a 20x20 grid conceptually
let TILE_COUNT_X = BASE_TILE_COUNT;
let TILE_COUNT_Y = BASE_TILE_COUNT;
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

// On-screen control listeners
document.getElementById('btn-up').addEventListener('click', () => simulateKeyPress('ArrowUp'));
document.getElementById('btn-left').addEventListener('click', () => simulateKeyPress('ArrowLeft'));
document.getElementById('btn-down').addEventListener('click', () => simulateKeyPress('ArrowDown'));
document.getElementById('btn-right').addEventListener('click', () => simulateKeyPress('ArrowRight'));

function simulateKeyPress(key) {
    // Create a new KeyboardEvent (or a simple object if preferred for this use case)
    // and dispatch it or directly call changeDirection.
    // Direct call is simpler here.
    changeDirection({ key: key, preventDefault: () => {} }); // Mock event object
}


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
        initGame(); // Changed from initGame to initGame
    }
}

function updateCanvasDimensions() {
    // Get the actual displayed size of the canvas from its parent or CSS
    const style = window.getComputedStyle(gameBoard);
    let newWidth = parseInt(style.width);
    let newHeight = parseInt(style.height);

    // Fallback if computed style is 0 (e.g. display:none initially)
    // This might happen if called before the game content is visible.
    // We'll rely on the CSS max-width and aspect-ratio to guide the initial size.
    // A more robust way might be to get parent container width.
    // For now, if newWidth is 0, we can't do much. Let's assume CSS gives it a size.
    // The key is that GRID_SIZE must be > 0.

    if (newWidth === 0 || newHeight === 0) {
        // Attempt to use the canvas attribute size as a fallback if CSS size is 0
        // This could happen if the element is hidden and then shown.
        // The CSS should ideally dictate the size.
        newWidth = gameBoard.width; // The attribute, not computed style
        newHeight = gameBoard.height; // The attribute, not computed style
    }
    
    // Calculate GRID_SIZE based on the smaller dimension and BASE_TILE_COUNT
    // Ensure GRID_SIZE is at least 1 to prevent division by zero or invisible grid
    GRID_SIZE = Math.max(1, Math.floor(Math.min(newWidth, newHeight) / BASE_TILE_COUNT));

    TILE_COUNT_X = BASE_TILE_COUNT;
    TILE_COUNT_Y = BASE_TILE_COUNT;
    
    // Set the canvas rendering dimensions to be a perfect multiple of GRID_SIZE
    gameBoard.width = TILE_COUNT_X * GRID_SIZE;
    gameBoard.height = TILE_COUNT_Y * GRID_SIZE;

    // Update global constants with the *actual rendering dimensions*
    CANVAS_WIDTH = gameBoard.width;
    CANVAS_HEIGHT = gameBoard.height;

    // The CSS will still control the visual scaling of this rendered canvas.
    // e.g., style="width: 100%; height: auto;" or aspect-ratio.
    // The game logic now operates on a consistent grid based on these calculated dimensions.
}


function initGame() { // Renamed from initGame to avoid conflict if any global initGame exists
    updateCanvasDimensions(); // Calculate dimensions first
    scoreSnake = 0;
    scoreDisplaySnake.textContent = scoreSnake;
    snake = [];
    
    const startX = Math.floor(TILE_COUNT_X / 2);
    const startY = Math.floor(TILE_COUNT_Y / 2);
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
        snake.push({ x: startX - i, y: startY });
    }
    dx = 1;
    dy = 0;
    changingDirection = false;
    placeFood();
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameLoop, GAME_SPEED);
}

function resetAndStartGameSnake() {
    gameOverSectionSnake.style.display = 'none';
    gameContentSnake.style.display = 'none';

    if (currentPlayerNameSnake) {
        playerNameSectionSnake.style.display = 'none';
        gameContentSnake.style.display = 'block'; // Also ensure game content is shown
        displayPlayerNameSnake.textContent = currentPlayerNameSnake;
        initGame();
    } else {
        playerNameSectionSnake.style.display = 'block';
        playerNameInputSnake.value = "";
    }
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