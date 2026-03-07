const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Game State
const state = {
    running: false,
    paused: false,
    gameOver: false,
    lap: 1,
    maxLaps: 3,
    startTime: 0,
    elapsedTime: 0,
    sandbags: 0,
    
    // Car Physics
    car: {
        x: 0, // 0 is center, -1 is left edge, 1 is right edge (normalized track width)
        speed: 0, // km/h
        maxSpeed: 300,
        acceleration: 0.5,
        braking: 1.0,
        grip: 0.8, // Resistance to drift
        drift: 0, // Current lateral slide momentum
        instability: 0, // 0-100%
        mode: 'NORMAL', // NORMAL, OVERTAKE
        distance: 0, // Total distance traveled
        segmentIndex: 0 // Current track segment
    },

    // Track
    track: [],
    trackLength: 0,
    segmentLength: 200, // Length of one segment
    cameraDepth: 0.8, // How high camera is
    roadWidth: 2000,
    
    // Upgrades
    stats: {
        gripLevel: 1,
        coolingLevel: 1,
        powerLevel: 1
    },

    // Objects on track
    objects: []
};

// Controls
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false
};

// Constants
const MODES = {
    NORMAL: { name: 'NORMAL', color: '#fff', maxSpeedMult: 1.0, heatGen: 0, gripMult: 1.0 },
    OVERTAKE: { name: 'OVERTAKE', color: '#ff1801', maxSpeedMult: 1.3, heatGen: 0.3, gripMult: 0.6 }
};

// Audio Mockup (Visual only for now)
function playSound(type) {
    // In a real game, this would play audio
    // For satire, we'll flash text
    if (type === 'engine_weird') {
        showMessage("Engine making weird noises...", 1000);
    }
}

function showMessage(text, duration = 2000) {
    const el = document.getElementById('message-area');
    el.innerText = text;
    setTimeout(() => {
        if (el.innerText === text) el.innerText = '';
    }, duration);
}

// Track Generation
function generateTrack() {
    state.track = [];
    const addStraight = (num) => {
        for(let i=0; i<num; i++) state.track.push({ curve: 0, y: 0 });
    };
    const addCurve = (num, curve) => {
        for(let i=0; i<num; i++) state.track.push({ curve: curve, y: 0 });
    };

    // Lap layout
    addStraight(50);
    addCurve(50, 2); // Hard Right
    addStraight(30);
    addCurve(50, -2); // Hard Left
    addStraight(20);
    addCurve(30, 1); // Soft Right
    addStraight(50);
    addCurve(40, -3); // Hairpin Left
    addStraight(100); // Long straight (for overtake mode)

    state.trackLength = state.track.length * state.segmentLength;

    // Generate Sandbags
    state.objects = [];
    for (let i = 0; i < 20; i++) {
        const segIdx = Math.floor(Math.random() * state.track.length);
        state.objects.push({
            segmentIndex: segIdx,
            offset: (Math.random() * 1.6) - 0.8, // Random lateral position
            type: 'sandbag',
            collected: false
        });
    }
}

