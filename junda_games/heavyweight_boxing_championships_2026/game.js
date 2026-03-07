const FIGHTERS = [
    { id: 'usyk', name: 'Oleksandr Usyk', baseCost: 5000000, power: 8, stamina: 90, type: 'Boxer' },
    { id: 'verhoeven', name: 'Rico Verhoeven', baseCost: 4000000, power: 9, stamina: 80, type: 'Kickboxer' },
    { id: 'mayweather', name: 'Floyd Mayweather', baseCost: 8000000, power: 6, stamina: 100, type: 'Tactician' },
    { id: 'shields', name: 'Claressa Shields', baseCost: 6000000, power: 8, stamina: 95, type: 'Undisputed' },
    { id: 'tyson', name: 'Mike Tyson', baseCost: 3000000, power: 10, stamina: 60, type: 'Legend' }
];

let state = {
    money: 10000000,
    reputation: 3,
    phase: 'bidding',
    ap: 5,
    selectedMarketFighter: null,
    playerFighter: null,
    hype: 1,
    opponentHp: 100,
    playerHp: 100,
    playerStamina: 100,
    fightLog: [],
    consecutiveKos: 0
};

// DOM Elements
const elMoney = document.getElementById('stat-money');
const elReputation = document.getElementById('stat-reputation');
const elPhase = document.getElementById('stat-phase');
const elAP = document.getElementById('stat-ap');
const elMarket = document.getElementById('fighter-market');
const elBidControls = document.getElementById('bid-controls');
const elBidAmount = document.getElementById('bid-amount');
const elActiveFighter = document.getElementById('active-fighter-card');
const elFightLog = document.getElementById('fight-log');
const elEnemyHp = document.getElementById('enemy-hp');
const elPlayerHp = document.getElementById('player-hp');
const elPlayerStamina = document.getElementById('player-stamina');
const elPlayerFighterName = document.getElementById('player-fighter-name');

const modalIntro = document.getElementById('game-intro-modal');
const modalOver = document.getElementById('game-over-modal');

// Init
window.onload = () => {
    modalIntro.showModal();
    initMarket();
};

document.getElementById('btn-start-game').onclick = () => {
    modalIntro.close();
    updateUI();
};

function initMarket() {
    elMarket.innerHTML = '';
    FIGHTERS.forEach(f => {
        const card = document.createElement('div');
        card.className = 'fighter-card';
        card.innerHTML = `
            <h3>${f.name}</h3>
            <p>${f.type}</p>
            <p>Power: ${f.power} | Stamina: ${f.stamina}</p>
            <p class="cost">Min Bid: $${(f.baseCost / 1000000).toFixed(1)}M</p>
        `;
        card.onclick = () => selectFighter(f, card);
        elMarket.appendChild(card);
    });
}

