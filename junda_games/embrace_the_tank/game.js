/**
 * Embrace the Tank - Game Logic
 */

const MAX_GAMES = 20;
const MAX_WINS = 4; // Lose if 5 wins reached
const MAX_SUSPICION = 100;
const BASE_TIMER = 8; // seconds per game turn

let currentGameState = {
    gameNumber: 1,
    wins: 0,
    losses: 0,
    suspicion: 0,
    timer: BASE_TIMER,
    intervalId: null
};

// DOM Elements
const els = {
    gameNumber: document.getElementById('game-number'),
    timerDisplay: document.querySelector('#timer-display span'),
    seasonProgress: document.getElementById('season-progress'),
    winCount: document.getElementById('win-count'),
    lossCount: document.getElementById('loss-count'),
    suspicionText: document.getElementById('suspicion-text'),
    suspicionProgress: document.getElementById('suspicion-progress'),
    commissionerWarning: document.getElementById('commissioner-warning'),
    simBtn: document.getElementById('sim-btn'),
    overlay: document.getElementById('game-over-overlay'),
    endTitle: document.getElementById('end-title'),
    endMessage: document.getElementById('end-message'),
    finalWins: document.getElementById('final-wins'),
    finalLosses: document.getElementById('final-losses'),
    restartBtn: document.getElementById('restart-btn'),
    
    // Zones
    slots: {
        pool: document.getElementById('worker-pool'),
        court: document.getElementById('court-slots'),
        bench: document.getElementById('bench-slots'),
        ir: document.getElementById('ir-slots')
    },
    
    workers: document.querySelectorAll('.worker')
};

// --- Drag and Drop Logic --- //

els.workers.forEach(worker => {
    worker.addEventListener('dragstart', () => {
        worker.classList.add('dragging');
    });

    worker.addEventListener('dragend', () => {
        worker.classList.remove('dragging');
    });
});

const dropZones = [els.slots.pool, els.slots.court, els.slots.bench, els.slots.ir];

dropZones.forEach(zone => {
    const parentZone = zone.parentElement.classList.contains('zone') ? zone.parentElement : null;

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (parentZone) parentZone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => {
        if (parentZone) parentZone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        if (parentZone) parentZone.classList.remove('drag-over');
        
        const draggable = document.querySelector('.dragging');
        if (draggable) {
            zone.appendChild(draggable);
        }
    });
});

// --- Game Loop and Simulation --- //

function startTurnTimer() {
    clearInterval(currentGameState.intervalId);
    
    // Scale difficulty: timer gets faster
    let timeLimit = Math.max(3, BASE_TIMER - Math.floor(currentGameState.gameNumber / 4));
    currentGameState.timer = timeLimit;
    
    els.timerDisplay.textContent = currentGameState.timer;
    
    currentGameState.intervalId = setInterval(() => {
        currentGameState.timer--;
        els.timerDisplay.textContent = currentGameState.timer;
        
        if (currentGameState.timer <= 0) {
            clearInterval(currentGameState.intervalId);
            simulateGame();
        }
    }, 1000);
}

function updateUI() {
    els.gameNumber.textContent = currentGameState.gameNumber;
    els.seasonProgress.style.width = `${(currentGameState.gameNumber / MAX_GAMES) * 100}%`;
    els.winCount.textContent = currentGameState.wins;
    els.lossCount.textContent = currentGameState.losses;
    
    els.suspicionText.textContent = `${Math.floor(currentGameState.suspicion)}%`;
    els.suspicionProgress.style.width = `${currentGameState.suspicion}%`;
    
    if (currentGameState.suspicion > 75) {
        els.suspicionProgress.style.background = '#991b1b';
    } else {
        els.suspicionProgress.style.background = '';
    }
}

function showWarning() {
    els.commissionerWarning.classList.remove('shake');
    void els.commissionerWarning.offsetWidth; // trigger reflow
    els.commissionerWarning.classList.add('shake');
}

