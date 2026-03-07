// Core Game State
const GAME = {
    revenue: 0,
    stock: 100.0,
    riskLevel: 15, // Starts at 15%
    isRunning: false,
    tasks: [], // Array of DOM elements
    beltSpeed: 1.0, // Multiplier
    baseSpawnRate: 2000,
    lastSpawnTime: 0,
    lastFrameTime: performance.now()
};

// DOM Elements
const DOM = {
    introModal: document.getElementById('game-intro-modal'),
    gameContainer: document.getElementById('game-container'),
    startBtn: document.getElementById('start-btn'),

    revDisplay: document.getElementById('revenue-display'),
    stockDisplay: document.getElementById('stock-display'),
    riskDisplay: document.getElementById('risk-display'),
    riskBar: document.getElementById('risk-bar'),

    beltContainer: document.getElementById('belt-container'),
    workers: document.querySelectorAll('.worker'),

    endScreen: document.getElementById('end-screen'),
    endTitle: document.getElementById('end-title'),
    endMsg: document.getElementById('end-message'),
    restartBtn: document.getElementById('restart-btn')
};

// Initialization
function init() {
    DOM.introModal.showModal();
    DOM.gameContainer.classList.add('blurred');

    DOM.startBtn.addEventListener('click', () => {
        DOM.introModal.close();
        DOM.gameContainer.classList.remove('blurred');
        startGame();
    });

    DOM.restartBtn.addEventListener('click', () => {
        location.reload();
    });

    setupDragAndDrop();
}

function startGame() {
    GAME.isRunning = true;
    GAME.lastFrameTime = performance.now();
    requestAnimationFrame(gameLoop);
}

// --- Drag and Drop & Click Logic (WPL-01: Worker Placement) ---
function setupDragAndDrop() {
    let draggedWorker = null;

    // Click-to-Deploy fallback for better accessibility
    const humanZone = document.getElementById('human-zone');
    const aiZone = document.getElementById('ai-zone');

    humanZone.addEventListener('click', () => deployWorkerToOldestTask('human'));
    aiZone.addEventListener('click', () => deployWorkerToOldestTask('ai'));

    DOM.workers.forEach(w => {
        w.addEventListener('dragstart', (e) => {
            if (!GAME.isRunning) return;
            draggedWorker = e.target;
            e.dataTransfer.setData('text/plain', e.target.dataset.type);
            setTimeout(() => e.target.style.opacity = '0.5', 0);
        });

        w.addEventListener('dragend', (e) => {
            e.target.style.opacity = '1';
            draggedWorker = null;

            // Clean up hover classes from all tasks
            document.querySelectorAll('.task').forEach(t => {
                t.classList.remove('drag-over', 'ai-hover');
            });
        });
    });

    // Make the belt area handle the drops onto dynamically spawned tasks
    DOM.beltContainer.addEventListener('dragover', (e) => {
        e.preventDefault(); // Necessary to allow dropping

        const taskNode = e.target.closest('.task');
        if (taskNode && !taskNode.classList.contains('processing')) {
            taskNode.classList.add('drag-over');
            if (draggedWorker && draggedWorker.dataset.type === 'ai') {
                taskNode.classList.add('ai-hover');
            }
        }
    });

    DOM.beltContainer.addEventListener('dragleave', (e) => {
        const taskNode = e.target.closest('.task');
        if (taskNode) {
            taskNode.classList.remove('drag-over', 'ai-hover');
        }
    });

    DOM.beltContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!GAME.isRunning) return;

        const taskNode = e.target.closest('.task');
        if (!taskNode || taskNode.classList.contains('processing')) return;

        taskNode.classList.remove('drag-over', 'ai-hover');

        const workerType = e.dataTransfer.getData('text/plain');
        if (workerType) {
            handleTaskAssignment(taskNode, workerType, draggedWorker);
        }
    });
}

