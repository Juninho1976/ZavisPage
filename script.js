const CORRECT_PASSWORD = "ZaviTDJS";
let votes = {
    multiplicationMadness: 0,
    classicSnake: 0
};
let comments = [];

// Load data from localStorage if available
window.onload = function() {
    if (localStorage.getItem('gameVotes')) {
        votes = JSON.parse(localStorage.getItem('gameVotes'));
        updateAllVoteCounts();
    }
    if (localStorage.getItem('gameComments')) {
        comments = JSON.parse(localStorage.getItem('gameComments'));
        displayComments();
    }
    // Check if already authenticated
    if (sessionStorage.getItem('isAuthenticated') === 'true') {
        showMainContent();
    }
};

function checkPassword() {
    const passwordInput = document.getElementById('password-input');
    const passwordError = document.getElementById('password-error');
    if (passwordInput.value === CORRECT_PASSWORD) {
        sessionStorage.setItem('isAuthenticated', 'true');
        showMainContent();
        passwordError.textContent = '';
    } else {
        passwordError.textContent = 'Incorrect password. Please try again.';
        passwordInput.value = '';
    }
}

function showMainContent() {
    document.getElementById('password-protection').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
}

function vote(gameId, voteType) {
    if (voteType === 'up') {
        votes[gameId]++;
    } else if (voteType === 'down') {
        votes[gameId]--;
    }
    updateVoteCount(gameId);
    localStorage.setItem('gameVotes', JSON.stringify(votes));
}

function updateVoteCount(gameId) {
    const votesElement = document.getElementById(`votes-${gameId}`);
    if (votesElement) {
        votesElement.textContent = votes[gameId];
    }
}

function updateAllVoteCounts() {
    for (const gameId in votes) {
        updateVoteCount(gameId);
    }
}

function submitComment() {
    const commenterNameInput = document.getElementById('commenter-name-input');
    const commentInput = document.getElementById('comment-input');
    const commenterName = commenterNameInput.value.trim();
    const commentText = commentInput.value.trim();

    if (!commenterName) {
        alert("Please enter your name!");
        commenterNameInput.focus();
        return;
    }
    if (!commentText) {
        alert("Please write something in the comment box!");
        commentInput.focus();
        return;
    }

    // Basic check for rude words in name (can be expanded)
    const RUDE_WORDS_COMMENT = ["poop", "butt", "fart", "dummy", "stupid"];
    const lowerCaseName = commenterName.toLowerCase();
    for (const rudeWord of RUDE_WORDS_COMMENT) {
        if (lowerCaseName.includes(rudeWord)) {
            alert("That name seems a bit cheeky! Please use a friendly name.");
            commenterNameInput.focus();
            return;
        }
    }


    comments.push({ name: commenterName, text: commentText, date: new Date().toLocaleString() });
    commenterNameInput.value = ''; // Clear the name input
    commentInput.value = ''; // Clear the comment input
    displayComments();
    localStorage.setItem('gameComments', JSON.stringify(comments));
}

function displayComments() {
    const commentsDisplayUl = document.querySelector('#comments-display ul');
    commentsDisplayUl.innerHTML = ''; // Clear existing comments

    if (comments.length === 0) {
        const noCommentsLi = document.createElement('li');
        noCommentsLi.textContent = "No ideas submitted yet. Be the first!";
        commentsDisplayUl.appendChild(noCommentsLi);
    } else {
        // Display in reverse chronological order (newest first)
        [...comments].reverse().forEach(commentEntry => {
            const li = document.createElement('li');
            const nameSpan = document.createElement('strong');
            nameSpan.textContent = `${commentEntry.name}`;
            const dateSpan = document.createElement('span');
            dateSpan.style.fontSize = '0.8em';
            dateSpan.style.color = '#555';
            dateSpan.style.marginLeft = '10px';
            dateSpan.textContent = `(${commentEntry.date})`;
            
            li.appendChild(nameSpan);
            li.appendChild(dateSpan);
            li.appendChild(document.createElement('br'));
            li.appendChild(document.createTextNode(commentEntry.text));
            commentsDisplayUl.appendChild(li);
        });
    }
}

// Allow pressing Enter to submit password
document.getElementById('password-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default form submission if it were in a form
        checkPassword();
    }
});