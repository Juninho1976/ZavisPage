const CORRECT_PASSWORD = "ZaviTDJS";
let votes = {
    multiplicationMadness: { up: 0, down: 0 },
    classicSnake: { up: 0, down: 0 },
    capitalsQuiz: { up: 0, down: 0 },
    wordMaths: { up: 0, down: 0 },
    beeMatch: { up: 0, down: 0 }
};
let userGameVotes = {}; // To track user's vote for each game { gameId: 'up'/'down'/null }
let comments = [];

// Load data from localStorage if available
window.onload = function() {
    const storedVotes = localStorage.getItem('gameVotes');
    if (storedVotes) {
        const parsedVotes = JSON.parse(storedVotes);
        // Ensure new structure compatibility
        for (const gameId in votes) {
            if (parsedVotes[gameId] !== undefined) {
                if (typeof parsedVotes[gameId] === 'number') { // Old format
                    // This is a rough migration, assumes old score was net positive for up, or split
                    // For simplicity, we'll reset or try a basic conversion if needed.
                    // Or, better, initialize new games with new structure.
                    // For existing games, if old format, initialize to new.
                    votes[gameId] = { up: parsedVotes[gameId] > 0 ? parsedVotes[gameId] : 0, down: 0 };
                } else {
                    votes[gameId] = parsedVotes[gameId];
                }
            }
        }
    }

    const storedUserGameVotes = localStorage.getItem('userGameVotes');
    if (storedUserGameVotes) {
        userGameVotes = JSON.parse(storedUserGameVotes);
    }

    updateAllVoteCounts();
    updateVoteButtonStates(); // Visually update buttons based on past votes

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

function vote(gameId, newVoteType) {
    const currentVote = userGameVotes[gameId]; // 'up', 'down', or undefined

    // Initialize game in votes if not present (e.g. new game added)
    if (!votes[gameId]) {
        votes[gameId] = { up: 0, down: 0 };
    }

    // If user is casting the same vote again, retract it
    if (currentVote === newVoteType) {
        if (newVoteType === 'up') {
            votes[gameId].up--;
        } else {
            votes[gameId].down--;
        }
        userGameVotes[gameId] = null; // Vote retracted
    } else {
        // If user had a previous different vote, retract that first
        if (currentVote === 'up') {
            votes[gameId].up--;
        } else if (currentVote === 'down') {
            votes[gameId].down--;
        }

        // Cast the new vote
        if (newVoteType === 'up') {
            votes[gameId].up++;
        } else {
            votes[gameId].down++;
        }
        userGameVotes[gameId] = newVoteType; // Record new vote
    }

    updateVoteCount(gameId);
    updateVoteButtonStatesForGame(gameId);
    localStorage.setItem('gameVotes', JSON.stringify(votes));
    localStorage.setItem('userGameVotes', JSON.stringify(userGameVotes));
}


function updateVoteCount(gameId) {
    const upVotesElement = document.getElementById(`up-votes-${gameId}`);
    const downVotesElement = document.getElementById(`down-votes-${gameId}`);
    
    if (votes[gameId] && upVotesElement && downVotesElement) {
        upVotesElement.textContent = votes[gameId].up;
        downVotesElement.textContent = votes[gameId].down;
    } else if (upVotesElement && downVotesElement) { // Game might not be in votes yet if loaded from old LS
        upVotesElement.textContent = "0";
        downVotesElement.textContent = "0";
    }
}

function updateAllVoteCounts() {
    for (const gameId in votes) {
        // Ensure the elements exist before trying to update
        if (document.getElementById(`up-votes-${gameId}`)) {
            updateVoteCount(gameId);
        }
    }
}

function updateVoteButtonStates() {
    for (const gameId in userGameVotes) {
        updateVoteButtonStatesForGame(gameId);
    }
}

function updateVoteButtonStatesForGame(gameId) {
    const gameItem = document.querySelector(`.game-item[data-game-id="${gameId}"]`);
    if (!gameItem) return;

    const upvoteButton = gameItem.querySelector('.upvote');
    const downvoteButton = gameItem.querySelector('.downvote');

    if (!upvoteButton || !downvoteButton) return;

    // Reset styles
    upvoteButton.classList.remove('voted');
    downvoteButton.classList.remove('voted');

    const currentVote = userGameVotes[gameId];
    if (currentVote === 'up') {
        upvoteButton.classList.add('voted');
    } else if (currentVote === 'down') {
        downvoteButton.classList.add('voted');
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