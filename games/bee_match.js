// DOM Elements
const playerNameInputBM = document.getElementById('player-name-input-bm');
const startGameButtonBM = document.getElementById('start-game-button-bm');
const nameErrorBM = document.getElementById('name-error-bm');
const playerNameSectionBM = document.getElementById('player-name-section-bm');
const gameContentBM = document.getElementById('game-content-bm');
const displayPlayerNameBM = document.getElementById('display-player-name-bm');
const scoreDisplayBM = document.getElementById('score-bm');
const roundNumberDisplayBM = document.getElementById('round-number-bm');
const feedbackMessageBM = document.getElementById('feedback-message-bm');
const gameOverSectionBM = document.getElementById('game-over-section-bm');
const finalPlayerNameBM = document.getElementById('final-player-name-bm');
const finalScoreDisplayBM = document.getElementById('final-score-bm');
const playAgainButtonBM = document.getElementById('play-again-button-bm');
const highScoresListBM = document.getElementById('high-scores-list-bm');

const canvasBM = document.getElementById('game-canvas-bm');
const ctxBM = canvasBM.getContext('2d');

// Game Constants
const CANVAS_WIDTH_BM = canvasBM.width;
const CANVAS_HEIGHT_BM = canvasBM.height;
const FLOWER_COLORS = ['red', 'blue', 'yellow', 'purple']; // Could be hex codes for more specific colors
const FLOWER_RADIUS = 40;
const FLOWER_Y_POSITION = CANVAS_HEIGHT_BM - 60;
const BEE_RADIUS = 20;
const BEE_SPAWN_Y = 50;
const TOTAL_ROUNDS_BM = 10;
const REACTION_TIME_LIMIT = 1500; // 1.5 seconds for player to react
const SHORT_DELAY_BETWEEN_BEES = 500; // 0.5 seconds pause before next bee

// Game State
let currentPlayerNameBM = '';
let scoreBM = 0;
let currentRoundBM = 0;
let flowers = [];
let currentBee = null;
let currentBeeTimeoutId = null; // Timer for the current bee's lifespan
let nextBeeSpawnTimeoutId = null; // Timer for spawning the next bee
let beeSpawnTime = 0;
let canClickFlower = false;

const RUDE_WORDS_BM = ["poop", "butt", "fart", "dummy", "stupid"];
const MAX_HIGH_SCORES_BM = 10;
let highScoresBM = JSON.parse(localStorage.getItem('beeMatchHighScores')) || [];

// Flower Object
function Flower(x, y, radius, color, id) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.id = id; // e.g., 'red', 'blue'

    this.draw = function() {
        // Simple flower: circle for center, petals as smaller circles
        ctxBM.beginPath();
        ctxBM.arc(this.x, this.y, this.radius / 2, 0, Math.PI * 2); // Center
        ctxBM.fillStyle = 'brown'; // Center color
        ctxBM.fill();
        ctxBM.closePath();

        for (let i = 0; i < 5; i++) { // 5 petals
            const angle = (Math.PI * 2 / 5) * i;
            const petalX = this.x + Math.cos(angle) * (this.radius * 0.7);
            const petalY = this.y + Math.sin(angle) * (this.radius * 0.7);
            ctxBM.beginPath();
            ctxBM.arc(petalX, petalY, this.radius / 2.5, 0, Math.PI * 2);
            ctxBM.fillStyle = this.color;
            ctxBM.fill();
            ctxBM.closePath();
        }
    }
    // Check if a click is within this flower
    this.isClicked = function(clickX, clickY) {
        const distance = Math.sqrt((clickX - this.x) ** 2 + (clickY - this.y) ** 2);
        return distance < this.radius;
    }
}

// Bee Object
function Bee(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;

    this.draw = function() {
        // Simple bee: yellow body, black stripes, small wings
        ctxBM.beginPath();
        ctxBM.ellipse(this.x, this.y, this.radius * 1.2, this.radius * 0.8, 0, 0, Math.PI * 2); // Body
        ctxBM.fillStyle = this.color; // Bee's main color
        ctxBM.fill();
        ctxBM.strokeStyle = 'black';
        ctxBM.lineWidth = 2;
        ctxBM.stroke();
        ctxBM.closePath();

        // Simple wings (could be improved)
        ctxBM.beginPath();
        ctxBM.arc(this.x - this.radius * 0.7, this.y - this.radius * 0.5, this.radius * 0.5, Math.PI, Math.PI * 2);
        ctxBM.fillStyle = 'rgba(200, 200, 255, 0.7)'; // Translucent wings
        ctxBM.fill();
        ctxBM.closePath();
        ctxBM.beginPath();
        ctxBM.arc(this.x + this.radius * 0.7, this.y - this.radius * 0.5, this.radius * 0.5, Math.PI, Math.PI * 2);
        ctxBM.fillStyle = 'rgba(200, 200, 255, 0.7)';
        ctxBM.fill();
        ctxBM.closePath();
    }
}


