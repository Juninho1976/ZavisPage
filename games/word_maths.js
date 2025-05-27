// DOM Elements
const playerNameInputWM = document.getElementById('player-name-input-wm');
const startGameButtonWM = document.getElementById('start-game-button-wm');
const nameErrorWM = document.getElementById('name-error-wm');
const playerNameSectionWM = document.getElementById('player-name-section-wm');
const gameContentWM = document.getElementById('game-content-wm');
const displayPlayerNameWM = document.getElementById('display-player-name-wm');
const scoreDisplayWM = document.getElementById('score-wm');
const roundNumberDisplayWM = document.getElementById('round-number-wm');
const timerDisplayWM = document.getElementById('timer-wm');
const questionTextWM = document.getElementById('question-text-wm');
const answerOptionsContainerWM = document.getElementById('answer-options-wm');
const feedbackMessageWM = document.getElementById('feedback-message-wm');
const gameOverSectionWM = document.getElementById('game-over-section-wm');
const finalPlayerNameWM = document.getElementById('final-player-name-wm');
const finalScoreDisplayWM = document.getElementById('final-score-wm');
const playAgainButtonWM = document.getElementById('play-again-button-wm');
const highScoresListWM = document.getElementById('high-scores-list-wm');

// Game State
let currentPlayerNameWM = '';
let currentScoreWM = 0;
let currentRoundWM = 0;
const TOTAL_ROUNDS_WM = 5;
let questionsWM = [];
let timerIntervalWM;
let timeLeftWM = 30; // seconds per question, more time for reading
let timeTakenWM = 0;

const RUDE_WORDS_WM = ["poop", "butt", "fart", "dummy", "stupid"];
const MAX_HIGH_SCORES_WM = 10;
let highScoresWM = JSON.parse(localStorage.getItem('wordMathsHighScores')) || [];

const WORD_MATH_PROBLEMS = [
    {
        question: "Zavi bought a comic book for £3.50 and a pack of football cards for £1.80. If he started with £20.00, how much money does he have left?",
        correctAnswer: "£14.70",
        options: ["£14.70", "£15.30", "£18.20", "£5.30"]
    },
    {
        question: "Aisha is baking cookies. The recipe needs 250g of flour. She has a 1kg bag of flour. How many grams of flour will she have left after making one batch of cookies?",
        correctAnswer: "750g",
        options: ["750g", "1250g", "249g", "850g"]
    },
    {
        question: "A school trip has 3 buses. Each bus can carry 45 students. If there are 130 students going on the trip, how many empty seats will there be in total?",
        correctAnswer: "5 seats", // 3*45 = 135 total seats. 135 - 130 = 5
        options: ["5 seats", "10 seats", "0 seats", "15 seats"]
    },
    {
        question: "Tom reads 15 pages of his book every night. If the book has 240 pages, how many nights will it take him to finish the book?",
        correctAnswer: "16 nights", // 240 / 15 = 16
        options: ["16 nights", "15 nights", "20 nights", "10 nights"]
    },
    {
        question: "A pizza is cut into 8 equal slices. If Maya eats 3 slices and Ben eats 2 slices, what fraction of the pizza is left?",
        correctAnswer: "3/8", // 8 - 3 - 2 = 3 slices left
        options: ["3/8", "5/8", "1/2", "1/4"]
    },
    {
        question: "A train travels at an average speed of 60 miles per hour. How far will it travel in 2.5 hours?",
        correctAnswer: "150 miles", // 60 * 2.5 = 150
        options: ["150 miles", "120 miles", "180 miles", "100 miles"]
    },
    {
        question: "Sara wants to buy 3 video games that cost £12.50 each. She has saved £35.00. How much more money does she need?",
        correctAnswer: "£2.50", // 3 * 12.50 = 37.50. 37.50 - 35.00 = 2.50
        options: ["£2.50", "£5.00", "She has enough", "£7.50"]
    },
    {
        question: "A rectangular garden is 12 metres long and 8 metres wide. What is the perimeter of the garden?",
        correctAnswer: "40 metres", // 2 * (12 + 8) = 2 * 20 = 40
        options: ["40 metres", "96 metres", "20 metres", "32 metres"]
    },
    {
        question: "If a movie starts at 3:45 PM and lasts for 1 hour and 35 minutes, what time will it finish?",
        correctAnswer: "5:20 PM", // 3:45 + 1hr = 4:45. 4:45 + 35min = 5:20
        options: ["5:20 PM", "5:10 PM", "4:80 PM", "5:00 PM"]
    },
    {
        question: "David scores 75, 82, and 91 in three tests. What is his average score for these tests?",
        correctAnswer: "82.67", // (75+82+91)/3 = 248/3 = 82.666...
        options: ["82.67", "82", "83", "81.5"] // Rounded for simplicity in options
    }
];


// Event Listeners
startGameButtonWM.addEventListener('click', handleStartGameWM);
playAgainButtonWM.addEventListener('click', resetAndStartGameWM);
playerNameInputWM.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleStartGameWM();
    }
});

function isNameValidWM(name) {
    if (!name.trim()) {
        nameErrorWM.textContent = "Please enter a name!";
        return false;
    }
    const lowerCaseName = name.toLowerCase();
    for (const rudeWord of RUDE_WORDS_WM) {
        if (lowerCaseName.includes(rudeWord)) {
            nameErrorWM.textContent = "That name is a bit cheeky! Try another one.";
            return false;
        }
    }
    nameErrorWM.textContent = "";
    return true;
}

function handleStartGameWM() {
    const name = playerNameInputWM.value;
    if (isNameValidWM(name)) {
        currentPlayerNameWM = name;
        playerNameSectionWM.style.display = 'none';
        gameContentWM.style.display = 'block';
        gameOverSectionWM.style.display = 'none';
        displayPlayerNameWM.textContent = currentPlayerNameWM;
        startChallenge();
    }
}

