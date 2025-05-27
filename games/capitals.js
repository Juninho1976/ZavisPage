// DOM Elements
const playerNameInputCapitals = document.getElementById('player-name-input-capitals');
const startGameButtonCapitals = document.getElementById('start-game-button-capitals');
const nameErrorCapitals = document.getElementById('name-error-capitals');
const playerNameSectionCapitals = document.getElementById('player-name-section-capitals');
const gameContentCapitals = document.getElementById('game-content-capitals');
const displayPlayerNameCapitals = document.getElementById('display-player-name-capitals');
const scoreDisplayCapitals = document.getElementById('score-capitals');
const roundNumberDisplayCapitals = document.getElementById('round-number-capitals');
const timerDisplayCapitals = document.getElementById('timer-capitals');
const countryNameDisplayCapitals = document.getElementById('country-name-capitals');
const answerOptionsContainerCapitals = document.getElementById('answer-options-capitals');
const feedbackMessageCapitals = document.getElementById('feedback-message-capitals');
const gameOverSectionCapitals = document.getElementById('game-over-section-capitals');
const finalPlayerNameCapitals = document.getElementById('final-player-name-capitals');
const finalScoreDisplayCapitals = document.getElementById('final-score-capitals');
const playAgainButtonCapitals = document.getElementById('play-again-button-capitals');
const highScoresListCapitals = document.getElementById('high-scores-list-capitals');

// Game State
let currentPlayerNameCapitals = '';
let currentScoreCapitals = 0;
let currentRoundCapitals = 0;
const TOTAL_ROUNDS_CAPITALS = 5;
let questionsCapitals = [];
let timerIntervalCapitals;
let timeLeftCapitals = 10; // seconds per question
let timeTakenCapitals = 0;

const RUDE_WORDS_CAPITALS = ["poop", "butt", "fart", "dummy", "stupid"];
const MAX_HIGH_SCORES_CAPITALS = 10;
let highScoresCapitals = JSON.parse(localStorage.getItem('capitalsQuizHighScores')) || [];

const COUNTRY_CAPITALS_LIST = [
    { country: "France", capital: "Paris" }, { country: "Germany", capital: "Berlin" },
    { country: "United Kingdom", capital: "London" }, { country: "Spain", capital: "Madrid" },
    { country: "Italy", capital: "Rome" }, { country: "Japan", capital: "Tokyo" },
    { country: "Canada", capital: "Ottawa" }, { country: "Australia", capital: "Canberra" },
    { country: "Brazil", capital: "Brasilia" }, { country: "India", capital: "New Delhi" },
    { country: "China", capital: "Beijing" }, { country: "Russia", capital: "Moscow" },
    { country: "South Africa", capital: "Pretoria" }, { country: "Egypt", capital: "Cairo" },
    { country: "Argentina", capital: "Buenos Aires" }, { country: "Mexico", capital: "Mexico City" },
    { country: "Nigeria", capital: "Abuja" }, { country: "Saudi Arabia", capital: "Riyadh" },
    { country: "Turkey", capital: "Ankara" }, { country: "South Korea", capital: "Seoul" },
    // Some tougher ones
    { country: "Kazakhstan", capital: "Nur-Sultan" }, { country: "Finland", capital: "Helsinki" },
    { country: "Norway", capital: "Oslo" }, { country: "Sweden", capital: "Stockholm" },
    { country: "New Zealand", capital: "Wellington" }, { country: "Chile", capital: "Santiago" },
    { country: "Peru", capital: "Lima" }, { country: "Colombia", capital: "Bogotá" },
    { country: "Vietnam", capital: "Hanoi" }, { country: "Thailand", capital: "Bangkok" },
    { country: "Malaysia", capital: "Kuala Lumpur" }, { country: "Philippines", capital: "Manila" },
    { country: "Switzerland", capital: "Bern" }, { country: "Austria", capital: "Vienna" },
    { country: "Belgium", capital: "Brussels" }, { country: "Netherlands", capital: "Amsterdam" },
    { country: "Portugal", capital: "Lisbon" }, { country: "Greece", capital: "Athens" },
    { country: "Ireland", capital: "Dublin" }, { country: "Poland", capital: "Warsaw" },
    { country: "Hungary", capital: "Budapest" }, { country: "Czech Republic", capital: "Prague" },
    { country: "Denmark", capital: "Copenhagen" }, { country: "Kenya", capital: "Nairobi" },
    { country: "Ethiopia", capital: "Addis Ababa" }, { country: "Morocco", capital: "Rabat" },
    { country: "Algeria", capital: "Algiers" }, { country: "Iran", capital: "Tehran" },
    { country: "Iraq", capital: "Baghdad" }, { country: "Afghanistan", capital: "Kabul" },
    { country: "Pakistan", capital: "Islamabad" }, { country: "Bangladesh", capital: "Dhaka" },
    { country: "Indonesia", capital: "Jakarta" }, { country: "Singapore", capital: "Singapore" },
    { country: "Israel", capital: "Jerusalem" }, // Note: Political sensitivities exist.
    { country: "Ukraine", capital: "Kyiv" }, { country: "Romania", capital: "Bucharest" },
    { country: "Bolivia", capital: "Sucre" }, { country: "Ecuador", capital: "Quito" },
    { country: "Uruguay", capital: "Montevideo" }, { country: "Paraguay", capital: "Asunción" },
    { country: "Venezuela", capital: "Caracas" }, { country: "Cuba", capital: "Havana" },
    { country: "Jamaica", capital: "Kingston" }, { country: "Dominican Republic", capital: "Santo Domingo" },
    { country: "Haiti", capital: "Port-au-Prince" }, { country: "Costa Rica", capital: "San José" },
    { country: "Panama", capital: "Panama City" }, { country: "Guatemala", capital: "Guatemala City" },
    { country: "Honduras", capital: "Tegucigalpa" }, { country: "Nicaragua", capital: "Managua" },
    { country: "El Salvador", capital: "San Salvador" }, { country: "Belize", capital: "Belmopan" },
    { country: "Iceland", capital: "Reykjavik" }, { country: "Luxembourg", capital: "Luxembourg" },
    { country: "Monaco", capital: "Monaco" }, { country: "Vatican City", capital: "Vatican City" },
    { country: "San Marino", capital: "San Marino" }, { country: "Liechtenstein", capital: "Vaduz" },
    { country: "Andorra", capital: "Andorra la Vella" }, { country: "Malta", capital: "Valletta" },
    { country: "Cyprus", capital: "Nicosia" }, { country: "Sri Lanka", capital: "Colombo" }, // Sri Jayawardenepura Kotte is administrative
    { country: "Nepal", capital: "Kathmandu" }, { country: "Bhutan", capital: "Thimphu" },
    { country: "Mongolia", capital: "Ulaanbaatar" }, { country: "North Korea", capital: "Pyongyang" },
    { country: "Laos", capital: "Vientiane" }, { country: "Cambodia", capital: "Phnom Penh" },
    { country: "Myanmar", capital: "Naypyidaw" }, { country: "Brunei", capital: "Bandar Seri Begawan" },
    { country: "Fiji", capital: "Suva" }, { country: "Papua New Guinea", capital: "Port Moresby" },
    { country: "Solomon Islands", capital: "Honiara" }, { country: "Vanuatu", capital: "Port Vila" },
    { country: "Samoa", capital: "Apia" }, { country: "Tonga", capital: "Nuku'alofa" },
    { country: "Kiribati", capital: "Tarawa" }, { country: "Tuvalu", capital: "Funafuti" },
    { country: "Nauru", capital: "Yaren" }, // Yaren is de facto capital
    { country: "Marshall Islands", capital: "Majuro" }, { country: "Palau", capital: "Ngerulmud" },
    { country: "Micronesia", capital: "Palikir" }
];

