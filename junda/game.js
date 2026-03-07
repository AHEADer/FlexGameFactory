const CONFIG = {
    START_POS: 400, // Distance from bottom (Layoff Zone is 120px)
    LAYOFF_THRESHOLD: 100,
    MAX_POS: 700,
    BIAS_AMOUNT: 30, // How much the conveyor belt moves you down each turn
    SAFE_MOVE: 40,
    SAFE_SCORE: 10,
    AI_SUCCESS_PROB: 0.7, // 70% chance of success
    AI_SUCCESS_MOVE: 80,
    AI_SUCCESS_SCORE: 35,
    AI_FAIL_MOVE: -40, // Slips forward
    AI_FAIL_SCORE: -10
};

let state = {
    position: CONFIG.START_POS,
    score: 0,
    day: 1,
    biasAmount: CONFIG.BIAS_AMOUNT, // Make biasAmount dynamic
    isGameOver: false,
    isAnimating: false
};

// DOM Elements
const avatarEl = document.getElementById('player-avatar');
const dayEl = document.getElementById('day-counter');
const scoreEl = document.getElementById('score-counter');
const statusEl = document.getElementById('status-message');
const btnManual = document.getElementById('btn-manual');
const btnAi = document.getElementById('btn-ai');
const modal = document.getElementById('game-over-modal');
const finalDaysEl = document.getElementById('final-days');
const finalScoreEl = document.getElementById('final-score');
const btnRestart = document.getElementById('btn-restart');
const boardEl = document.getElementById('board');

function init() {
    state = {
        position: CONFIG.START_POS,
        score: 0,
        day: 1,
        biasAmount: CONFIG.BIAS_AMOUNT,
        isGameOver: false,
        isAnimating: false
    };
    updateUI();
    statusEl.textContent = "Survive the AI shift! Don't let the conveyor belt drag you to the Layoff Zone.";
    statusEl.style.color = "#cbd5e1";
    modal.classList.add('hidden');
    avatarEl.classList.remove('shake');
}

function updateUI() {
    const visualPos = Math.min(Math.max(state.position, 0), boardEl.offsetHeight - 50);
    avatarEl.style.bottom = `${visualPos}px`;
    
    dayEl.textContent = state.day;
    scoreEl.textContent = state.score;
}

function showFloatingText(text, isNegative) {
    const el = document.createElement('div');
    el.className = `float-text ${isNegative ? 'negative' : ''}`;
    el.textContent = text;
    
    const avatarRect = avatarEl.getBoundingClientRect();
    const boardRect = boardEl.getBoundingClientRect();
    
    // Position relative to the board
    el.style.left = `${avatarRect.left - boardRect.left + avatarRect.width / 2}px`;
    el.style.top = `${avatarRect.top - boardRect.top}px`;
    
    boardEl.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function checkGameOver() {
    if (state.position <= CONFIG.LAYOFF_THRESHOLD && !state.isGameOver) {
        state.isGameOver = true;
        setTimeout(() => {
            finalDaysEl.textContent = state.day;
            finalScoreEl.textContent = state.score;
            modal.classList.remove('hidden');
        }, 600);
    }
}

function endTurn() {
    if (state.isGameOver) return;
    
    // Conveyor belt bias movement after player action
    setTimeout(() => {
        if(state.isGameOver) return;
        state.position -= state.biasAmount;
        state.day++;
        
        // Difficulty Scaling: Increase belt speed every 10 days
        if (state.day % 10 === 0) {
            state.biasAmount += 5;
            showFloatingText("Belt Speed Increased!", true);
        }
        
        updateUI();
        
        statusEl.textContent = "The conveyor belt inches you closer to obsolescence...";
        statusEl.style.color = "#fbbf24";
        
        checkGameOver();
        state.isAnimating = false;
    }, 800);
}

function performAction(type) {
    if (state.isGameOver || state.isAnimating) return;
    state.isAnimating = true;
    
    avatarEl.classList.remove('shake');
    
    if (type === 'manual') {
        state.position += CONFIG.SAFE_MOVE;
        state.score += CONFIG.SAFE_SCORE;
        statusEl.textContent = "You put your head down and coded manually. Safe, but slow.";
        statusEl.style.color = "#10b981";
        showFloatingText("+10 Val", false);
    } else if (type === 'ai') {
        const roll = Math.random();
        if (roll <= CONFIG.AI_SUCCESS_PROB) {
            // Success
            state.position += CONFIG.AI_SUCCESS_MOVE;
            state.score += CONFIG.AI_SUCCESS_SCORE;
            statusEl.textContent = "AI generated perfect code! Massive productivity boost!";
            statusEl.style.color = "#3b82f6";
            showFloatingText("+35 Val", false);
        } else {
            // Fail
            state.position += CONFIG.AI_FAIL_MOVE;
            state.score += CONFIG.AI_FAIL_SCORE;
            if (state.score < 0) state.score = 0;
            statusEl.textContent = "The AI hallucinated critical infrastructure! You slipped and fell forward!";
            statusEl.style.color = "#ef4444";
            
            // Trigger visual shake
            void avatarEl.offsetWidth;
            avatarEl.classList.add('shake');
            showFloatingText("Oops!", true);
        }
    }
    
    state.position = Math.min(state.position, CONFIG.MAX_POS);
    updateUI();
    
    // Check if player's action already triggered game over (by slipping forward)
    checkGameOver();
    
    // Only proceed to conveyor belt movement if game is not over
    if (!state.isGameOver) {
        endTurn();
    }
}

// Event Listeners
btnManual.addEventListener('click', () => performAction('manual'));
btnAi.addEventListener('click', () => performAction('ai'));
btnRestart.addEventListener('click', init);

// Start game
init();
