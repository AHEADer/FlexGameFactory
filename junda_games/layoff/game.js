// Game State
let state = {
    score: 0,
    maxScore: 100,
    distance: 0,
    maxDistance: 20,
    turn: 1,
    conveyorSpeed: 1,
    
    // Push your luck state
    potentialPoints: 0,
    burnoutRisk: 10,
    isCrunching: false
};

// DOM Elements
const elScore = document.getElementById('score');
const elTurn = document.getElementById('turn');
const elSpeed = document.getElementById('speed');
const elAvatar = document.getElementById('avatar');
const elDistance = document.getElementById('distance');

const btnUpskill = document.getElementById('btn-upskill');
const btnNetwork = document.getElementById('btn-network');
const btnCrunch = document.getElementById('btn-crunch');

const modalCrunch = document.getElementById('crunch-modal');
const elPotentialPoints = document.getElementById('potential-points');
const elBurnoutRisk = document.getElementById('burnout-risk');
const btnCode = document.getElementById('btn-code');
const btnDeploy = document.getElementById('btn-deploy');

const modalGameOver = document.getElementById('game-over-modal');
const elGameOverTitle = document.getElementById('game-over-title');
const elGameOverMessage = document.getElementById('game-over-message');
const btnRestart = document.getElementById('btn-restart');

// --- Core Game Loop Functions ---

function updateUI() {
    elScore.innerText = `${state.score} / ${state.maxScore}`;
    elTurn.innerText = state.turn;
    elSpeed.innerText = `${state.conveyorSpeed} step(s)/turn`;
    elDistance.innerText = state.distance;
    
    // Math for avatar position: 20px left padding to calc(100% - 60px)
    const percentage = Math.min((state.distance / state.maxDistance) * 100, 100);
    elAvatar.style.left = `calc(20px + (100% - 80px) * ${percentage / 100})`;
}

function checkGameOver() {
    if (state.score >= state.maxScore) {
        endGame("Promotion Secured!", "You successfully pivoted to an AI leadership role. You survive the layoffs!");
        return true;
    }
    if (state.distance >= state.maxDistance) {
        endGame("You've Been Replaced", "The conveyor belt of progress pushed you into the layoff zone. An AI is now doing your job.");
        return true;
    }
    return false;
}

function endGame(title, message) {
    elGameOverTitle.innerText = title;
    elGameOverMessage.innerText = message;
    
    if(state.score >= state.maxScore) {
        elGameOverTitle.style.color = 'var(--accent-green)';
    } else {
        elGameOverTitle.style.color = 'var(--accent-red)';
    }
    
    modalGameOver.classList.remove('hidden');
}

function resolveTurn() {
    state.turn++;
    
    // Difficulty Scaling (Conveyor accelerates)
    if (state.turn % 5 === 0) {
        state.conveyorSpeed++;
    }
    
    // Bias Mechanic: Conveyor belt automatically pushes player
    state.distance += state.conveyorSpeed;
    if (state.distance < 0) state.distance = 0; // Can't go below 0
    
    updateUI();
    checkGameOver();
}

// --- Worker Placement Actions ---

// 1. Upskill (Safe)
btnUpskill.addEventListener('click', () => {
    state.score += 10;
    resolveTurn();
});

// 2. Network (Defense)
btnNetwork.addEventListener('click', () => {
    state.distance = Math.max(0, state.distance - 3);
    resolveTurn();
});

// 3. Crunch Time (Push Your Luck Initiation)
btnCrunch.addEventListener('click', () => {
    state.isCrunching = true;
    state.potentialPoints = 0;
    state.burnoutRisk = 15; // Start at 15% risk
    
    elPotentialPoints.innerText = state.potentialPoints;
    elBurnoutRisk.innerText = state.burnoutRisk + '%';
    
    modalCrunch.classList.remove('hidden');
});

// --- Push Your Luck Logic ---

btnCode.addEventListener('click', () => {
    const roll = Math.random() * 100;
    
    if (roll < state.burnoutRisk) {
        // BUST!
        modalCrunch.classList.add('hidden');
        alert("BURNOUT! You lost all potential points and severely fell behind.");
        state.distance += 3; // Penalty
        state.isCrunching = false;
        resolveTurn();
    } else {
        // SUCCESS!
        state.potentialPoints += 15;
        state.burnoutRisk += 15; // Risk increases with every push
        
        elPotentialPoints.innerText = state.potentialPoints;
        elBurnoutRisk.innerText = state.burnoutRisk + '%';
    }
});

btnDeploy.addEventListener('click', () => {
    // Lock in
    state.score += state.potentialPoints;
    modalCrunch.classList.add('hidden');
    state.isCrunching = false;
    alert(`Deployed successfully! Secured ${state.potentialPoints} AI Points.`);
    resolveTurn();
});

// --- Restart ---
btnRestart.addEventListener('click', () => {
    state = {
        score: 0,
        maxScore: 100,
        distance: 0,
        maxDistance: 20,
        turn: 1,
        conveyorSpeed: 1,
        potentialPoints: 0,
        burnoutRisk: 10,
        isCrunching: false
    };
    modalGameOver.classList.add('hidden');
    updateUI();
});

// Init
updateUI();
