const state = {
    tankPoints: 0,
    fanInterest: 100,
    commissionerHeat: 0,
    turn: 1,
    gameOver: false
};

const actions = [
    {
        id: 'load_management',
        title: "Load Management",
        desc: "Sit your star player for 'knee soreness'.",
        baseTank: 10,
        fanCost: 5,
        heatCost: 2,
        multiplier: 1.0
    },
    {
        id: 'g_league',
        title: "Start G-Leaguers",
        desc: "Give the young guys 40 minutes.",
        baseTank: 15,
        fanCost: 10,
        heatCost: 5,
        multiplier: 1.0
    },
    {
        id: 'trade_vet',
        title: "Trade Veteran",
        desc: "Trade your captain for a 2031 2nd round pick.",
        baseTank: 20,
        fanCost: 15,
        heatCost: 10,
        multiplier: 1.0
    },
    {
        id: 'bad_rotation',
        title: "Questionable Rotations",
        desc: "Play your center at point guard.",
        baseTank: 8,
        fanCost: 2,
        heatCost: 0,
        multiplier: 1.0
    },
    {
        id: 'mark_cuban',
        title: "Publicly Admit Tanking",
        desc: "Tell the press losing is the best option.",
        baseTank: 25,
        fanCost: 5, // Fans might actually agree?
        heatCost: 25, // Adam Silver hates this.
        multiplier: 1.0
    }
];

// Random names for flavor
const opponents = ["Celtics", "Lakers", "Warriors", "Knicks", "Heat", "Nuggets"];

function initGame() {
    renderDashboard();
    renderActions();
}

function renderDashboard() {
    document.getElementById('tank-val').innerText = `${Math.floor(state.tankPoints)}%`;
    document.getElementById('tank-bar').style.width = `${Math.min(state.tankPoints, 100)}%`;

    document.getElementById('fan-val').innerText = `${Math.floor(state.fanInterest)}%`;
    document.getElementById('fan-bar').style.width = `${Math.max(state.fanInterest, 0)}%`;
    // Color change for fan interest
    const fanBar = document.getElementById('fan-bar');
    if (state.fanInterest < 30) {
        fanBar.style.backgroundColor = 'var(--accent-red)';
    } else if (state.fanInterest < 60) {
        fanBar.style.backgroundColor = '#ffc107'; // yellow
    } else {
        fanBar.style.backgroundColor = 'var(--accent-green)';
    }

    document.getElementById('heat-val').innerText = `${Math.floor(state.commissionerHeat)}%`;
    document.getElementById('heat-bar').style.width = `${Math.min(state.commissionerHeat, 100)}%`;
}

function renderActions() {
    const container = document.getElementById('action-container');
    container.innerHTML = '';

    // Pick 3 random actions to display
    // Note: In a real game we might want to rotate them, but for this simpler version 
    // we'll show a subset or all. Let's show 3 random ones to force choice.
    // Actually, to make "unchosed resource" mechanic meaningful, the same actions should persist 
    // or come back frequently. Let's just show 3 random ones from the pool, 
    // but the multiplier applies to the specific ID.
    
    // Shuffle actions
    const shuffled = [...actions].sort(() => 0.5 - Math.random());
    const available = shuffled.slice(0, 3);

    available.forEach(action => {
        const card = document.createElement('div');
        card.className = 'action-card';
        card.onclick = () => resolveTurn(action);
        
        let multiplierHtml = action.multiplier > 1.0 
            ? `<div class="multiplier-badge">x${action.multiplier.toFixed(1)} Bonus</div>` 
            : '';

        card.innerHTML = `
            ${multiplierHtml}
            <div>
                <div class="card-title">${action.title}</div>
                <div class="card-desc">${action.desc}</div>
            </div>
            <div class="card-stats">
                <span>Losses: +${(action.baseTank * action.multiplier).toFixed(0)}</span>
                <span>Fans: -${action.fanCost}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function log(msg, type = 'neutral') {
    const logEl = document.getElementById('game-log');
    const entry = document.createElement('p');
    entry.className = `log-entry ${type}`;
    entry.innerText = `> ${msg}`;
    logEl.prepend(entry);
}

function resolveTurn(chosenAction) {
    if (state.gameOver) return;

    // Apply Effects
    const tankGain = chosenAction.baseTank * chosenAction.multiplier;
    state.tankPoints += tankGain;
    state.fanInterest -= chosenAction.fanCost;
    state.commissionerHeat += chosenAction.heatCost;

    log(`Selected: ${chosenAction.title}`, 'neutral');
    log(`Effect: +${tankGain.toFixed(0)} Tank Points, -${chosenAction.fanCost} Fans.`, 'neutral');

    // Reset chosen multiplier
    const actionIndex = actions.findIndex(a => a.id === chosenAction.id);
    actions[actionIndex].multiplier = 1.0;

    // Increase unchosen multipliers
    actions.forEach(a => {
        if (a.id !== chosenAction.id) {
            a.multiplier += 0.2; // Increment slightly each time ignored
        }
    });

    // Random Events based on Heat
    if (Math.random() * 100 < state.commissionerHeat) {
        triggerCommissionerEvent();
    }

    // Check End Game
    checkGameState();

    if (!state.gameOver) {
        state.turn++;
        renderDashboard();
        renderActions();
    }
}

function triggerCommissionerEvent() {
    const events = [
        { msg: "Adam Silver fines you $100k for 'rest'. Fans are embarrassed.", fanLoss: 10, heatLoss: 0 },
        { msg: "The League launches an investigation. Heat rises!", fanLoss: 5, heatLoss: -10 }, // Heat doesn't drop, maybe tank points drop?
        { msg: "Draft Lottery reform rumored. Tanking is less effective.", tankLoss: 10, heatLoss: 20 },
    ];
    const ev = events[Math.floor(Math.random() * events.length)];
    
    log(`EVENT: ${ev.msg}`, 'bad');
    state.fanInterest -= ev.fanLoss || 0;
    state.tankPoints -= ev.tankLoss || 0;
    
    // Sometimes heat cools off after a fine
    state.commissionerHeat -= ev.heatLoss || 10;
    if (state.commissionerHeat < 0) state.commissionerHeat = 0;
}

function checkGameState() {
    if (state.fanInterest <= 0) {
        endGame("The Owners fired you. Fan attendance dropped to zero.", false);
    } else if (state.tankPoints >= 100) {
        endGame("CONGRATULATIONS! You secured the #1 Overall Pick! The future is bright.", true);
    } else if (state.commissionerHeat >= 100) {
        endGame("BANNED FOR LIFE. The Commissioner has expelled you from the league.", false);
    }
}

function endGame(msg, won) {
    state.gameOver = true;
    renderDashboard();
    
    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('modal-title');
    const message = document.getElementById('modal-message');
    
    title.innerText = won ? "MISSION ACCOMPLISHED" : "YOU'RE FIRED";
    title.style.color = won ? "var(--accent-green)" : "var(--accent-red)";
    message.innerText = msg;
    
    modal.classList.remove('hidden');
}

// Start
initGame();
