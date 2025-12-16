// Game Data
const gameData = [
    { emperor: "Razia Sultana", place: "Delhi Sultanate", id: 1 },
    { emperor: "Rani Durgavati", place: "Gondwana", id: 2 },
    { emperor: "Rani Abbakka Chowta", place: "Ullal", id: 3 },
    { emperor: "Ahilyabai Holkar", place: "Malwa", id: 4 },
    { emperor: "Rani Chennamma", place: "Kittur", id: 5 },
    { emperor: "Begum Hazrat Mahal", place: "Awadh", id: 6 },
    { emperor: "Rani Lakshmibai", place: "Jhansi", id: 7 },
    { emperor: "Chand Bibi", place: "Ahmednagar", id: 8 },
    { emperor: "Rudrama Devi", place: "Kakatiya Dynasty - Warangal", id: 9 },
    { emperor: "Mangammal", place: "Madurai Nayak Dynasty", id: 10 }
];

// Game State
let currentPlayer = "";
let gameState = {
    score: 0,
    matches: 0,
    attempts: 0,
    startTime: null,
    elapsedTime: 0,
    isPaused: false,
    selectedEmperor: null,
    selectedPlace: null,
    matchedPairs: [],
    timerInterval: null
};

// Storage Keys
const STORAGE_KEY = "womenEmperorsGame";

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    initializeEventListeners();
    showScreen("welcomeScreen");
});

// Event Listeners
function initializeEventListeners() {
    // Welcome Screen
    document.getElementById("startGameBtn").addEventListener("click", startNewGame);
    document.getElementById("viewHistoryBtn").addEventListener("click", () => {
        showHistoryScreen();
    });

    // Game Controls
    document.getElementById("pauseBtn").addEventListener("click", pauseGame);
    document.getElementById("exitBtn").addEventListener("click", exitGame);

    // Pause Screen
    document.getElementById("resumeBtn").addEventListener("click", resumeGame);
    document.getElementById("exitFromPauseBtn").addEventListener("click", exitToMenu);

    // Complete Screen
    document.getElementById("restartBtn").addEventListener("click", restartGame);
    document.getElementById("viewHistoryFromCompleteBtn").addEventListener("click", () => {
        hideModal("completeScreen");
        showHistoryScreen();
    });
    document.getElementById("exitFromCompleteBtn").addEventListener("click", exitToMenu);

    // History Screen
    document.getElementById("backToMenuBtn").addEventListener("click", () => {
        showScreen("welcomeScreen");
    });

    // Player Name Input - Enter key
    document.getElementById("playerName").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            startNewGame();
        }
    });
}

// Screen Management
function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });
    document.getElementById(screenId).classList.add("active");
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add("active");
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove("active");
}

// Game Functions
function startNewGame() {
    const playerName = document.getElementById("playerName").value.trim();

    if (!playerName) {
        alert("Please enter your name to start the game!");
        return;
    }

    currentPlayer = playerName;
    resetGameState();
    initializeGame();
    showScreen("gameScreen");
    startTimer();
}

function resetGameState() {
    gameState = {
        score: 0,
        matches: 0,
        attempts: 0,
        startTime: Date.now(),
        elapsedTime: 0,
        isPaused: false,
        selectedEmperor: null,
        selectedPlace: null,
        matchedPairs: [],
        timerInterval: null
    };
}

function initializeGame() {
    document.getElementById("currentPlayer").textContent = currentPlayer;
    updateScoreDisplay();

    // Shuffle and render lists
    const shuffledEmperors = shuffleArray([...gameData]);
    const shuffledPlaces = shuffleArray([...gameData]);

    renderList("emperorsList", shuffledEmperors, "emperor", selectEmperor);
    renderList("placesList", shuffledPlaces, "place", selectPlace);
}

function renderList(containerId, data, type, clickHandler) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    data.forEach(item => {
        const div = document.createElement("div");
        div.className = "item";
        div.dataset.id = item.id;
        div.textContent = type === "emperor" ? item.emperor : item.place;
        div.addEventListener("click", () => clickHandler(item.id, div));
        container.appendChild(div);
    });
}

function selectEmperor(id, element) {
    if (gameState.isPaused || gameState.matchedPairs.includes(id)) return;

    // Haptic feedback for mobile devices
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }

    // Deselect previous emperor
    document.querySelectorAll("#emperorsList .item").forEach(item => {
        item.classList.remove("selected");
    });

    gameState.selectedEmperor = id;
    element.classList.add("selected");

    // Check if we can make a match
    if (gameState.selectedPlace !== null) {
        checkMatch();
    }
}

function selectPlace(id, element) {
    if (gameState.isPaused || gameState.matchedPairs.includes(id)) return;

    // Haptic feedback for mobile devices
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }

    // Deselect previous place
    document.querySelectorAll("#placesList .item").forEach(item => {
        item.classList.remove("selected");
    });

    gameState.selectedPlace = id;
    element.classList.add("selected");

    // Check if we can make a match
    if (gameState.selectedEmperor !== null) {
        checkMatch();
    }
}

function checkMatch() {
    gameState.attempts++;

    if (gameState.selectedEmperor === gameState.selectedPlace) {
        // Correct match!
        handleCorrectMatch();
    } else {
        // Wrong match
        handleWrongMatch();
    }
}