// Game Loop
function update(dt) {
    if (!state.running || state.paused || state.gameOver) return;

    // Time
    state.elapsedTime = (Date.now() - state.startTime) / 1000;
    document.getElementById('time-display').innerText = formatTime(state.elapsedTime);

    // Input Handling & Mode Switching
    if (keys.ArrowUp) {
        state.car.mode = 'OVERTAKE';
    } else {
        state.car.mode = 'NORMAL';
    }
    
    const mode = MODES[state.car.mode];

    // Physics - Speed
    const targetSpeed = state.car.maxSpeed * mode.maxSpeedMult * state.stats.powerLevel; // Simple multiplier
    if (keys.ArrowUp) {
        state.car.speed += state.car.acceleration * (state.car.speed < targetSpeed ? 1 : 0);
    } else if (keys.ArrowDown) {
        state.car.speed -= state.car.braking * 2;
    } else {
        state.car.speed -= 0.2; // Rolling resistance
    }
    state.car.speed = Math.max(0, Math.min(state.car.speed, targetSpeed));

    // Physics - Instability (Push Your Luck)
    if (state.car.mode === 'OVERTAKE') {
        state.car.instability += mode.heatGen * (1.0 / state.stats.coolingLevel);
        if (Math.random() < 0.01) playSound('engine_weird');
    } else {
        state.car.instability -= 0.5; // Cool down
    }
    state.car.instability = Math.max(0, Math.min(100, state.car.instability));

    if (state.car.instability >= 100) {
        gameOver("ENGINE BLOWN! Too much Overtake Mode.");
        return;
    }

    // Physics - Movement & Drift
    const currentSegment = state.track[Math.floor(state.car.distance / state.segmentLength) % state.track.length];
    const curvature = currentSegment.curve;
    
    // Centrifugal force
    // Higher speed + tighter curve = more force pushing car outward
    const centrifugalForce = (curvature * (state.car.speed / 100)) * 0.25;
    
    // Steering
    let steering = 0;
    if (keys.ArrowLeft) steering = -0.05;
    if (keys.ArrowRight) steering = 0.05;

    // Grip Check (MOV-08 Drift adaptation)
    // If speed is too high for grip, steering becomes less effective and car slides
    const gripLimit = state.car.grip * mode.gripMult * state.stats.gripLevel;
    const currentLoad = Math.abs(centrifugalForce);
    
    let lateralMove = steering;
    
    if (currentLoad > gripLimit) {
        // Drifting! Steering is reduced, sliding is increased
        state.car.drift += centrifugalForce * 0.1; // Slide outward
        showMessage("DRIFTING!", 100);
        lateralMove = steering * 0.2; // Loss of steering control
    } else {
        state.car.drift *= 0.9; // Regain control
    }

    state.car.x += lateralMove + state.car.drift - centrifugalForce;
    
    // Clamp X (Track limits)
    if (state.car.x < -1.2 || state.car.x > 1.2) {
        state.car.speed *= 0.9; // Grass slows you down
        state.car.instability += 0.1;
    }

    // Move forward
    state.car.distance += (state.car.speed / 3.6) * 0.5; // Scale speed to distance
    state.car.segmentIndex = Math.floor(state.car.distance / state.segmentLength) % state.track.length;

    // Lap Count
    const totalDist = state.trackLength;
    if (state.car.distance >= totalDist * state.lap) {
        state.lap++;
        if (state.lap > state.maxLaps) {
            gameOver("VICTORY! You survived the 2026 regulations!", true);
            return;
        }
        showMessage("LAP " + state.lap);
        // Show upgrade menu every lap
        openUpgradeMenu();
    }

    // Object Collision (Sandbags)
    state.objects.forEach(obj => {
        if (!obj.collected && obj.segmentIndex === state.car.segmentIndex) {
            if (Math.abs(obj.offset - state.car.x) < 0.3) { // Hitbox
                obj.collected = true;
                state.sandbags++;
                showMessage("+1 SANDBAG");
            }
        }
    });

    // Update HUD
    document.getElementById('speed-display').innerText = Math.floor(state.car.speed);
    document.getElementById('instability-fill').style.width = state.car.instability + '%';
    document.getElementById('mode-display').innerText = state.car.mode;
    document.getElementById('mode-display').className = 'value mode-' + state.car.mode.toLowerCase();
    document.getElementById('lap-display').innerText = `${state.lap}/${state.maxLaps}`;
    document.getElementById('sandbag-display').innerText = state.sandbags;
}

