document.addEventListener('DOMContentLoaded', () => {
    // Game State
    let state = {
        tankScore: 0,
        outrage: 0,
        patience: 100,
        week: 1,
        isGameOver: false,
        canTrade: true,
        isLotteryStarted: false
    };

    // DOM Elements
    const tankScoreVal = document.getElementById('tank-score-val');
    const tankScoreBar = document.getElementById('tank-score-bar');
    const outrageVal = document.getElementById('outrage-val');
    const outrageBar = document.getElementById('outrage-bar');
    const patienceVal = document.getElementById('patience-val');
    const patienceBar = document.getElementById('patience-bar');
    const weekVal = document.getElementById('week-val');
    const eventLog = document.getElementById('event-log');
    const lotteryMachine = document.getElementById('lottery-machine');
    
    const btnPlayFair = document.getElementById('btn-play-fair');
    const btnLoadManagement = document.getElementById('btn-load-management');
    const btnTradeStar = document.getElementById('btn-trade-star');
    const startBtn = document.getElementById('start-game-btn');
    const introModal = document.getElementById('game-intro-modal');
    const gameOverModal = document.getElementById('game-over-modal');
    const endTitle = document.getElementById('end-title');
    const endMessage = document.getElementById('end-message');

    // Initialize
    startBtn.addEventListener('click', () => {
        introModal.close();
        logEvent("The season has officially tipped off. Time to secure that pick.", "system");
    });

    // Actions
    btnPlayFair.addEventListener('click', () => handleAction('fair'));
    btnLoadManagement.addEventListener('click', () => handleAction('load'));
    btnTradeStar.addEventListener('click', () => handleAction('trade'));

    function handleAction(type) {
        if (state.isGameOver) return;

        let dTank = 0, dOutrage = 0, dPatience = 0;
        let msg = "";

        switch(type) {
            case 'fair':
                dTank = 1;
                dOutrage = -2;
                dPatience = 2;
                msg = "You played your starters. Fans are happy, but you won a meaningless game. +1 Tank Score.";
                break;
            case 'load':
                // Push Your Luck mechanic: Randomize the outcome slightly
                const luck = Math.random();
                if (luck > 0.8) {
                    dTank = 15;
                    dOutrage = 20;
                    dPatience = -10;
                    msg = "REPORTER: 'Is he really injured?' Media is hounding you. Massive tanking gains, but fans are furious!";
                } else {
                    dTank = 10;
                    dOutrage = 12;
                    dPatience = -5;
                    msg = "Stars are 'resting'. The team looks terrible. Just as planned. +10 Tank Score.";
                }
                break;
            case 'trade':
                if (!state.canTrade) return;
                dTank = 25;
                dOutrage = 35;
                dPatience = -15;
                state.canTrade = false;
                btnTradeStar.disabled = true;
                msg = "BLOCKBUSTER TRADE: You shipped your All-Star for 'future assets'. The city is in shock. +25 Tank Score.";
                break;
        }

        updateState(dTank, dOutrage, dPatience);
        logEvent(msg, dOutrage > 15 ? "bad" : "system");
        
        state.week++;
        if (state.week > 20) {
            checkEndGame(true);
        } else {
            checkEndGame(false);
        }
        render();
    }

    function updateState(dt, do_r, dp) {
        state.tankScore = Math.max(0, Math.min(100, state.tankScore + dt));
        state.outrage = Math.max(0, Math.min(100, state.outrage + do_r));
        state.patience = Math.max(0, Math.min(100, state.patience + dp));
    }

    function logEvent(text, type) {
        const p = document.createElement('p');
        p.className = `log-entry ${type}`;
        p.innerText = `[Week ${state.week}] ${text}`;
        eventLog.prepend(p);
    }

    function render() {
        tankScoreVal.innerText = state.tankScore;
        tankScoreBar.style.width = `${state.tankScore}%`;
        
        outrageVal.innerText = state.outrage;
        outrageBar.style.width = `${state.outrage}%`;
        
        patienceVal.innerText = state.patience;
        patienceBar.style.width = `${state.patience}%`;
        
        weekVal.innerText = Math.min(20, state.week);

        // Bias visual: animate the lottery machine more as tank score goes up
        if (state.tankScore > 50) {
            lotteryMachine.className = 'spinning';
        }
    }

    function checkEndGame(isSeasonOver) {
        if (state.outrage >= 100) {
            triggerGameOver("FIRED!", "Fan outrage hit critical mass. You were chased out of town by a mob with pitchforks. No Cooper Flagg for you.");
            return;
        }
        if (state.patience <= 0) {
            triggerGameOver("TERMINATED", "The Owner lost all patience with 'The Process'. You've been replaced by an AI GM that actually tries to win.");
            return;
        }

        if (isSeasonOver) {
            // Finale mechanic: VIC-16 Finale
            startLotteryFinale();
        }
    }

    function startLotteryFinale() {
        state.isGameOver = true;
        state.isLotteryStarted = true;
        logEvent("SEASON OVER. Entering the Draft Lottery...", "system");
        
        // Disable controls
        btnPlayFair.disabled = true;
        btnLoadManagement.disabled = true;
        btnTradeStar.disabled = true;

        setTimeout(() => {
            // Success depends on Tank Score (Bias mechanic)
            const winProb = state.tankScore / 100;
            const roll = Math.random();
            
            if (roll <= winProb) {
                triggerGameOver("LOTTERY WINNER!", `With a Tank Score of ${state.tankScore}, you secured the #1 Pick! Cooper Flagg is coming to town. You're a genius!`, true);
            } else {
                triggerGameOver("LOTTERY LOSS", `The balls didn't bounce your way. You ended up with the #4 pick. All that tanking for nothing...`, false);
            }
        }, 2000);
    }

    function triggerGameOver(title, message, isWin) {
        state.isGameOver = true;
        endTitle.innerText = title;
        endMessage.innerText = message;
        if (isWin) {
            endTitle.style.color = "#4caf50";
        } else {
            endTitle.style.color = "#C8102E";
        }
        gameOverModal.showModal();
    }
});