// Event Listeners
startGameButtonBM.addEventListener('click', handleStartGameBM);
playAgainButtonBM.addEventListener('click', resetAndStartGameBM);
playerNameInputBM.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') handleStartGameBM();
});
canvasBM.addEventListener('click', handleCanvasClick);


function isNameValidBM(name) {
    if (!name.trim()) { nameErrorBM.textContent = "Please enter a name!"; return false; }
    const lowerCaseName = name.toLowerCase();
    for (const rudeWord of RUDE_WORDS_BM) {
        if (lowerCaseName.includes(rudeWord)) {
            nameErrorBM.textContent = "That name is a bit cheeky! Try another one."; return false;
        }
    }
    nameErrorBM.textContent = ""; return true;
}

function handleStartGameBM() {
    const name = playerNameInputBM.value;
    if (isNameValidBM(name)) {
        currentPlayerNameBM = name;
        playerNameSectionBM.style.display = 'none';
        gameContentBM.style.display = 'block';
        gameOverSectionBM.style.display = 'none';
        displayPlayerNameBM.textContent = currentPlayerNameBM;
        initGameBM();
    }
}

function initGameBM() {
    scoreBM = 0;
    currentRoundBM = 0;
    scoreDisplayBM.textContent = scoreBM;
    roundNumberDisplayBM.textContent = `0/${TOTAL_ROUNDS_BM}`; // Initial display before first round
    feedbackMessageBM.textContent = "";
    feedbackMessageBM.className = "";

    // Initialize flowers
    flowers = [];
    const flowerSpacing = CANVAS_WIDTH_BM / (FLOWER_COLORS.length + 1);
    FLOWER_COLORS.forEach((color, index) => {
        const x = flowerSpacing * (index + 1);
        flowers.push(new Flower(x, FLOWER_Y_POSITION, FLOWER_RADIUS, color, color));
    });

    drawGameElements(); // Draw initial state (flowers only)
    // currentRoundBM is 0, so first call to startNextRoundBM will increment it to 1
    startNextRoundBM();
}

function resetAndStartGameBM() {
    gameOverSectionBM.style.display = 'none';
    gameContentBM.style.display = 'none';
    if (currentBeeTimeoutId) clearTimeout(currentBeeTimeoutId);
    if (nextBeeSpawnTimeoutId) clearTimeout(nextBeeSpawnTimeoutId);

    if (currentPlayerNameBM) {
        playerNameSectionBM.style.display = 'none';
        gameContentBM.style.display = 'block'; // Ensure game content is shown
        displayPlayerNameBM.textContent = currentPlayerNameBM;
        initGameBM();
    } else {
        playerNameSectionBM.style.display = 'block';
        playerNameInputBM.value = "";
    }
}

function drawGameElements() {
    ctxBM.clearRect(0, 0, CANVAS_WIDTH_BM, CANVAS_HEIGHT_BM);
    flowers.forEach(flower => flower.draw());
    if (currentBee) {
        currentBee.draw();
    }
}

function spawnAndStartBeeTimer() {
    if (currentRoundBM >= TOTAL_ROUNDS_BM) { // Check if all rounds completed before spawning new
        endGameBM();
        return;
    }
    currentRoundBM++; // Increment round *before* displaying
    roundNumberDisplayBM.textContent = `${currentRoundBM}/${TOTAL_ROUNDS_BM}`;
    
    const randomColorIndex = Math.floor(Math.random() * FLOWER_COLORS.length);
    const beeColor = FLOWER_COLORS[randomColorIndex];
    const beeX = Math.random() * (CANVAS_WIDTH_BM - BEE_RADIUS * 2) + BEE_RADIUS;
    
    currentBee = new Bee(beeX, BEE_SPAWN_Y, BEE_RADIUS, beeColor);
    beeSpawnTime = Date.now();
    canClickFlower = true;
    drawGameElements();

    if (currentBeeTimeoutId) clearTimeout(currentBeeTimeoutId);
    currentBeeTimeoutId = setTimeout(handleBeeTimeout, REACTION_TIME_LIMIT);
}

