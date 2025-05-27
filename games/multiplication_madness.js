// DOM Elements
const playerNameInput = document.getElementById('player-name-input');
const startGameButton = document.getElementById('start-game-button');
const nameError = document.getElementById('name-error');
const playerNameSection = document.getElementById('player-name-section');
const gameContent = document.getElementById('game-content');
const displayPlayerName = document.getElementById('display-player-name');
const scoreDisplay = document.getElementById('score');
const questionNumberDisplay = document.getElementById('question-number');
const timerDisplay = document.getElementById('timer');
const questionText = document.getElementById('question-text');
const answerOptionsContainer = document.getElementById('answer-options');
const feedbackMessage = document.getElementById('feedback-message');
const gameOverSection = document.getElementById('game-over-section');
const finalPlayerName = document.getElementById('final-player-name');
const finalScoreDisplay = document.getElementById('final-score');
const playAgainButton = document.getElementById('play-again-button');
const highScoresList = document.getElementById('high-scores-list');

// Game State
let currentPlayerName = '';
let currentScore = 0;
let currentQuestionIndex = 0;
const TOTAL_QUESTIONS = 10;
let questions = [];
let timerInterval;
let timeLeft = 6; // seconds
let timeTaken = 0; // for scoring

const RUDE_WORDS = ["poop", "butt", "fart", "dummy", "stupid"]; // Simple list, can be expanded
const MAX_HIGH_SCORES = 10;
let highScores = JSON.parse(localStorage.getItem('multiplicationMadnessHighScores')) || [];

// Event Listeners
startGameButton.addEventListener('click', handleStartGame);
playAgainButton.addEventListener('click', resetAndStartGame);
playerNameInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleStartGame();
    }
});

function isNameValid(name) {
    if (!name.trim()) {
        nameError.textContent = "Please enter a name!";
        return false;
    }
    const lowerCaseName = name.toLowerCase();
    for (const rudeWord of RUDE_WORDS) {
        if (lowerCaseName.includes(rudeWord)) {
            nameError.textContent = "That name is a bit cheeky! Try another one.";
            return false;
        }
    }
    nameError.textContent = "";
    return true;
}

function handleStartGame() {
    const name = playerNameInput.value;
    if (isNameValid(name)) {
        currentPlayerName = name;
        playerNameSection.style.display = 'none';
        gameContent.style.display = 'block';
        gameOverSection.style.display = 'none';
        displayPlayerName.textContent = currentPlayerName;
        startGame();
    }
}

function startGame() {
    currentScore = 0;
    currentQuestionIndex = 0;
    scoreDisplay.textContent = currentScore;
    questions = generateQuestions();
    displayNextQuestion();
}

function resetAndStartGame() {
    gameOverSection.style.display = 'none';
    gameContent.style.display = 'none'; // Hide game content first

    if (currentPlayerName) { // If a name is already stored
        playerNameSection.style.display = 'none';
        gameContent.style.display = 'block'; // Ensure game content is shown
        displayPlayerName.textContent = currentPlayerName;
        startGame();
    } else {
        // No name stored, show name input section
        playerNameSection.style.display = 'block';
        playerNameInput.value = "";
    }
}


function generateQuestions() {
    const generated = [];
    const usedPairs = new Set();

    while (generated.length < TOTAL_QUESTIONS) {
        let num1 = Math.floor(Math.random() * 10) + 3; // 3 to 12
        let num2 = Math.floor(Math.random() * 10) + 3; // 3 to 12

        // Avoid 1x and 2x (already handled by starting at 3)
        // Ensure variety by checking pair (sorted to treat 3x4 and 4x3 as same for variety check)
        const pairKey = [num1, num2].sort().join(',');
        if (usedPairs.has(pairKey)) continue;
        usedPairs.add(pairKey);

        const correctAnswer = num1 * num2;
        const options = generateAnswerOptions(correctAnswer);
        generated.push({ text: `${num1} × ${num2} = ?`, correctAnswer, options });
    }
    return generated;
}

