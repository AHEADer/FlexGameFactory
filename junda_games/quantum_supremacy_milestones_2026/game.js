// Game State
let distance = 0;
let entropy = 0;
let speed = 50; // base speed in qm/s
let targetDistance = 1000;
let isGameOver = false;
let isStarted = false;
let trackOffset = 0;

// Elements
const distanceVal = document.getElementById('distance-val');
const distanceBar = document.getElementById('distance-bar');
const entropyVal = document.getElementById('entropy-val');
const entropyBar = document.getElementById('entropy-bar');
const speedVal = document.getElementById('speed-val');
const trackLines = document.getElementById('track-lines');
const introModal = document.getElementById('game-intro-modal');
const endModal = document.getElementById('game-over-modal');
const endTitle = document.getElementById('end-title');
const endMsg = document.getElementById('end-msg');
const pulseBtn = document.getElementById('pulse-btn');
const startBtn = document.getElementById('start-btn');

// Start Game
startBtn.addEventListener('click', () => {
    introModal.close();
    isStarted = true;
    requestAnimationFrame(gameLoop);
});

// Pulse Action (Push-Your-Luck)
function pulse() {
    if (!isStarted || isGameOver) return;

    // Check for Decoherence (Bust)
    if (entropy > 70) {
        const bustChance = (entropy - 70) * 0.03; 
        if (Math.random() < bustChance) {
            gameOver(false, "Decoherence! Your wave function collapsed due to extreme entropy.");
            return;
        }
    }

    // Apply Pulse
    speed += 40;
    entropy += Math.random() * 15 + 10;
    if (entropy > 100) entropy = 100;

    // Visual feedback
    pulseBtn.style.transform = "scale(0.9)";
    setTimeout(() => pulseBtn.style.transform = "scale(1)", 100);
}

pulseBtn.addEventListener('click', pulse);
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        pulse();
    }
});

function gameOver(win, message) {
    isGameOver = true;
    endTitle.innerText = win ? "SUPREMACY ACHIEVED!" : "DECOHERENCE!";
    endTitle.style.color = win ? "var(--neon-blue)" : "var(--neon-orange)";
    endMsg.innerText = message + ` Final distance: ${Math.floor(distance)}qm.`;
    endModal.showModal();
}

function gameLoop() {
    if (!isStarted || isGameOver) return;

    // 1. Bias Movement (MOV-14)
    // Base speed increases slowly (Difficulty Scaling)
    speed += 0.01; 
    
    // Entropy decays slowly
    entropy -= 0.15;
    if (entropy < 0) entropy = 0;

    // Pulse Speed decays quickly back to base
    let minSpeed = 50 + (distance / 20);
    if (speed > minSpeed) {
        speed -= 0.5;
    } else {
        speed = minSpeed;
    }

    // Update Distance
    distance += speed / 60; // 60 fps
    
    // 2. Race Check (VIC-07)
    if (distance >= targetDistance) {
        distance = targetDistance;
        gameOver(true, "Absolute Supremacy! You reached 1,000qm in record quantum time.");
    }

    // Update UI
    distanceVal.innerText = Math.floor(distance).toLocaleString();
    const distPercent = (distance / targetDistance) * 100;
    distanceBar.style.width = distPercent + "%";

    entropyVal.innerText = Math.floor(entropy);
    entropyBar.style.width = entropy + "%";
    
    speedVal.innerText = speed.toFixed(1);

    // Track Animation
    trackOffset += speed * 0.1;
    trackLines.style.backgroundPosition = `0px ${trackOffset}px`;

    requestAnimationFrame(gameLoop);
}