function selectFighter(f, card) {
    state.selectedMarketFighter = f;
    document.querySelectorAll('.fighter-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    elBidControls.classList.remove('hidden');
    elBidAmount.value = f.baseCost;
}

document.getElementById('btn-submit-bid').onclick = () => {
    const bid = parseInt(elBidAmount.value);
    if (bid > state.money) {
        alert("Not enough cash!");
        return;
    }
    
    // Sealed Bid Auction (AUC-04) Logic
    const rivalBid = state.selectedMarketFighter.baseCost * (1 + Math.random() * 0.5);
    if (bid >= rivalBid) {
        state.money -= bid;
        state.playerFighter = { ...state.selectedMarketFighter };
        state.playerStamina = state.playerFighter.stamina;
        logFight(`Signed ${state.playerFighter.name} for $${(bid / 1000000).toFixed(1)}M!`);
        startPrep();
    } else {
        alert(`Outbid! Rival promoter paid $${(rivalBid / 1000000).toFixed(1)}M. Your reputation took a hit.`);
        state.reputation--;
        checkGameOver();
    }
    updateUI();
};

function startPrep() {
    state.phase = 'prep';
    state.ap = 5;
    document.getElementById('phase-bidding').classList.add('hidden');
    document.getElementById('phase-prep').classList.remove('hidden');
    elActiveFighter.innerHTML = `
        <div class="fighter-card selected">
            <h3>${state.playerFighter.name}</h3>
            <p>Hype: x${state.hype.toFixed(1)}</p>
            <p>Stamina: ${state.playerStamina}</p>
        </div>
    `;
}

// Prep Actions (ACT-01)
document.getElementById('btn-hype').onclick = () => {
    if (state.ap <= 0) return;
    state.ap--;
    state.hype += 0.5;
    state.playerStamina = Math.max(10, state.playerStamina - 15);
    updateUI();
    refreshPrepCard();
};

document.getElementById('btn-train').onclick = () => {
    if (state.ap <= 0) return;
    state.ap--;
    state.playerStamina += 20;
    state.hype = Math.max(1, state.hype - 0.2);
    updateUI();
    refreshPrepCard();
};

document.getElementById('btn-sponsor').onclick = () => {
    if (state.ap <= 0) return;
    state.ap--;
    state.money += 1000000 * state.hype;
    updateUI();
};

function refreshPrepCard() {
    elActiveFighter.querySelector('p:nth-child(2)').innerText = `Hype: x${state.hype.toFixed(1)}`;
    elActiveFighter.querySelector('p:nth-child(3)').innerText = `Stamina: ${state.playerStamina}`;
}

document.getElementById('btn-start-fight').onclick = () => {
    state.phase = 'fight';
    state.opponentHp = 100 + (10 - state.reputation) * 5; // Difficulty scaling
    state.playerHp = 100;
    elPlayerFighterName.innerText = state.playerFighter.name;
    document.getElementById('phase-prep').classList.add('hidden');
    document.getElementById('phase-fight').classList.remove('hidden');
    logFight("Welcome to Giza! The Pyramids look down upon this epic clash.");
    updateUI();
};

// Fight Logic (UNC-02 Push-Your-Luck)
document.getElementById('btn-punch').onclick = () => resolveFightAction('punch');
document.getElementById('btn-combo').onclick = () => resolveFightAction('combo');
document.getElementById('btn-rest').onclick = () => resolveFightAction('rest');

function resolveFightAction(type) {
    if (state.phase !== 'fight') return;

    let playerDmg = 0;
    let enemyDmg = 0;
    let staminaChange = 0;

    if (type === 'punch') {
        // Safe bet
        playerDmg = state.playerFighter.power * 2;
        staminaChange = -5;
        logFight(`${state.playerFighter.name} lands a solid jab.`);
    } else if (type === 'combo') {
        // Push your luck!
        if (Math.random() > 0.5) {
            playerDmg = state.playerFighter.power * 5;
            staminaChange = -20;
            logFight(`CRITICAL! ${state.playerFighter.name} unleashes a devastating combo!`);
        } else {
            enemyDmg = 20;
            staminaChange = -30;
            logFight(`COUNTERED! The opponent caught you leaning. Massive stamina loss.`);
        }
    } else if (type === 'rest') {
        staminaChange = 15;
        logFight(`${state.playerFighter.name} circles the ring, catching their breath.`);
    }

    // Opponent always hits back a bit
    enemyDmg += 5 + Math.random() * 5;

    state.opponentHp = Math.max(0, state.opponentHp - playerDmg);
    state.playerHp = Math.max(0, state.playerHp - enemyDmg);
    state.playerStamina += staminaChange;

    // Stamina check - if stamina <= 0, player is exhausted and takes double damage
    if (state.playerStamina <= 0) {
        state.playerStamina = 0;
        state.playerHp -= 10;
        logFight(`${state.playerFighter.name} is EXHAUSTED!`);
    }

    updateUI();
    checkFightEnd();
}

function checkFightEnd() {
    if (state.opponentHp <= 0) {
        const purse = 20000000 * state.hype;
        state.money += purse;
        state.reputation++;
        alert(`VICTORY IN GIZA! You earned $${(purse / 1000000).toFixed(1)}M. Profit: $${(state.money / 1000000).toFixed(1)}M`);
        resetToMarket();
    } else if (state.playerHp <= 0) {
        alert("KNOCKOUT! Your fighter is down. The crowd is silent.");
        state.reputation--;
        state.consecutiveKos++;
        resetToMarket();
    }
}

function resetToMarket() {
    state.phase = 'bidding';
    state.hype = 1;
    document.getElementById('phase-fight').classList.add('hidden');
    document.getElementById('phase-prep').classList.add('hidden');
    document.getElementById('phase-bidding').classList.remove('hidden');
    elBidControls.classList.add('hidden');
    initMarket();
    updateUI();
    checkGameOver();
}

function logFight(msg) {
    const p = document.createElement('p');
    p.innerText = `> ${msg}`;
    elFightLog.prepend(p);
}

function updateUI() {
    elMoney.innerText = `$${(state.money / 1000000).toFixed(1)}M`;
    elReputation.innerText = '⭐'.repeat(Math.max(0, state.reputation));
    elPhase.innerText = state.phase.charAt(0).toUpperCase() + state.phase.slice(1);
    elAP.innerText = state.ap;
    
    elEnemyHp.style.width = `${state.opponentHp}%`;
    elPlayerHp.style.width = `${state.playerHp}%`;
    elPlayerStamina.innerText = state.playerStamina;

    if (state.money >= 100000000) {
        winGame();
    }
}

function checkGameOver() {
    if (state.money < 1000000 && state.phase === 'bidding') {
        endGame("Bankrupt! You don't have enough to sign even a legend.");
    } else if (state.reputation <= 0) {
        endGame("Disgraced! No one wants to fight for your promotion anymore.");
    } else if (state.consecutiveKos >= 3) {
        endGame("Three fighters in a row KO'd. The boxing commission has revoked your license.");
    }
}

function winGame() {
    state.phase = 'won';
    const modal = document.getElementById('game-over-modal');
    document.getElementById('over-title').innerText = "Promotion King!";
    document.getElementById('over-msg').innerText = "You've dominated the Heavyweight scene and made $100M! Eddie Hearn and Dana White are calling YOU for advice.";
    modal.showModal();
}

function endGame(reason) {
    state.phase = 'lost';
    const modal = document.getElementById('game-over-modal');
    document.getElementById('over-title').innerText = "Game Over";
    document.getElementById('over-msg').innerText = reason;
    modal.showModal();
}