function deployWorkerToOldestTask(workerType) {
    if (!GAME.isRunning) return;

    // Find oldest non-processing task
    const taskObj = GAME.tasks.find(t => !t.element.classList.contains('processing'));
    if (!taskObj) return;

    // Find available worker element
    const workerPool = document.querySelectorAll(`.worker[data-type="${workerType}"]`);
    let availableWorker = null;
    for (const w of workerPool) {
        if (w.style.visibility !== 'hidden') {
            availableWorker = w;
            break;
        }
    }

    if (!availableWorker && workerType === 'human') return; // no humans available
    if (!availableWorker) availableWorker = workerPool[0]; // fallback for AI

    handleTaskAssignment(taskObj.element, workerType, availableWorker);
}

function handleTaskAssignment(taskNode, workerType, workerElement) {
    const isFire = taskNode.classList.contains('fire-task');

    if (workerType === 'human') {
        // Humans take 2 seconds but never fail. They are required to fix fires.
        taskNode.classList.add('processing');
        taskNode.innerText = "⏳ Processing...";

        // Hide worker from pool temporarily
        workerElement.style.visibility = 'hidden';

        setTimeout(() => {
            if (!GAME.isRunning) return;
            // Complete Task
            workerElement.style.visibility = 'visible';
            completeTask(taskNode, isFire ? 500 : 1000);
        }, 2000);

    } else if (workerType === 'ai') {
        // AI is instant but triggers UNC-02 Push-Your-Luck
        if (isFire) {
            // AI cannot fix fires! Causes immediate stock damage.
            updateStats({ stock: -5.0 });
            return;
        }

        const rollObj = Math.random() * 100;
        if (rollObj < GAME.riskLevel) {
            // HALLUCINATION TRIGGERED
            triggerHallucination(taskNode);
        } else {
            // SUCCESS
            completeTask(taskNode, 2000); // AI yields double money
            updateStats({ risk: 2 }); // Using AI permanently increases risk base
        }
    }
}

// --- Task Spawning & Completion ---
const TASK_NAMES = ['Code Review', 'DB Migration', 'Client Support', 'Sprint Planning'];

function spawnTask(isFire = false) {
    const task = document.createElement('div');
    task.classList.add('task');
    if (isFire) task.classList.add('fire-task');

    task.innerText = isFire ? "🔥 Server Crash 🔥" : TASK_NAMES[Math.floor(Math.random() * TASK_NAMES.length)];

    // Initial position logic (MOV-14 Bias)
    task.style.left = '-150px';
    task.style.top = `${Math.floor(Math.random() * 60) + 10}%`; // Random vertical spread

    DOM.beltContainer.appendChild(task);
    GAME.tasks.push({ element: task, rawLeft: -150 });
}

function completeTask(taskNode, revYield) {
    const idx = GAME.tasks.findIndex(t => t.element === taskNode);
    if (idx > -1) GAME.tasks.splice(idx, 1);

    taskNode.classList.add('fly-away');
    taskNode.innerText = `+ $${revYield}`;
    updateStats({ rev: revYield });

    setTimeout(() => {
        if (taskNode.parentElement) {
            taskNode.parentElement.removeChild(taskNode);
        }
    }, 500);
}

function triggerHallucination(sourceTaskNode) {
    // Punish player visually
    const idx = GAME.tasks.findIndex(t => t.element === sourceTaskNode);
    if (idx > -1) GAME.tasks.splice(idx, 1);

    const xPos = sourceTaskNode.style.left;
    const yPos = sourceTaskNode.style.top;
    sourceTaskNode.parentElement.removeChild(sourceTaskNode);

    updateStats({ stock: -2.0, risk: -3 }); // Risk drops slightly as AI "learns" from mistake

    // Spawn 2 Fire Tasks nearby
    for (let i = 0; i < 2; i++) {
        spawnTask(true);
        const newRendered = GAME.tasks[GAME.tasks.length - 1];
        newRendered.rawLeft = parseInt(xPos, 10) - (Math.random() * 50);
        newRendered.element.style.left = `${newRendered.rawLeft}px`;
        newRendered.element.style.top = `calc(${yPos} + ${i === 0 ? '-40px' : '40px'})`;
    }
}