// Event Listeners
startGameButtonCapitals.addEventListener('click', handleStartGameCapitals);
playAgainButtonCapitals.addEventListener('click', resetAndStartGameCapitals);
playerNameInputCapitals.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleStartGameCapitals();
    }
});

function isNameValidCapitals(name) {
    if (!name.trim()) {
        nameErrorCapitals.textContent = "Please enter a name!";
        return false;
    }
    const lowerCaseName = name.toLowerCase();
    for (const rudeWord of RUDE_WORDS_CAPITALS) {
        if (lowerCaseName.includes(rudeWord)) {
            nameErrorCapitals.textContent = "That name is a bit cheeky! Try another one.";
            return false;
        }
    }
    nameErrorCapitals.textContent = "";
    return true;
}

function handleStartGameCapitals() {
    const name = playerNameInputCapitals.value;
    if (isNameValidCapitals(name)) {
        currentPlayerNameCapitals = name;
        playerNameSectionCapitals.style.display = 'none';
        gameContentCapitals.style.display = 'block';
        gameOverSectionCapitals.style.display = 'none';
        displayPlayerNameCapitals.textContent = currentPlayerNameCapitals;
        startQuiz();
    }
}

function startQuiz() {
    currentScoreCapitals = 0;
    currentRoundCapitals = 0;
    scoreDisplayCapitals.textContent = currentScoreCapitals;
    questionsCapitals = generateQuizQuestions();
    displayNextRound();
}

function resetAndStartGameCapitals() {
    gameOverSectionCapitals.style.display = 'none';
    gameContentCapitals.style.display = 'none';

    if (currentPlayerNameCapitals) {
        playerNameSectionCapitals.style.display = 'none';
        gameContentCapitals.style.display = 'block'; // Ensure game content is shown
        displayPlayerNameCapitals.textContent = currentPlayerNameCapitals;
        startQuiz();
    } else {
        playerNameSectionCapitals.style.display = 'block';
        playerNameInputCapitals.value = "";
    }
}