function generateAnswerOptions(correctAnswer) {
    const options = new Set([correctAnswer]);
    while (options.size < 4) {
        // Generate distractors that are somewhat close but not too obvious
        const offset = Math.floor(Math.random() * 10) - 5; // -5 to +4
        let distractor = correctAnswer + offset;
        if (distractor <= 0) distractor = correctAnswer + Math.floor(Math.random() * 5) + 1; // ensure positive
        if (distractor !== correctAnswer) {
            options.add(distractor);
        }
    }
    return Array.from(options).sort(() => Math.random() - 0.5); // Shuffle options
}

function displayNextQuestion() {
    if (currentQuestionIndex >= TOTAL_QUESTIONS) {
        endGame();
        return;
    }

    const question = questions[currentQuestionIndex];
    questionNumberDisplay.textContent = `${currentQuestionIndex + 1}/${TOTAL_QUESTIONS}`;
    questionText.textContent = question.text;
    answerOptionsContainer.innerHTML = '';
    feedbackMessage.textContent = '';

    question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.addEventListener('click', () => handleAnswer(option, question.correctAnswer, button));
        answerOptionsContainer.appendChild(button);
    });

    startTimer();
}

function startTimer() {
    timeLeft = 6;
    timeTaken = 0;
    timerDisplay.textContent = timeLeft;
    clearInterval(timerInterval); // Clear any existing timer

    timerInterval = setInterval(() => {
        timeLeft--;
        timeTaken++;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            feedbackMessage.textContent = "Time's up! No points this round.";
            feedbackMessage.style.color = "orange";
            disableAnswerButtons();
            setTimeout(displayNextQuestion, 2000); // Move to next question after 2s
        }
    }, 1000);
}

function handleAnswer(selectedAnswer, correctAnswer, button) {
    clearInterval(timerInterval);
    disableAnswerButtons();

    if (selectedAnswer === correctAnswer) {
        let pointsEarned = 0;
        if (timeTaken <= 2) {
            pointsEarned = 3;
        } else if (timeTaken <= 4) {
            pointsEarned = 2;
        } else if (timeTaken <= 6) { // Answered within 6 seconds
            pointsEarned = 1;
        }
        currentScore += pointsEarned;
        scoreDisplay.textContent = currentScore;
        feedbackMessage.textContent = `Correct! +${pointsEarned} point(s)!`;
        feedbackMessage.style.color = "green";
        button.classList.add('correct');
    } else {
        feedbackMessage.textContent = `Oops! The correct answer was ${correctAnswer}.`;
        feedbackMessage.style.color = "red";
        button.classList.add('incorrect');
        // Highlight correct answer
        Array.from(answerOptionsContainer.children).forEach(btn => {
            if (parseInt(btn.textContent) === correctAnswer) {
                btn.classList.add('correct');
            }
        });
    }
    currentQuestionIndex++;
    setTimeout(displayNextQuestion, 2000); // Wait 2s before next question
}

function disableAnswerButtons() {
    Array.from(answerOptionsContainer.children).forEach(button => {
        button.disabled = true;
    });
}

function endGame() {
    gameContent.style.display = 'none';
    gameOverSection.style.display = 'block';
    finalPlayerName.textContent = currentPlayerName;
    finalScoreDisplay.textContent = currentScore;
    updateHighScores(currentPlayerName, currentScore);
    displayHighScores();
}

function updateHighScores(name, score) {
    highScores.push({ name, score });
    highScores.sort((a, b) => b.score - a.score); // Sort descending
    highScores = highScores.slice(0, MAX_HIGH_SCORES); // Keep only top 10
    localStorage.setItem('multiplicationMadnessHighScores', JSON.stringify(highScores));
}

function displayHighScores() {
    highScoresList.innerHTML = ''; // Clear previous list
    if (highScores.length === 0) {
        highScoresList.innerHTML = '<li>No high scores yet. Be the first!</li>';
        return;
    }
    highScores.forEach(scoreEntry => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${scoreEntry.name}:</strong> ${scoreEntry.score} points`;
        highScoresList.appendChild(li);
    });
}

// Initial display of high scores if game over section is visible (e.g. on page load if it was last state)
// or simply call displayHighScores() if you want to show it always, though it's in game-over section.
// For now, it's called when game ends.