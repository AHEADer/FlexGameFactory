const citiesData = [
    { name: "Dallas", flag: "🇺🇸", progress: 0, saved: 0, immune: 0 },
    { name: "New York/NJ", flag: "🇺🇸", progress: 0, saved: 0, immune: 0 },
    { name: "Atlanta", flag: "🇺🇸", progress: 0, saved: 0, immune: 0 },
    { name: "Kansas City", flag: "🇺🇸", progress: 0, saved: 0, immune: 0 },
    { name: "Houston", flag: "🇺🇸", progress: 0, saved: 0, immune: 0 },
    { name: "SF Bay Area", flag: "🇺🇸", progress: 0, saved: 0, immune: 0 },
    { name: "Los Angeles", flag: "🇺🇸", progress: 0, saved: 0, immune: 0 },
    { name: "Philadelphia", flag: "🇺🇸", progress: 0, saved: 0, immune: 0 },
    { name: "Seattle", flag: "🇺🇸", progress: 0, saved: 0, immune: 0 },
    { name: "Boston", flag: "🇺🇸", progress: 0, saved: 0, immune: 0 },
    { name: "Miami", flag: "🇺🇸", progress: 0, saved: 0, immune: 0 },
    { name: "Mexico City", flag: "🇲🇽", progress: 0, saved: 0, immune: 0 },
    { name: "Monterrey", flag: "🇲🇽", progress: 0, saved: 0, immune: 0 },
    { name: "Guadalajara", flag: "🇲🇽", progress: 0, saved: 0, immune: 0 },
    { name: "Vancouver", flag: "🇨🇦", progress: 0, saved: 0, immune: 0 },
    { name: "Toronto", flag: "🇨🇦", progress: 0, saved: 0, immune: 0 }
];

let gameState = {
    daysLeft: 100,
    ap: 5,
    maxAp: 5,
    selectedCityIndex: -1,
    safetyRisk: 0,
    totalProgress: 0,
    isGameOver: false
};

const newsItems = [
    "Maple the Moose spotted eating blueprints in Toronto.",
    "Estadio Azteca's new hybrid pitch looks like a golf course.",
    "MetLife Stadium organizers seeking new Fan Fest site after budget cuts.",
    "Dallas set to host record 9 matches. Cowboys owner seen smiling.",
    "Traffic in LA expected to reach 'interstellar' levels by June.",
    "Zayu the Jaguar mascot accidentally joins a local zoo.",
    "Clutch the Bald Eagle refuses to wear anything but a hard hat.",
    "Vancouver weather forecast: Rain, with a chance of more rain.",
    "Kansas City BBQ designated as official team fuel."
];

// DOM Elements
const citiesGrid = document.getElementById('cities-grid');
const daysLeftEl = document.getElementById('days-left');
const apEl = document.getElementById('ap');
const totalProgressEl = document.getElementById('total-progress');
const riskMeterFill = document.getElementById('risk-meter-fill');
const riskLabel = document.getElementById('risk-label');
const newsTicker = document.querySelector('.ticker-content');
const introModal = document.getElementById('game-intro-modal');
const gameOverModal = document.getElementById('game-over-modal');

// Init
function init() {
    renderCities();
    updateStats();
    introModal.showModal();
    
    document.getElementById('start-game-btn').addEventListener('click', () => {
        introModal.close();
    });

    // Action Listeners
    document.getElementById('btn-standard').addEventListener('click', () => performAction('standard'));
    document.getElementById('btn-overtime').addEventListener('click', () => performAction('overtime'));
    document.getElementById('btn-bribe').addEventListener('click', () => performAction('bribe'));
    document.getElementById('btn-signoff').addEventListener('click', () => performAction('signoff'));
    document.getElementById('btn-rush').addEventListener('click', performRush);
    document.getElementById('btn-next-day').addEventListener('click', nextDay);
}

function renderCities() {
    citiesGrid.innerHTML = '';
    citiesData.forEach((city, index) => {
        const card = document.createElement('div');
        card.className = `city-card ${gameState.selectedCityIndex === index ? 'selected' : ''}`;
        if (city.progress >= 100) card.classList.add('completed');
        
        card.innerHTML = `
            <span class="flag">${city.flag}</span>
            <h3>${city.name}</h3>
            <div class="progress-container">
                <div class="saved-progress" style="width: ${city.saved}%"></div>
                <div class="progress-bar" style="width: ${city.progress}%"></div>
            </div>
            <span class="progress-text">${Math.floor(city.progress)}%</span>
            ${city.immune > 0 ? '<span class="status-tag">🛡️ Immune</span>' : ''}
        `;
        
        card.addEventListener('click', () => selectCity(index));
        citiesGrid.appendChild(card);
    });
}

function selectCity(index) {
    if (gameState.isGameOver) return;
    gameState.selectedCityIndex = index;
    gameState.safetyRisk = 0; // Reset risk when switching cities
    updateStats();
    renderCities();
}

