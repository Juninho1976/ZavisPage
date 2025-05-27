const ADMIN_PASSWORD = "Rak123456!";
const adminPasswordInput = document.getElementById('admin-password-input');
const adminPasswordError = document.getElementById('admin-password-error');
const adminPasswordProtection = document.getElementById('admin-password-protection');
const adminMainContent = document.getElementById('admin-main-content');

const mmHighScoresListAdmin = document.getElementById('mm-high-scores-list-admin');
const csHighScoresListAdmin = document.getElementById('cs-high-scores-list-admin');
const capitalsHighScoresListAdmin = document.getElementById('capitals-high-scores-list-admin');
const wmHighScoresListAdmin = document.getElementById('wm-high-scores-list-admin');
const bmHighScoresListAdmin = document.getElementById('bm-high-scores-list-admin'); // Added for Bee Match
const commentsListAdmin = document.getElementById('comments-list-admin');

const MULTIPLICATION_MADNESS_STORAGE_KEY = 'multiplicationMadnessHighScores';
const CLASSIC_SNAKE_STORAGE_KEY = 'classicSnakeHighScores';
const CAPITALS_QUIZ_STORAGE_KEY = 'capitalsQuizHighScores';
const WORD_MATHS_STORAGE_KEY = 'wordMathsHighScores';
const BEE_MATCH_STORAGE_KEY = 'beeMatchHighScores'; // Added for Bee Match
const COMMENTS_STORAGE_KEY = 'gameComments';

// Check if already authenticated in this session
if (sessionStorage.getItem('isAdminAuthenticated') === 'true') {
    showAdminContent();
}

function checkAdminPassword() {
    if (adminPasswordInput.value === ADMIN_PASSWORD) {
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        showAdminContent();
        adminPasswordError.textContent = '';
    } else {
        adminPasswordError.textContent = 'Incorrect admin password.';
        adminPasswordInput.value = '';
    }
}

function showAdminContent() {
    adminPasswordProtection.style.display = 'none';
    adminMainContent.style.display = 'block';
    loadAllHighScores();
}

function loadAllHighScores() {
    loadHighScoresForGame(MULTIPLICATION_MADNESS_STORAGE_KEY, mmHighScoresListAdmin, "Multiplication Madness");
    loadHighScoresForGame(CLASSIC_SNAKE_STORAGE_KEY, csHighScoresListAdmin, "Classic Snake");
    loadHighScoresForGame(CAPITALS_QUIZ_STORAGE_KEY, capitalsHighScoresListAdmin, "Capitals Quiz");
    loadHighScoresForGame(WORD_MATHS_STORAGE_KEY, wmHighScoresListAdmin, "Word Maths Challenge");
    loadHighScoresForGame(BEE_MATCH_STORAGE_KEY, bmHighScoresListAdmin, "Bee-Flower Color Match"); // Added for Bee Match
    loadCommentsAdmin();
}

function loadHighScoresForGame(storageKey, listElement, gameName) {
    listElement.innerHTML = ''; // Clear existing list
    let scores = JSON.parse(localStorage.getItem(storageKey)) || [];

    if (scores.length === 0) {
        const li = document.createElement('li');
        li.textContent = `No high scores recorded for ${gameName} yet.`;
        listElement.appendChild(li);
        return;
    }

    scores.forEach((scoreEntry, index) => {
        const li = document.createElement('li');
        
        const scoreDetails = document.createElement('span');
        scoreDetails.className = 'score-details';
        scoreDetails.textContent = `${index + 1}. ${scoreEntry.name}: ${scoreEntry.score} points`;
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-score-button';
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteScoreEntry(storageKey, index, gameName);
        
        li.appendChild(scoreDetails);
        li.appendChild(deleteButton);
        listElement.appendChild(li);
    });
}

function deleteScoreEntry(storageKey, indexToDelete, gameName) {
    if (confirm(`Are you sure you want to delete this score entry for ${gameName}? \nName: ${JSON.parse(localStorage.getItem(storageKey))[indexToDelete].name}, Score: ${JSON.parse(localStorage.getItem(storageKey))[indexToDelete].score}`)) {
        let scores = JSON.parse(localStorage.getItem(storageKey)) || [];
        if (indexToDelete >= 0 && indexToDelete < scores.length) {
            scores.splice(indexToDelete, 1);
            localStorage.setItem(storageKey, JSON.stringify(scores));
            loadAllHighScores(); // Refresh all lists
        } else {
            alert("Error: Could not find the score entry to delete.");
        }
    }
}

function loadCommentsAdmin() {
    commentsListAdmin.innerHTML = ''; // Clear existing list
    let comments = JSON.parse(localStorage.getItem(COMMENTS_STORAGE_KEY)) || [];

    if (comments.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No comments or ideas submitted yet.';
        commentsListAdmin.appendChild(li);
        return;
    }

    // Display in reverse chronological order (newest first)
    [...comments].reverse().forEach((commentEntry, index) => {
        // Note: index here is for the reversed array. To delete from original, we need original index.
        const originalIndex = comments.length - 1 - index;
        const li = document.createElement('li');
        
        const commentDetails = document.createElement('span');
        commentDetails.className = 'score-details'; // Re-use styling
        commentDetails.innerHTML = `<strong>${commentEntry.name}</strong> <span style="font-size:0.8em; color:#555;">(${commentEntry.date || 'No date'})</span>:<br>${commentEntry.text}`;
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-score-button'; // Re-use styling
        deleteButton.textContent = 'Delete Comment';
        deleteButton.onclick = () => deleteCommentEntry(originalIndex);
        
        li.appendChild(commentDetails);
        li.appendChild(deleteButton);
        commentsListAdmin.appendChild(li);
    });
}

function deleteCommentEntry(indexToDelete) {
    let comments = JSON.parse(localStorage.getItem(COMMENTS_STORAGE_KEY)) || [];
    const commentToDelete = comments[indexToDelete];

    if (confirm(`Are you sure you want to delete this comment? \n"${commentToDelete.text}" by ${commentToDelete.name}`)) {
        if (indexToDelete >= 0 && indexToDelete < comments.length) {
            comments.splice(indexToDelete, 1);
            localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
            loadAllHighScores(); // Refresh all lists, including comments
        } else {
            alert("Error: Could not find the comment to delete.");
        }
    }
}

// Allow pressing Enter to submit admin password
adminPasswordInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        checkAdminPassword();
    }
});