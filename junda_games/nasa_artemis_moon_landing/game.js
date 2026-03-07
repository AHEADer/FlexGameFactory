document.addEventListener('DOMContentLoaded', () => {
    // --- Game Constants & State ---
    const PHASES = [
        { id: 2, name: "Artemis II: Flyby", goal: "Orbit the Moon", cost: 20 },
        { id: 3, name: "Artemis III: Docking", goal: "Practice Earth Orbit Docking", cost: 30 },
        { id: 4, name: "Artemis IV: HLS Test", goal: "Test Starship/Blue Moon", cost: 50 },
        { id: 5, name: "Artemis V: Landing", goal: "Boots on South Pole", cost: 80 }
    ];

    let state = {
        currentPhaseIdx: 0,
        year: 2026,
        month: 3,
        budget: 150,
        confidence: 40,
        pressure: 10,
        gameActive: false,
        isGameOver: false
    };

    // --- DOM Elements ---
    const el = {
        phase: document.getElementById('current-phase'),
        year: document.getElementById('current-year'),
        pressureBar: document.getElementById('pressure-bar'),
        budget: document.getElementById('stat-budget'),
        confidence: document.getElementById('stat-confidence'),
        log: document.getElementById('log-content'),
        introModal: document.getElementById('game-intro-modal'),
        gameOverModal: document.getElementById('game-over-modal'),
        rocket: document.getElementById('rocket-icon'),
        nodes: [
            document.getElementById('node-2'),
            document.getElementById('node-3'),
            document.getElementById('node-4'),
            document.getElementById('node-5')
        ]
    };

    // --- Initialization ---
    el.introModal.showModal();

    document.getElementById('start-game-btn').addEventListener('click', () => {
        el.introModal.close();
        state.gameActive = true;
        addLog("NASA Administrator: 'We're going to launch in a matter of weeks!' (Maybe).");
    });

    // --- Core Actions ---
    document.getElementById('btn-research').addEventListener('click', () => performAction('research'));
    document.getElementById('btn-fundraise').addEventListener('click', () => performAction('fundraise'));
    document.getElementById('btn-launch').addEventListener('click', () => performAction('launch'));

    function performAction(type) {
        if (!state.gameActive || state.isGameOver) return;

        advanceTime();

        if (type === 'research') {
            state.confidence = Math.min(100, state.confidence + 15);
            addLog("Engineers found a way to patch the helium flaw with duct tape. +15% Tech Confidence.");
        } else if (type === 'fundraise') {
            state.budget += 30;
            addLog("Lobbied Congress. NASA budget increased, but they want results by 2028! +$30M.");
        } else if (type === 'launch') {
            handleLaunch();
        }

        updateUI();
        checkGameOver();
    }

    // --- Mechanics Logic ---

    // MOV-14 Bias: Pressure increases over time
    function advanceTime() {
        state.month += 2;
        if (state.month > 12) {
            state.month = 1;
            state.year++;
        }
        
        // Difficulty scaling: Pressure grows faster as phases advance
        const pressureGrowth = 5 + (state.currentPhaseIdx * 3);
        state.pressure += pressureGrowth;
        
        state.budget -= 5; // Passive burn
    }

    // UNC-02 Push-Your-Luck: Launch success
    function handleLaunch() {
        const currentPhase = PHASES[state.currentPhaseIdx];
        
        if (state.budget < currentPhase.cost) {
            addLog("ERROR: Insufficient funds for launch. Need more lobbying!");
            return;
        }

        state.budget -= currentPhase.cost;
        addLog(`Initiating ${currentPhase.name} launch sequence...`);

        // Probability of success based on tech confidence
        const roll = Math.random() * 100;
        if (roll < state.confidence) {
            // SUCCESS
            successAction(currentPhase);
        } else {
            // FAILURE (The "Bust")
            failureAction();
        }
    }

    function successAction(phase) {
        addLog(`SUCCESS! ${phase.name} mission objective achieved: ${phase.goal}.`);
        
        // Mark node as completed
        el.nodes[state.currentPhaseIdx].classList.remove('active');
        el.nodes[state.currentPhaseIdx].classList.add('completed');
        
        state.currentPhaseIdx++;
        state.confidence = Math.max(30, state.confidence - 20); // Reset some confidence for new tech
        
        if (state.currentPhaseIdx < PHASES.length) {
            // Unlock next phase (ACT-15)
            const nextPhase = PHASES[state.currentPhaseIdx];
            el.nodes[state.currentPhaseIdx].classList.remove('locked');
            el.nodes[state.currentPhaseIdx].classList.add('active');
            
            // Move rocket icon
            const leftPos = 10 + (state.currentPhaseIdx * 25);
            el.rocket.style.left = `${leftPos}%`;
            
            addLog(`GATING: ${nextPhase.name} is now authorized.`);
        } else {
            winGame();
        }
    }

    function failureAction() {
        const failRoll = Math.random();
        if (failRoll > 0.5) {
            addLog("CRITICAL FAILURE: Hydrogen leak detected at the base of the SLS! Mission scrubbed. Pressure increases!");
            state.pressure += 15;
        } else {
            addLog("TECHNICAL FLAW: Helium valve malfunction. Artemis roadmap overhauled AGAIN. Budget wasted!");
        }
        state.confidence = Math.max(10, state.confidence - 10);
    }

    // --- UI Helpers ---
    function updateUI() {
        if (state.currentPhaseIdx < PHASES.length) {
            el.phase.textContent = PHASES[state.currentPhaseIdx].name;
        }
        el.year.textContent = `${state.year} (M${state.month})`;
        el.pressureBar.style.width = `${state.pressure}%`;
        el.budget.textContent = `$${state.budget}M`;
        el.confidence.textContent = `${state.confidence}%`;

        if (state.pressure > 80) {
            el.pressureBar.parentElement.classList.add('pulse');
        }
    }

    function addLog(msg) {
        const p = document.createElement('p');
        p.className = 'log-entry';
        p.textContent = `> ${msg}`;
        el.log.prepend(p);
    }

    // --- Win/Loss Conditions ---
    function checkGameOver() {
        if (state.pressure >= 100) {
            loseGame("POLITICAL COLLAPSE: Congress has defunded the Moon program. 'We'll just send a rover next decade,' they say.");
        } else if (state.budget <= 0) {
            loseGame("BANKRUPTCY: NASA has run out of money. The SLS rocket is being sold for scrap on eBay.");
        } else if (state.year >= 2029) {
            loseGame("DEADLINE MISSED: It's 2029. The administration has changed, and they've decided to prioritize Mars instead. You are fired.");
        }
    }

    function loseGame(msg) {
        state.isGameOver = true;
        state.gameActive = false;
        document.getElementById('game-over-title').textContent = "MISSION FAILURE";
        document.getElementById('game-over-msg').textContent = msg;
        el.gameOverModal.showModal();
    }

    function winGame() {
        state.isGameOver = true;
        state.gameActive = false;
        document.getElementById('game-over-title').textContent = "VICTORY: BOOTS ON MOON!";
        document.getElementById('game-over-msg').textContent = "Incredible! Against all leaks, flaws, and political bickering, you've landed humans on the lunar South Pole in 2028. Jared Isaacman is pleased.";
        el.gameOverModal.showModal();
    }
});