function draw() {
    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Perspective Projection
    const maxLines = 100;
    const startPos = state.car.distance;
    const baseSegment = state.track[Math.floor(startPos / state.segmentLength) % state.track.length];
    
    let x = 0;
    let dx = 0;
    let playerY = 0;

    // Draw Track
    for (let n = 0; n < maxLines; n++) {
        const segIdx = (Math.floor(startPos / state.segmentLength) + n) % state.track.length;
        const segment = state.track[segIdx];
        
        // Accumulate curves
        x += dx;
        dx += segment.curve;
        
        // Projection math
        const z = n * state.segmentLength; // Distance from camera
        const scale = 200 / (200 + z); // Perspective scale
        
        // Screen Y (bottom to top)
        const screenY = canvas.height / 2 + (canvas.height / 2) * (1 - scale * 4); // Fake horizon
        
        // We actually want to draw from bottom up, but painters algorithm is easier back-to-front
        // To do back-to-front, we start loop from maxLines-1 down to 0
        // Let's redo loop
    }
    
    // Better Draw Loop (Painters Algo)
    let camX = state.car.x * state.roadWidth; // Player lateral offset
    let curveAccum = 0;
    let dx2 = 0;

    // Find current curve amount for camera rotation effect
    for (let i=0; i<30; i++) {
         const segIdx = (Math.floor(startPos / state.segmentLength) + i) % state.track.length;
         curveAccum += state.track[segIdx].curve;
    }

    for (let n = maxLines; n > 0; n--) {
        const segIdx = (Math.floor(startPos / state.segmentLength) + n) % state.track.length;
        const segment = state.track[segIdx];
        
        // Calculate relative position
        const z = n * 50; // Arbitrary Z depth step
        const scale = 150 / (150 + z);
        const centerY = canvas.height / 2 + 20;
        
        // Curve offset calculation (simplified)
        // We look ahead to determine curve
        let curveOffset = 0;
        for(let j=0; j<n; j++) {
            const lIdx = (Math.floor(startPos / state.segmentLength) + j) % state.track.length;
            curveOffset += state.track[lIdx].curve;
        }
        
        // Screen coords
        const w = canvas.width * scale * 2;
        const screenX = canvas.width / 2 - (curveOffset * scale * 100) - (state.car.x * w * 0.5);
        const screenY = centerY + (scale * canvas.height * 0.4);
        
        // Previous segment coords (for polygon filling)
        // (Skipping full polygon fill for simplicity, just drawing rects/lines)
        
        // Draw Grass
        ctx.fillStyle = (Math.floor(segIdx / 5) % 2) ? '#113311' : '#114411';
        ctx.fillRect(0, screenY, canvas.width, 10); // Simplified horizon strips
        
        // Draw Road
        ctx.fillStyle = (Math.floor(segIdx / 3) % 2) ? '#333' : '#3a3a3a';
        ctx.fillRect(screenX - w/2, screenY, w, 4 * n/10 + 2); // Height grows closer
        
        // Kerbs
        const kerbW = w * 0.05;
        ctx.fillStyle = (Math.floor(segIdx / 2) % 2) ? '#ff0000' : '#ffffff';
        ctx.fillRect(screenX - w/2 - kerbW, screenY, kerbW, 5);
        ctx.fillRect(screenX + w/2, screenY, kerbW, 5);

        // Draw Objects (Sandbags)
        state.objects.forEach(obj => {
            if (!obj.collected && obj.segmentIndex === segIdx) {
                const objX = screenX + (obj.offset * w * 0.5);
                const objScale = scale * 40;
                ctx.font = `${objScale}px Arial`;
                ctx.fillText('💰', objX - objScale/2, screenY);
            }
        });
    }

    // Draw Car
    const carY = canvas.height - 100;
    const carX = canvas.width / 2;
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(carX, carY + 10, 40, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = state.car.mode === 'OVERTAKE' ? '#ff3333' : '#00d2be';
    // Shake car if drifting or unstable
    const shake = (state.car.drift * 20) + (state.car.instability > 50 ? Math.random() * 5 : 0);
    
    ctx.fillRect(carX - 20 + shake, carY - 40, 40, 60);
    
    // Wheels
    ctx.fillStyle = '#111';
    ctx.fillRect(carX - 25 + shake, carY - 35, 8, 15); // FL
    ctx.fillRect(carX + 17 + shake, carY - 35, 8, 15); // FR
    ctx.fillRect(carX - 28 + shake, carY - 10, 10, 20); // RL
    ctx.fillRect(carX + 18 + shake, carY - 10, 10, 20); // RR

    // Wing
    ctx.fillStyle = '#fff';
    ctx.fillRect(carX - 22 + shake, carY - 45, 44, 5);

    // Drifting particles
    if (Math.abs(state.car.drift) > 0.02) {
        ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
        for(let i=0; i<3; i++) {
            ctx.beginPath();
            ctx.arc(carX - 25 + (Math.random()*10), carY + (Math.random()*10), Math.random()*5, 0, Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(carX + 25 + (Math.random()*10), carY + (Math.random()*10), Math.random()*5, 0, Math.PI*2);
            ctx.fill();
        }
    }
}

function loop() {
    update(1/60);
    draw();
    requestAnimationFrame(loop);
}

// Helpers
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function gameOver(msg, win = false) {
    state.gameOver = true;
    state.running = false;
    alert(`${msg}\nTime: ${formatTime(state.elapsedTime)}\nSandbags: ${state.sandbags}`);
    location.reload();
}

function openUpgradeMenu() {
    state.paused = true;
    document.getElementById('upgrade-menu').classList.remove('hidden');
    updateUpgradeButtons();
}

function closeUpgradeMenu() {
    state.paused = false;
    document.getElementById('upgrade-menu').classList.add('hidden');
}

function updateUpgradeButtons() {
    const btns = document.querySelectorAll('.upgrade-btn');
    btns.forEach(btn => {
        const cost = parseInt(btn.dataset.cost);
        btn.disabled = state.sandbags < cost;
    });
}

function buyUpgrade(type, cost) {
    if (state.sandbags >= cost) {
        state.sandbags -= cost;
        if (type === 'grip') state.stats.gripLevel += 0.2;
        if (type === 'cooling') state.stats.coolingLevel += 0.2;
        if (type === 'power') state.stats.powerLevel += 0.1;
        
        showMessage("UPGRADED: " + type.toUpperCase());
        updateUpgradeButtons();
        document.getElementById('sandbag-display').innerText = state.sandbags;
    }
}

// Init
window.addEventListener('load', () => {
    canvas.width = document.getElementById('game-container').offsetWidth;
    canvas.height = document.getElementById('game-container').offsetHeight;
    
    generateTrack();
    
    // Intro Modal
    document.getElementById('start-game-btn').addEventListener('click', () => {
        document.getElementById('game-intro-modal').close();
        state.running = true;
        state.startTime = Date.now();
        loop();
    });

    // Keys
    window.addEventListener('keydown', e => {
        if(keys.hasOwnProperty(e.code)) keys[e.code] = true;
    });
    window.addEventListener('keyup', e => {
        if(keys.hasOwnProperty(e.code)) keys[e.code] = false;
    });

    // Upgrade UI
    document.getElementById('resume-btn').addEventListener('click', closeUpgradeMenu);
    document.querySelectorAll('.upgrade-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            buyUpgrade(btn.dataset.type, parseInt(btn.dataset.cost));
        });
    });
});