function handleCorrectMatch() {
    const matchedId = gameState.selectedEmperor;
    gameState.matchedPairs.push(matchedId);
    gameState.matches++;
    gameState.score += 100;

    // Haptic feedback for correct match
    if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]); // Success pattern
    }

    // Mark items as matched
    document.querySelectorAll(`[data-id="${matchedId}"]`).forEach(item => {
        item.classList.remove("selected");
        item.classList.add("matched");
    });

    // Reset selections
    gameState.selectedEmperor = null;
    gameState.selectedPlace = null;

    updateScoreDisplay();

    // Check if game is complete
    if (gameState.matches === gameData.length) {
        setTimeout(() => {
            completeGame();
        }, 500);
    }
}

function handleWrongMatch() {
    gameState.score = Math.max(0, gameState.score - 10);

    // Haptic feedback for wrong match
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]); // Error pattern
    }

    // Show wrong animation
    document.querySelectorAll(".item.selected").forEach(item => {
        item.classList.add("wrong");
        setTimeout(() => {
            item.classList.remove("wrong");
            item.classList.remove("selected");
        }, 500);
    });

    // Reset selections
    setTimeout(() => {
        gameState.selectedEmperor = null;
        gameState.selectedPlace = null;
        updateScoreDisplay();
    }, 500);
}

function updateScoreDisplay() {
    document.getElementById("currentScore").textContent = gameState.score;
    document.getElementById("matchCount").textContent = `${gameState.matches}/${gameData.length}`;
}

// Timer Functions
function startTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    gameState.timerInterval = setInterval(() => {
        if (!gameState.isPaused) {
            gameState.elapsedTime = Date.now() - gameState.startTime;
            updateTimerDisplay();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const seconds = Math.floor(gameState.elapsedTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const timeString = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    document.getElementById("timer").textContent = timeString;
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

// Game Control Functions
function pauseGame() {
    gameState.isPaused = true;
    showModal("pauseScreen");
}

function resumeGame() {
    gameState.isPaused = false;
    hideModal("pauseScreen");
}

function exitGame() {
    if (confirm("Are you sure you want to exit? Your progress will be saved.")) {
        saveGameHistory(false);
        exitToMenu();
    }
}

function exitToMenu() {
    stopTimer();
    hideModal("pauseScreen");
    hideModal("completeScreen");
    showScreen("welcomeScreen");
    document.getElementById("playerName").value = "";
}

function restartGame() {
    hideModal("completeScreen");
    resetGameState();
    initializeGame();
    startTimer();
}

function completeGame() {
    stopTimer();
    saveGameHistory(true);
    showCompleteScreen();
}

function showCompleteScreen() {
    const accuracy = Math.round((gameState.matches / gameState.attempts) * 100);

    document.getElementById("finalScore").textContent = gameState.score;
    document.getElementById("finalTime").textContent = document.getElementById("timer").textContent;
    document.getElementById("accuracy").textContent = `${accuracy}%`;

    showModal("completeScreen");
}

// History Management
function saveGameHistory(completed) {
    const history = getGameHistory();

    const gameRecord = {
        player: currentPlayer,
        score: gameState.score,
        matches: gameState.matches,
        attempts: gameState.attempts,
        time: gameState.elapsedTime,
        completed: completed,
        timestamp: new Date().toISOString()
    };

    if (!history[currentPlayer]) {
        history[currentPlayer] = [];
    }

    history[currentPlayer].push(gameRecord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function getGameHistory() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
}

function showHistoryScreen() {
    showScreen("historyScreen");
    renderHistory();
}

function renderHistory() {
    const history = getGameHistory();
    const allGames = [];

    // Flatten all games from all players
    Object.keys(history).forEach(player => {
        history[player].forEach(game => {
            allGames.push({ ...game, player });
        });
    });

    // Sort by timestamp (most recent first)
    allGames.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Calculate stats
    const completedGames = allGames.filter(g => g.completed);
    const totalGames = completedGames.length;
    const bestScore = totalGames > 0 ? Math.max(...completedGames.map(g => g.score)) : 0;
    const avgScore = totalGames > 0 ? Math.round(completedGames.reduce((sum, g) => sum + g.score, 0) / totalGames) : 0;
    const bestTime = totalGames > 0 ? Math.min(...completedGames.map(g => g.time)) : 0;

    // Update stats
    document.getElementById("totalGames").textContent = totalGames;
    document.getElementById("bestScore").textContent = bestScore;
    document.getElementById("avgScore").textContent = avgScore;
    document.getElementById("bestTime").textContent = formatTime(bestTime);

    // Render history table
    const tableContainer = document.getElementById("historyTable");
    tableContainer.innerHTML = "";

    if (allGames.length === 0) {
        tableContainer.innerHTML = '<div class="history-empty">No games played yet. Start playing to see your history!</div>';
        return;
    }

    // Add header
    const header = document.createElement("div");
    header.className = "history-row header";
    header.innerHTML = `
        <div>Player</div>
        <div>Score</div>
        <div>Matches</div>
        <div>Time</div>
        <div>Date</div>
    `;
    tableContainer.appendChild(header);

    // Add rows (limit to 20 most recent)
    allGames.slice(0, 20).forEach(game => {
        const row = document.createElement("div");
        row.className = "history-row";

        const date = new Date(game.timestamp);
        const dateString = date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        row.innerHTML = `
            <div>${game.player}</div>
            <div>${game.score}</div>
            <div>${game.matches}/${gameData.length}</div>
            <div>${formatTime(game.time)}</div>
            <div>${dateString}</div>
        `;
        tableContainer.appendChild(row);
    });
}

// Utility Functions
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}