function startNextRoundBM() {
    currentBee = null;
    canClickFlower = false;
    feedbackMessageBM.textContent = ""; // Clear feedback from previous round
    feedbackMessageBM.className = "";
    drawGameElements(); // Redraw without bee, clear feedback

    if (currentRoundBM < TOTAL_ROUNDS_BM) {
        if (nextBeeSpawnTimeoutId) clearTimeout(nextBeeSpawnTimeoutId);
        nextBeeSpawnTimeoutId = setTimeout(spawnAndStartBeeTimer, SHORT_DELAY_BETWEEN_BEES);
    } else {
        endGameBM(); // All rounds done
    }
}

function handleBeeTimeout() {
    if (!currentBee) return; // Bee already handled by a click

    feedbackMessageBM.textContent = "Too slow! 0 points.";
    feedbackMessageBM.className = ""; // Neutral feedback color
    currentBee = null;
    canClickFlower = false;
    drawGameElements();
    startNextRoundBM(); // Proceed to next round
}

function handleCanvasClick(event) {
    if (!currentBee || !canClickFlower) return;

    clearTimeout(currentBeeTimeoutId); // Player clicked, so clear the timeout
    canClickFlower = false; // Prevent multiple clicks for one bee

    const rect = canvasBM.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    let flowerClickedOn = null;
    for (const flower of flowers) {
        if (flower.isClicked(clickX, clickY)) {
            flowerClickedOn = flower;
            break;
        }
    }

    if (flowerClickedOn) {
        const reactionTime = Date.now() - beeSpawnTime;
        if (flowerClickedOn.color === currentBee.color) {
            if (reactionTime <= 750) { // 0.75 seconds
                scoreBM += 2;
                feedbackMessageBM.textContent = "Super Fast! +2";
            } else { // Up to 1.5 seconds
                scoreBM += 1;
                feedbackMessageBM.textContent = "Correct Match! +1";
            }
            feedbackMessageBM.className = "correct";
        } else {
            scoreBM--;
            feedbackMessageBM.textContent = "Wrong Flower! -1";
            feedbackMessageBM.className = "incorrect";
        }
    } else {
        // If user clicks empty space, the timeout will handle it.
        // No points awarded or deducted for clicking empty space.
        // To ensure the game doesn't stall, we should still proceed.
        // However, the current logic will wait for timeout if no flower is clicked.
        // Let's make clicking empty space also "resolve" the bee with 0 points.
        // Or, better, let timeout handle it to enforce quick flower clicks.
        // The current logic is fine: click a flower or timeout.
    }
    
    // Only proceed if a flower was actually clicked and resolved the bee
    if (flowerClickedOn) {
        scoreDisplayBM.textContent = scoreBM;
        currentBee = null; // Bee is resolved
        drawGameElements(); // Redraw to remove bee
        startNextRoundBM(); // Proceed to next round
    } else {
        // If no flower was clicked, the bee is still active, re-enable click and let timeout handle it or another click.
        // This might not be desired. Let's make any click resolve the current bee attempt.
        // If they click outside, it's a "miss" for that click attempt, but the bee stays until timeout or flower click.
        // The current logic is: if a flower is clicked, the bee is resolved. If not, nothing happens on this click, timeout will get it.
        // This is acceptable. The player must click a flower.
    }
}


function endGameBM() {
    if (currentBeeTimeoutId) clearTimeout(currentBeeTimeoutId);
    if (nextBeeSpawnTimeoutId) clearTimeout(nextBeeSpawnTimeoutId);
    gameContentBM.style.display = 'none';
    gameOverSectionBM.style.display = 'block';
    finalPlayerNameBM.textContent = currentPlayerNameBM;
    finalScoreDisplayBM.textContent = scoreBM;
    updateHighScoresBM(currentPlayerNameBM, scoreBM);
    displayHighScoresBM();
}

function updateHighScoresBM(name, score) {
    highScoresBM.push({ name, score });
    highScoresBM.sort((a, b) => b.score - a.score);
    highScoresBM = highScoresBM.slice(0, MAX_HIGH_SCORES_BM);
    localStorage.setItem('beeMatchHighScores', JSON.stringify(highScoresBM));
}

function displayHighScoresBM() {
    highScoresListBM.innerHTML = '';
    if (highScoresBM.length === 0) {
        highScoresListBM.innerHTML = '<li>No high scores yet. Start matching!</li>';
        return;
    }
    highScoresBM.forEach(scoreEntry => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${scoreEntry.name}:</strong> ${scoreEntry.score} points`;
        highScoresListBM.appendChild(li);
    });
}