// DOM Elements
const playerNameInputBB = document.getElementById('player-name-input-bb');
const startGameButtonBB = document.getElementById('start-game-button-bb');
const nameErrorBB = document.getElementById('name-error-bb');
const playerNameSectionBB = document.getElementById('player-name-section-bb');
const gameContentBB = document.getElementById('game-content-bb');
const displayPlayerNameBB = document.getElementById('display-player-name-bb');
const scoreDisplayBB = document.getElementById('score-bb');
const ballsLeftDisplayBB = document.getElementById('balls-left-bb');
const gameOverSectionBB = document.getElementById('game-over-section-bb');
const finalPlayerNameBB = document.getElementById('final-player-name-bb');
const finalScoreDisplayBB = document.getElementById('final-score-bb');
const playAgainButtonBB = document.getElementById('play-again-button-bb');
const highScoresListBB = document.getElementById('high-scores-list-bb');
const shootButton = document.getElementById('shoot-button-bb');

const canvas = document.getElementById('basketball-court');
const ctx = canvas.getContext('2d');

// Game Constants
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const BALL_RADIUS = 15;
const HOOP_WIDTH = 80;
const HOOP_HEIGHT = 20;
const HOOP_Y = 80; // Y position of the hoop from the top
const RIM_THICKNESS = 5;
const NET_DEPTH = 30;
const GRAVITY = 0.5;
const INITIAL_BALLS = 3;

// Game State
let currentPlayerNameBB = '';
let scoreBB = 0;
let ballsLeftBB = INITIAL_BALLS;
let ball, hoop;
let shooting = false;
let gameLoopBB;

const RUDE_WORDS_BB = ["poop", "butt", "fart", "dummy", "stupid"];
const MAX_HIGH_SCORES_BB = 10;
let highScoresBB = JSON.parse(localStorage.getItem('arcadeHoopsHighScores')) || [];

// Ball Object
function Ball(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.dx = 0; // Horizontal velocity
    this.dy = 0; // Vertical velocity
    this.onGround = true;

    this.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    this.update = function() {
        if (!this.onGround) {
            this.dy += GRAVITY; // Apply gravity
            this.y += this.dy;
            this.x += this.dx;

            // Basic wall bounce (sides)
            if (this.x + this.radius > CANVAS_WIDTH || this.x - this.radius < 0) {
                this.dx = -this.dx * 0.8; // Dampen bounce
                 if (this.x + this.radius > CANVAS_WIDTH) this.x = CANVAS_WIDTH - this.radius;
                 if (this.x - this.radius < 0) this.x = this.radius;
            }

            // Reset if it goes off bottom (miss)
            if (this.y - this.radius > CANVAS_HEIGHT + 50) { // Give some leeway
                resetBall();
            }
        }
        this.draw();
    }
}

// Hoop Object
function Hoop(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height; // This is the rim part
    this.color = color;
    this.speed = 2; // Movement speed
    this.direction = 1; // 1 for right, -1 for left

    this.draw = function() {
        // Backboard (optional, simple version here)
        // ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
        // ctx.fillRect(this.x - 10, this.y - 40, this.width + 20, 60);

        // Rim
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, RIM_THICKNESS); // Top front rim
        ctx.fillRect(this.x, this.y + this.height - RIM_THICKNESS, this.width, RIM_THICKNESS); // Bottom front rim (illusion)

        // Net (simple lines)
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        for (let i = 0; i <= 5; i++) {
            const xOffset = (this.width / 5) * i;
            ctx.beginPath();
            ctx.moveTo(this.x + xOffset, this.y + RIM_THICKNESS);
            ctx.lineTo(this.x + xOffset + (i < 3 ? -5 : 5), this.y + RIM_THICKNESS + NET_DEPTH); // Tapering effect
            ctx.stroke();
        }
         // Hoop opening (for collision)
        this.opening = {
            x1: this.x + RIM_THICKNESS * 2, // Inner edge
            x2: this.x + this.width - RIM_THICKNESS * 2, // Inner edge
            y: this.y + RIM_THICKNESS // Top of the opening
        };
    }

    this.update = function() {
        this.x += this.speed * this.direction;
        if (this.x + this.width > CANVAS_WIDTH || this.x < 0) {
            this.direction *= -1; // Change direction
        }
        this.draw();
    }
}


// Event Listeners
startGameButtonBB.addEventListener('click', handleStartGameBB);
playAgainButtonBB.addEventListener('click', resetAndStartGameBB);
playerNameInputBB.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') handleStartGameBB();
});
shootButton.addEventListener('click', shootBall);
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && !shooting && ballsLeftBB > 0 && gameContentBB.style.display === 'block') {
        event.preventDefault(); // Prevent page scroll
        shootBall();
    }
});


function isNameValidBB(name) {
    if (!name.trim()) {
        nameErrorBB.textContent = "Please enter a name!"; return false;
    }
    const lowerCaseName = name.toLowerCase();
    for (const rudeWord of RUDE_WORDS_BB) {
        if (lowerCaseName.includes(rudeWord)) {
            nameErrorBB.textContent = "That name is a bit cheeky! Try another one."; return false;
        }
    }
    nameErrorBB.textContent = ""; return true;
}