function startChallenge() {
    currentScoreWM = 0;
    currentRoundWM = 0;
    scoreDisplayWM.textContent = currentScoreWM;
    questionsWM = generateWordMathQuestions();
    displayNextWordMathRound();
}

function resetAndStartGameWM() {
    gameOverSectionWM.style.display = 'none';
    gameContentWM.style.display = 'none';

    if (currentPlayerNameWM) {
        playerNameSectionWM.style.display = 'none';
        gameContentWM.style.display = 'block'; // Ensure game content is shown
        displayPlayerNameWM.textContent = currentPlayerNameWM;
        startChallenge();
    } else {
        playerNameSectionWM.style.display = 'block';
        playerNameInputWM.value = "";
    }
}

function generateWordMathQuestions() {
    const selectedQuestions = [];
    const availableProblems = [...WORD_MATH_PROBLEMS];

    for (let i = 0; i < TOTAL_ROUNDS_WM; i++) {
        if (availableProblems.length === 0) break;

        const randomIndex = Math.floor(Math.random() * availableProblems.length);
        const problemData = availableProblems.splice(randomIndex, 1)[0];
        
        // Shuffle options for display
        const shuffledOptions = [...problemData.options].sort(() => Math.random() - 0.5);

        selectedQuestions.push({
            question: problemData.question,
            correctAnswer: problemData.correctAnswer,
            options: shuffledOptions
        });
    }
    return selectedQuestions;
}

function displayNextWordMathRound() {
    if (currentRoundWM >= TOTAL_ROUNDS_WM) {
        endChallenge();
        return;
    }

    const questionData = questionsWM[currentRoundWM];
    roundNumberDisplayWM.textContent = `${currentRoundWM + 1}/${TOTAL_ROUNDS_WM}`;
    questionTextWM.textContent = questionData.question;
    answerOptionsContainerWM.innerHTML = '';
    feedbackMessageWM.textContent = '';

    questionData.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.addEventListener('click', () => handleAnswerWM(option, questionData.correctAnswer, button));
        answerOptionsContainerWM.appendChild(button);
    });

    startTimerWM();
}

function startTimerWM() {
    timeLeftWM = 30; // Reset timer to 30 seconds
    timeTakenWM = 0;
    timerDisplayWM.textContent = timeLeftWM;
    clearInterval(timerIntervalWM);

    // Ensure buttons are enabled at the start of a new question's timer
    Array.from(answerOptionsContainerWM.children).forEach(button => {
        button.disabled = false;
        button.classList.remove('correct', 'incorrect'); // Clear previous styles
    });


    timerIntervalWM = setInterval(() => {
        timeLeftWM--;
        timeTakenWM++;
        timerDisplayWM.textContent = timeLeftWM;
        if (timeLeftWM <= 0) {
            clearInterval(timerIntervalWM);
            feedbackMessageWM.textContent = "Time's up! No points this round.";
            feedbackMessageWM.style.color = "orange";
            disableAnswerButtonsWM(); // This should prevent further answers
            // Ensure it moves to the next question even if no answer was clicked
            setTimeout(displayNextWordMathRound, 2000);
        }
    }, 1000);
}

function handleAnswerWM(selectedAnswer, correctAnswer, button) {
    clearInterval(timerIntervalWM); // Stop the timer as soon as an answer is clicked
    disableAnswerButtonsWM(); // Disable all buttons immediately

    if (selectedAnswer === correctAnswer) {
        let pointsEarned = 0;
        // Points: 3 for <=10s, 2 for <=20s, 1 for <=30s
        if (timeTakenWM <= 10) pointsEarned = 3;
        else if (timeTakenWM <= 20) pointsEarned = 2;
        else if (timeTakenWM <= 30) pointsEarned = 1;
        
        currentScoreWM += pointsEarned;
        scoreDisplayWM.textContent = currentScoreWM;
        feedbackMessageWM.textContent = `Correct! +${pointsEarned} point(s)!`;
        feedbackMessageWM.style.color = "green";
        button.classList.add('correct');
    } else {
        feedbackMessageWM.textContent = `Not quite! The correct answer was ${correctAnswer}.`;
        feedbackMessageWM.style.color = "red";
        button.classList.add('incorrect');
        Array.from(answerOptionsContainerWM.children).forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });
    }
    currentRoundWM++;
    setTimeout(displayNextWordMathRound, 2500);
}

function disableAnswerButtonsWM() {
    Array.from(answerOptionsContainerWM.children).forEach(button => {
        button.disabled = true;
    });
}

function endChallenge() {
    gameContentWM.style.display = 'none';
    gameOverSectionWM.style.display = 'block';
    finalPlayerNameWM.textContent = currentPlayerNameWM;
    finalScoreDisplayWM.textContent = currentScoreWM;
    updateHighScoresWM(currentPlayerNameWM, currentScoreWM);
    displayHighScoresWM();
}

function updateHighScoresWM(name, score) {
    highScoresWM.push({ name, score });
    highScoresWM.sort((a, b) => b.score - a.score);
    highScoresWM = highScoresWM.slice(0, MAX_HIGH_SCORES_WM);
    localStorage.setItem('wordMathsHighScores', JSON.stringify(highScoresWM));
}

function displayHighScoresWM() {
    highScoresListWM.innerHTML = '';
    if (highScoresWM.length === 0) {
        highScoresListWM.innerHTML = '<li>No high scores yet. Be the first to solve the challenge!</li>';
        return;
    }
    highScoresWM.forEach(scoreEntry => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${scoreEntry.name}:</strong> ${scoreEntry.score} points`;
        highScoresListWM.appendChild(li);
    });
}