// --- Main Loop & UI ---
function updateStats(mods) {
    if (mods.rev) GAME.revenue += mods.rev;
    if (mods.stock) GAME.stock += mods.stock;
    if (mods.risk) GAME.riskLevel = Math.max(5, Math.min(95, GAME.riskLevel + mods.risk)); // Clamp 5-95%

    // Scale belt speed based on revenue (Difficulty Scaling)
    GAME.beltSpeed = 1.0 + (GAME.revenue / 10000);

    DOM.revDisplay.innerText = `$${GAME.revenue.toLocaleString()}`;
    DOM.stockDisplay.innerText = `$${GAME.stock.toFixed(2)}`;
    DOM.riskDisplay.innerText = `${GAME.riskLevel}%`;
    DOM.riskBar.style.width = `${GAME.riskLevel}%`;

    // Immediate Sequential Checking
    checkGameOver();
}

function checkGameOver() {
    if (!GAME.isRunning) return;

    if (GAME.stock <= 0) {
        endGame(false);
    } else if (GAME.revenue >= 50000) {
        endGame(true);
    }
}

function endGame(isWin) {
    GAME.isRunning = false;
    DOM.gameContainer.classList.add('blurred');
    DOM.endScreen.classList.remove('hidden');

    if (isWin) {
        DOM.endTitle.innerText = "PARACHUTE DEPLOYED";
        DOM.endTitle.style.background = "linear-gradient(to right, #10b981, #3b82f6)";
        DOM.endTitle.style.webkitBackgroundClip = "text";
        DOM.endTitle.style.webkitTextFillColor = "transparent";
        DOM.endMsg.innerText = `You squeezed $${GAME.revenue.toLocaleString()} out of the company before it collapsed! The board loves your 'AI restructuring' philosophy.`;
    } else {
        DOM.endTitle.innerText = "YOU'RE FIRED";
        DOM.endTitle.style.background = "linear-gradient(to right, #ef4444, #f59e0b)";
        DOM.endTitle.style.webkitBackgroundClip = "text";
        DOM.endTitle.style.webkitTextFillColor = "transparent";
        DOM.endMsg.innerText = `The board lost all faith as operations gridlocked. Stock plummeted to zero.`;
    }
}

function gameLoop(timestamp) {
    if (!GAME.isRunning) return;

    const dt = timestamp - GAME.lastFrameTime;
    GAME.lastFrameTime = timestamp;

    // Spawning logic
    if (timestamp - GAME.lastSpawnTime > (GAME.baseSpawnRate / GAME.beltSpeed)) {
        spawnTask();
        GAME.lastSpawnTime = timestamp;
    }

    // Translation (MOV-14 Bias)
    const beltWidth = DOM.beltContainer.offsetWidth;
    const pxPerSec = 70 * GAME.beltSpeed;
    const moveDist = (pxPerSec * dt) / 1000;

    for (let i = GAME.tasks.length - 1; i >= 0; i--) {
        const obj = GAME.tasks[i];
        if (obj.element.classList.contains('processing')) continue;

        obj.rawLeft += moveDist;
        obj.element.style.left = `${obj.rawLeft}px`;

        // If it crosses the deadline (approx full width)
        if (obj.rawLeft > beltWidth - 40) {
            // Task failed
            const isFire = obj.element.classList.contains('fire-task');
            updateStats({ stock: isFire ? -5.0 : -0.5 });

            // Remove DOM and track array
            obj.element.parentElement.removeChild(obj.element);
            GAME.tasks.splice(i, 1);
        }
    }

    requestAnimationFrame(gameLoop);
}

// Start
init();