function handleStartGameBB() {
    const name = playerNameInputBB.value;
    if (isNameValidBB(name)) {
        currentPlayerNameBB = name;
        playerNameSectionBB.style.display = 'none';
        gameContentBB.style.display = 'block';
        gameOverSectionBB.style.display = 'none';
        displayPlayerNameBB.textContent = currentPlayerNameBB;
        initGameBB();
    }
}

function initGameBB() {
    scoreBB = 0;
    ballsLeftBB = INITIAL_BALLS;
    scoreDisplayBB.textContent = scoreBB;
    ballsLeftDisplayBB.textContent = ballsLeftBB;
    shooting = false;

    ball = new Ball(CANVAS_WIDTH / 2, CANVAS_HEIGHT - BALL_RADIUS - 20, BALL_RADIUS, '#ff8c00'); // Orange ball
    hoop = new Hoop(CANVAS_WIDTH / 2 - HOOP_WIDTH / 2, HOOP_Y, HOOP_WIDTH, HOOP_HEIGHT, '#ff0000'); // Red hoop

    if (gameLoopBB) cancelAnimationFrame(gameLoopBB);
    gameLoopBB = requestAnimationFrame(animate);
    shootButton.disabled = false;
}

function resetAndStartGameBB() {
    gameOverSectionBB.style.display = 'none';
    playerNameSectionBB.style.display = 'block';
    playerNameInputBB.value = "";
    gameContentBB.style.display = 'none';
}

function resetBall() {
    if (ballsLeftBB <= 0 && !shooting) { // Ensure game over only if no balls left and not mid-shot
        gameOverBB();
        return;
    }
    shooting = false;
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT - BALL_RADIUS - 20;
    ball.dx = 0;
    ball.dy = 0;
    ball.onGround = true;
    shootButton.disabled = false;
}

function shootBall() {
    if (ball.onGround && ballsLeftBB > 0) {
        shooting = true;
        ball.onGround = false;
        ballsLeftBB--;
        ballsLeftDisplayBB.textContent = ballsLeftBB;
        
        // Simple shot: fixed upward velocity, horizontal based on hoop position (very basic aim assist)
        ball.dy = -15; // Upward power
        // Aim slightly towards the center of the hoop from current ball position
        const hoopCenterX = hoop.x + hoop.width / 2;
        ball.dx = (hoopCenterX - ball.x) / 25; // Adjust divisor for sensitivity
        if (ball.dx > 5) ball.dx = 5; // Max horizontal speed
        if (ball.dx < -5) ball.dx = -5;

        shootButton.disabled = true; // Disable button while ball is in air
    }
}

function checkScore() {
    // Check if ball center passes through the hoop opening
    // This is a simplified collision detection
    if (ball.y + ball.radius > hoop.opening.y && // Ball's bottom edge is below hoop top
        ball.y - ball.radius < hoop.opening.y + NET_DEPTH && // Ball's top edge is above hoop bottom (net)
        ball.x > hoop.opening.x1 && ball.x < hoop.opening.x2 && // Ball is horizontally within the hoop
        ball.dy > 0) { // Ball is moving downwards (important!)
        
        scoreBB++;
        scoreDisplayBB.textContent = scoreBB;
        // Make ball "fall through" and reset
        ball.dy = 5; // Give it a little push down
        ball.dx = 0; // Stop horizontal movement
        // Prevent multiple scores for one shot
        hoop.opening.y = -1000; // Move hoop opening way off screen temporarily
        
        setTimeout(() => {
            resetBall();
            hoop.opening.y = HOOP_Y + RIM_THICKNESS; // Restore hoop opening
        }, 300); // Short delay before reset
        return true; // Scored
    }
    return false; // No score
}


function animate() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    hoop.update();
    ball.update();

    if (shooting) {
        if (checkScore()) {
            // Score handled in checkScore, ball reset will occur
        } else if (ball.y - ball.radius > CANVAS_HEIGHT + 50 || // Missed and went off screen
                   (ball.onGround && shooting)) { // Ball landed without scoring
            resetBall();
        }
    }
    
    if (ballsLeftBB === 0 && ball.onGround && !shooting) { // All balls shot and last ball has settled
        gameOverBB();
        return; // Stop animation
    }

    gameLoopBB = requestAnimationFrame(animate);
}

function gameOverBB() {
    cancelAnimationFrame(gameLoopBB);
    gameContentBB.style.display = 'none';
    gameOverSectionBB.style.display = 'block';
    finalPlayerNameBB.textContent = currentPlayerNameBB;
    finalScoreDisplayBB.textContent = scoreBB;
    updateHighScoresBB(currentPlayerNameBB, scoreBB);
    displayHighScoresBB();
    shootButton.disabled = true;
}

function updateHighScoresBB(name, score) {
    highScoresBB.push({ name, score });
    highScoresBB.sort((a, b) => b.score - a.score);
    highScoresBB = highScoresBB.slice(0, MAX_HIGH_SCORES_BB);
    localStorage.setItem('arcadeHoopsHighScores', JSON.stringify(highScoresBB));
}

function displayHighScoresBB() {
    highScoresListBB.innerHTML = '';
    if (highScoresBB.length === 0) {
        highScoresListBB.innerHTML = '<li>No high scores yet. Start shooting!</li>';
        return;
    }
    highScoresBB.forEach(scoreEntry => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${scoreEntry.name}:</strong> ${scoreEntry.score} points`;
        highScoresListBB.appendChild(li);
    });
}