function updateStats() {
    daysLeftEl.textContent = gameState.daysLeft;
    apEl.textContent = `${gameState.ap}/${gameState.maxAp}`;
    
    let sum = 0;
    citiesData.forEach(c => sum += c.progress);
    gameState.totalProgress = (sum / (citiesData.length * 100)) * 100;
    totalProgressEl.textContent = `${Math.floor(gameState.totalProgress)}%`;

    riskMeterFill.style.width = `${gameState.safetyRisk}%`;
    riskLabel.textContent = `SAFETY RISK: ${Math.floor(gameState.safetyRisk)}%`;
    
    const rushBtn = document.getElementById('btn-rush');
    if (gameState.safetyRisk >= 50) {
        rushBtn.classList.add('shake');
    } else {
        rushBtn.classList.remove('shake');
    }

    // Disable buttons if no city selected or no AP
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        const cost = parseInt(btn.textContent.match(/\d+/)[0]);
        btn.disabled = gameState.selectedCityIndex === -1 || gameState.ap < cost || citiesData[gameState.selectedCityIndex].progress >= 100;
    });

    document.getElementById('btn-rush').disabled = gameState.selectedCityIndex === -1 || citiesData[gameState.selectedCityIndex].progress >= 100;
}

function performAction(type) {
    if (gameState.selectedCityIndex === -1 || gameState.isGameOver) return;
    
    const city = citiesData[gameState.selectedCityIndex];
    let cost = 0;
    
    switch(type) {
        case 'standard':
            cost = 1;
            city.progress = Math.min(100, city.progress + 5);
            break;
        case 'overtime':
            cost = 2;
            city.progress = Math.min(100, city.progress + 12);
            break;
        case 'bribe':
            cost = 3;
            city.immune = 3; // Immune for 3 days
            addNews(`Inspector in ${city.name} provided with "hospitality" suite. Immunity granted!`);
            break;
        case 'signoff':
            cost = 1;
            city.saved = city.progress;
            addNews(`Paperwork for ${city.name} filed. Progress secured.`);
            break;
    }

    gameState.ap -= cost;
    updateStats();
    renderCities();
    checkWin();
}

function performRush() {
    if (gameState.selectedCityIndex === -1 || gameState.isGameOver) return;
    
    const city = citiesData[gameState.selectedCityIndex];
    
    // Check for bust
    const bustChance = gameState.safetyRisk / 100;
    if (Math.random() < bustChance) {
        // BUST!
        addNews(`⚠️ SAFETY VIOLATION in ${city.name}! Construction halted. Progress reset to last sign-off.`);
        city.progress = city.saved;
        gameState.safetyRisk = 0;
        // Penalize AP for cleanup?
        gameState.ap = Math.max(0, gameState.ap - 1);
    } else {
        city.progress = Math.min(100, city.progress + 10);
        gameState.safetyRisk += 15; // Risk increases
        addNews(`Rushed progress in ${city.name}. Keep your fingers crossed!`);
    }

    updateStats();
    renderCities();
    checkWin();
}

function nextDay() {
    if (gameState.isGameOver) return;

    gameState.daysLeft--;
    gameState.ap = gameState.maxAp;
    gameState.safetyRisk = 0;

    // Apply Bias (Red Tape)
    citiesData.forEach(city => {
        if (city.immune > 0) {
            city.immune--;
        } else if (city.progress > 0 && city.progress < 100) {
            city.progress = Math.max(city.saved, city.progress - 2);
        }
    });

    // Random Event
    if (Math.random() < 0.3) {
        triggerRandomEvent();
    } else {
        addNews(newsItems[Math.floor(Math.random() * newsItems.length)]);
    }

    if (gameState.daysLeft <= 0) {
        endGame(false, "Time is up! The stadiums aren't ready and the world is watching. You're fired!");
    }

    updateStats();
    renderCities();
}

function triggerRandomEvent() {
    const events = [
        { msg: "BUDGET FREEZE! All un-signed progress reduced by 5%.", effect: () => {
            citiesData.forEach(c => { if(c.progress < 100) c.progress = Math.max(c.saved, c.progress - 5); });
        }},
        { msg: "MASCOT PARADE in random city! Progress halted.", effect: () => {
            const idx = Math.floor(Math.random() * citiesData.length);
            citiesData[idx].progress = Math.max(citiesData[idx].saved, citiesData[idx].progress - 10);
            addNews(`Maple the Moose blocked the concrete mixers in ${citiesData[idx].name}!`);
        }},
        { msg: "SUDDEN GRANT! Gain 2 extra Action Points today.", effect: () => {
            gameState.ap += 2;
        }}
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    addNews(event.msg);
    event.effect();
}

function addNews(msg) {
    newsTicker.textContent = msg;
    // Reset animation
    newsTicker.style.animation = 'none';
    newsTicker.offsetHeight; // trigger reflow
    newsTicker.style.animation = null;
}

function checkWin() {
    const allDone = citiesData.every(c => c.progress >= 100);
    if (allDone) {
        endGame(true, `Victory! All stadiums are ready. You finished with ${gameState.daysLeft} days to spare. FIFA is pleased!`);
    }
}

function endGame(win, msg) {
    gameState.isGameOver = true;
    document.getElementById('game-over-title').textContent = win ? "🏆 MISSION ACCOMPLISHED" : "❌ PROJECT FAILED";
    document.getElementById('game-over-title').style.color = win ? "var(--primary)" : "var(--danger)";
    document.getElementById('game-over-msg').textContent = msg;
    gameOverModal.showModal();
}

init();