function simulateGame() {
    clearInterval(currentGameState.intervalId);

    // Evaluate Placements
    let starsOnCourt = 0;
    let scrubsOnCourt = 0;
    let starsInIR = 0;

    Array.from(els.slots.court.children).forEach(w => {
        if(w.dataset.type === 'star') starsOnCourt++;
        if(w.dataset.type === 'bench') scrubsOnCourt++;
    });

    Array.from(els.slots.ir.children).forEach(w => {
        if(w.dataset.type === 'star') starsInIR++;
    });

    // 1. Calculate Suspicion (Push-Your-Luck)
    // Commissioner gets mad if stars are in IR. Base penalty + scaling mechanic
    let suspicionGain = 0;
    if (starsInIR > 0) {
        // More penalty as season progresses
        const multiplier = 1 + (currentGameState.gameNumber / 10);
        suspicionGain = (10 * starsInIR) * multiplier;
        currentGameState.suspicion += suspicionGain;
        showWarning();
    }
    
    // Reduce suspicion slightly if stars play
    if (starsOnCourt > 0) {
        currentGameState.suspicion = Math.max(0, currentGameState.suspicion - (5 * starsOnCourt));
    }

    // 2. Calculate Win/Loss (Bias / Worker Placement)
    // Stars bias towards winning.
    let gameResult = 'loss'; // default to tanking
    
    if (starsOnCourt >= 2) {
        gameResult = 'win';
    } else if (starsOnCourt === 1) {
        // 70% chance to win with 1 star, unless heavy scrubs
        let winChance = 0.7 - (scrubsOnCourt * 0.1);
        if (Math.random() < winChance) gameResult = 'win';
    } else {
        // 0 stars. But if no scrubs either? 
        if (scrubsOnCourt === 0) {
            // No one on court - forfeit? Forfeiting is obvious tanking!
            currentGameState.suspicion += 20;
            showWarning();
            gameResult = 'loss';
        } else {
            // Scrubs playing - great!
            // Tiny 10% chance of random win (any given Sunday!)
            if (Math.random() < 0.1) gameResult = 'win';
        }
    }

    if (gameResult === 'win') {
        currentGameState.wins++;
    } else {
        currentGameState.losses++;
    }

    // Check End Conditions IMMEDIATELY
    if (checkEndCondition()) {
        return; // Game over overlay triggered
    }

    // Advance Game
    currentGameState.gameNumber++;
    updateUI();

    if (currentGameState.gameNumber > MAX_GAMES) {
        endGame('win');
        return;
    }

    // Reset all workers back to pool automatically for the next turn?
    // Let's leave them where they are! It forces the player to actively manage them.
    // If they leave them in IR, they keep getting suspected.

    startTurnTimer();
}

function checkEndCondition() {
    if (currentGameState.suspicion >= MAX_SUSPICION) {
        currentGameState.suspicion = 100;
        updateUI();
        endGame('fired');
        return true;
    }
    if (currentGameState.wins > MAX_WINS) {
        endGame('mediocre');
        return true;
    }
    return false;
}

function endGame(reason) {
    clearInterval(currentGameState.intervalId);
    els.overlay.classList.remove('hidden');
    els.finalWins.textContent = currentGameState.wins;
    els.finalLosses.textContent = currentGameState.losses;

    const overlayContent = els.overlay.querySelector('.overlay-content');
    
    if (reason === 'win') {
        els.endTitle.textContent = "TANK SUCCESSFUL!";
        els.endTitle.className = 'win-title';
        els.endMessage.textContent = "You finished the season with a terrible record! The No. 1 Pick is yours! Mark Cuban would be proud.";
        overlayContent.style.borderColor = 'var(--success)';
    } else if (reason === 'fired') {
        els.endTitle.textContent = "COMMISSIONER FINED";
        els.endTitle.className = 'lose-title';
        els.endMessage.textContent = "Adam Silver caught on to your blatant resting of superstars. You were fined $1M and lost your draft picks!";
        overlayContent.style.borderColor = 'var(--danger)';
    } else if (reason === 'mediocre') {
        els.endTitle.textContent = "MEDIOCRITY PURGATORY";
        els.endTitle.className = 'lose-title';
        els.endMessage.textContent = "You won too many games! Now you're stuck with the 14th pick in the draft. The absolute worst place to be.";
        overlayContent.style.borderColor = 'var(--danger)';
    }
}

function initGame() {
    els.overlay.classList.add('hidden');
    currentGameState = {
        gameNumber: 1,
        wins: 0,
        losses: 0,
        suspicion: 0,
        timer: BASE_TIMER,
        intervalId: null
    };
    
    // Move all workers back to pool
    els.workers.forEach(worker => {
        els.slots.pool.appendChild(worker);
    });

    updateUI();
    startTurnTimer();
}

// Event Listeners
els.simBtn.addEventListener('click', simulateGame);
els.restartBtn.addEventListener('click', initGame);

// Start
initGame();