function generateQuizQuestions() {
    const selectedQuestions = [];
    const availableCountries = [...COUNTRY_CAPITALS_LIST]; // Create a mutable copy

    for (let i = 0; i < TOTAL_ROUNDS_CAPITALS; i++) {
        if (availableCountries.length === 0) break; // Not enough unique countries

        const randomIndex = Math.floor(Math.random() * availableCountries.length);
        const questionData = availableCountries.splice(randomIndex, 1)[0]; // Get and remove

        const correctAnswer = questionData.capital;
        const options = new Set([correctAnswer]);
        const allCapitals = COUNTRY_CAPITALS_LIST.map(c => c.capital);

        // Generate 3 distractor options
        while (options.size < 4) {
            const distractorIndex = Math.floor(Math.random() * allCapitals.length);
            const distractor = allCapitals[distractorIndex];
            if (distractor !== correctAnswer) { // Ensure distractor is not the answer
                options.add(distractor);
            }
        }
        selectedQuestions.push({
            country: questionData.country,
            correctAnswer: correctAnswer,
            options: Array.from(options).sort(() => Math.random() - 0.5) // Shuffle
        });
    }
    return selectedQuestions;
}

function displayNextRound() {
    if (currentRoundCapitals >= TOTAL_ROUNDS_CAPITALS) {
        endQuiz();
        return;
    }

    const question = questionsCapitals[currentRoundCapitals];
    roundNumberDisplayCapitals.textContent = `${currentRoundCapitals + 1}/${TOTAL_ROUNDS_CAPITALS}`;
    countryNameDisplayCapitals.textContent = `What is the capital of ${question.country}?`;
    answerOptionsContainerCapitals.innerHTML = '';
    feedbackMessageCapitals.textContent = '';

    question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.addEventListener('click', () => handleAnswerCapitals(option, question.correctAnswer, button));
        answerOptionsContainerCapitals.appendChild(button);
    });

    startTimerCapitals();
}

function startTimerCapitals() {
    timeLeftCapitals = 10; // Reset timer for each question
    timeTakenCapitals = 0;
    timerDisplayCapitals.textContent = timeLeftCapitals;
    clearInterval(timerIntervalCapitals);

    timerIntervalCapitals = setInterval(() => {
        timeLeftCapitals--;
        timeTakenCapitals++;
        timerDisplayCapitals.textContent = timeLeftCapitals;
        if (timeLeftCapitals <= 0) {
            clearInterval(timerIntervalCapitals);
            feedbackMessageCapitals.textContent = "Time's up! No points this round.";
            feedbackMessageCapitals.style.color = "orange";
            disableAnswerButtonsCapitals();
            setTimeout(displayNextRound, 2000);
        }
    }, 1000);
}

function handleAnswerCapitals(selectedAnswer, correctAnswer, button) {
    clearInterval(timerIntervalCapitals);
    disableAnswerButtonsCapitals();

    if (selectedAnswer === correctAnswer) {
        let pointsEarned = 0;
        // Points: 3 for <=3s, 2 for <=6s, 1 for <=10s
        if (timeTakenCapitals <= 3) pointsEarned = 3;
        else if (timeTakenCapitals <= 6) pointsEarned = 2;
        else if (timeTakenCapitals <= 10) pointsEarned = 1;
        
        currentScoreCapitals += pointsEarned;
        scoreDisplayCapitals.textContent = currentScoreCapitals;
        feedbackMessageCapitals.textContent = `Correct! +${pointsEarned} point(s)!`;
        feedbackMessageCapitals.style.color = "green";
        button.classList.add('correct');
    } else {
        feedbackMessageCapitals.textContent = `Oops! The correct answer was ${correctAnswer}.`;
        feedbackMessageCapitals.style.color = "red";
        button.classList.add('incorrect');
        Array.from(answerOptionsContainerCapitals.children).forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });
    }
    currentRoundCapitals++;
    setTimeout(displayNextRound, 2500); // Slightly longer pause to read feedback
}

function disableAnswerButtonsCapitals() {
    Array.from(answerOptionsContainerCapitals.children).forEach(button => {
        button.disabled = true;
    });
}

function endQuiz() {
    gameContentCapitals.style.display = 'none';
    gameOverSectionCapitals.style.display = 'block';
    finalPlayerNameCapitals.textContent = currentPlayerNameCapitals;
    finalScoreDisplayCapitals.textContent = currentScoreCapitals;
    updateHighScoresCapitals(currentPlayerNameCapitals, currentScoreCapitals);
    displayHighScoresCapitals();
}

function updateHighScoresCapitals(name, score) {
    highScoresCapitals.push({ name, score });
    highScoresCapitals.sort((a, b) => b.score - a.score);
    highScoresCapitals = highScoresCapitals.slice(0, MAX_HIGH_SCORES_CAPITALS);
    localStorage.setItem('capitalsQuizHighScores', JSON.stringify(highScoresCapitals));
}

function displayHighScoresCapitals() {
    highScoresListCapitals.innerHTML = '';
    if (highScoresCapitals.length === 0) {
        highScoresListCapitals.innerHTML = '<li>No high scores yet. Be the first to ace the quiz!</li>';
        return;
    }
    highScoresCapitals.forEach(scoreEntry => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${scoreEntry.name}:</strong> ${scoreEntry.score} points`;
        highScoresListCapitals.appendChild(li);
    });
}