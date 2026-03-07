const PROSPECTS_POOL = [
    { name: "Fernando Mendoza", description: "The 'Mendoza' Era QB. Elite arm, high risk.", basePower: 50, bustRisk: 0.4, tier: "S" },
    { name: "Ty Simpson", description: "Nicknamed 'Bryce Nix'. Dual threat, erratic decisions.", basePower: 45, bustRisk: 0.35, tier: "S" },
    { name: "Jeremiyah Love", description: "Lone S-Tier RB. Explosive and reliable.", basePower: 48, bustRisk: 0.1, tier: "S" },
    { name: "Mike Washington", description: "Physical runner with RB1 upside.", basePower: 30, bustRisk: 0.2, tier: "A" },
    { name: "Taylen Green", description: "High-risk, high-reward profile.", basePower: 35, bustRisk: 0.25, tier: "A" },
    { name: "Colston Loveland", description: "Elite Tight End prospect.", basePower: 25, bustRisk: 0.05, tier: "B" },
    { name: "Demond Claiborne", description: "Reliable role player.", basePower: 15, bustRisk: 0.05, tier: "B" },
    { name: "Seth McGowan", description: "Power runner, limited upside.", basePower: 10, bustRisk: 0.02, tier: "C" },
    { name: "Adam Randall", description: "WR/RB hybrid, lacks speed.", basePower: 8, bustRisk: 0.01, tier: "C" },
    { name: "Khalil Shakir", description: "Evolved role, steady production.", basePower: 12, bustRisk: 0.03, tier: "B" }
];

class Game {
    constructor() {
        this.draftCapital = 3.0;
        this.teamPower = 0;
        this.currentRound = 1;
        this.roster = [];
        this.currentPool = [];
        this.selectedProspect = null;
        this.priority = 3; // 1, 2, or 3
        this.phase = 'AUCTION'; // AUCTION, DRAFT, SCOUT, RESOLVE

        this.initElements();
        this.attachListeners();
    }

    initElements() {
        this.el = {
            capital: document.getElementById('draft-capital'),
            power: document.getElementById('team-power'),
            round: document.getElementById('current-round'),
            phaseContent: document.getElementById('phase-content'),
            rosterList: document.getElementById('roster-list'),
            actionBar: document.getElementById('action-bar'),
            introModal: document.getElementById('game-intro-modal'),
            overModal: document.getElementById('game-over-modal'),
            startBtn: document.getElementById('start-game-btn')
        };
    }

    attachListeners() {
        this.el.startBtn.onclick = () => {
            this.el.introModal.close();
            this.startRound();
        };
    }

    updateStats() {
        this.el.capital.textContent = this.draftCapital.toFixed(1);
        this.el.power.textContent = Math.round(this.teamPower);
        this.el.round.textContent = this.currentRound;

        if (this.teamPower < -50) this.endGame("FIRED!", "The owner has seen enough. Your 'Mendoza Era' was a disaster.");
        if (this.draftCapital < 0) this.endGame("BANKRUPT!", "You traded away the team's entire future. You're out.");
    }

    startRound() {
        this.phase = 'AUCTION';
        this.priority = 3;
        this.selectedProspect = null;
        this.renderAuction();
        this.updateStats();
    }

    renderAuction() {
        this.el.phaseContent.innerHTML = `
            <h2>Phase 1: Priority Auction</h2>
            <p>Bid your First-Round picks to secure an earlier draft slot. Earlier slots see more S-Tier prospects.</p>
            <div class="auction-options">
                <div class="prospect-card" onclick="game.setPriority(1, 0.8)">
                    <h3>1st Priority</h3>
                    <p>Cost: 0.8 Capital</p>
                    <small>Full access to the board.</small>
                </div>
                <div class="prospect-card" onclick="game.setPriority(2, 0.3)">
                    <h3>2nd Priority</h3>
                    <p>Cost: 0.3 Capital</p>
                    <small>Some top prospects may be taken.</small>
                </div>
                <div class="prospect-card" onclick="game.setPriority(3, 0)">
                    <h3>3rd Priority</h3>
                    <p>Cost: Free</p>
                    <small>Scraps only.</small>
                </div>
            </div>
        `;
        this.el.actionBar.innerHTML = '';
    }

    setPriority(p, cost) {
        if (this.draftCapital < cost) {
            alert("Not enough Draft Capital!");
            return;
        }
        this.priority = p;
        this.draftCapital -= cost;
        this.phase = 'DRAFT';
        this.generatePool();
        this.renderDraft();
        this.updateStats();
    }

    generatePool() {
        // Shuffle and slice based on priority
        let pool = [...PROSPECTS_POOL].sort(() => Math.random() - 0.5);
        if (this.priority === 1) {
            this.currentPool = pool.slice(0, 6);
        } else if (this.priority === 2) {
            // Remove 2 random S-tiers if available
            this.currentPool = pool.filter(p => p.tier !== 'S' || Math.random() > 0.4).slice(0, 5);
        } else {
            // Mostly B and C tiers
            this.currentPool = pool.filter(p => p.tier !== 'S').slice(0, 4);
        }
    }

    renderDraft() {
        this.el.phaseContent.innerHTML = `
            <h2>Phase 2: The Draft</h2>
            <p>Select a prospect to join your roster.</p>
            <div id="draft-grid"></div>
        `;
        const grid = document.getElementById('draft-grid');
        this.currentPool.forEach(p => {
            const card = document.createElement('div');
            card.className = 'prospect-card';
            card.innerHTML = `
                <span class="tier tier-${p.tier}">${p.tier}</span>
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <small>Est. Power: ${p.basePower}</small>
            `;
            card.onclick = () => this.selectProspect(p, card);
            grid.appendChild(card);
        });

        this.el.actionBar.innerHTML = `
            <button id="draft-btn" class="primary-btn" disabled onclick="game.confirmDraft()">Draft Selected</button>
        `;
    }

    selectProspect(p, card) {
        this.selectedProspect = p;
        document.querySelectorAll('.prospect-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        document.getElementById('draft-btn').disabled = false;
    }

    confirmDraft() {
        this.phase = 'SCOUT';
        this.renderScout();
    }

    renderScout() {
        this.el.phaseContent.innerHTML = `
            <h2>Phase 3: Push-Your-Luck Scouting</h2>
            <div class="scout-dashboard">
                <div class="prospect-card selected">
                    <span class="tier tier-${this.selectedProspect.tier}">${this.selectedProspect.tier}</span>
                    <h3>Drafting: ${this.selectedProspect.name}</h3>
                </div>
                <div class="scout-actions">
                    <p>Do you want to play it safe or dig deeper into the reports?</p>
                </div>
            </div>
        `;
        this.el.actionBar.innerHTML = `
            <button class="primary-btn" onclick="game.scoutDeep()">Deep Scouting (Risk 0.1 Capital)</button>
            <button class="primary-btn" onclick="game.resolveDraft()">Lock it In</button>
        `;
    }

    scoutDeep() {
        if (this.draftCapital < 0.1) return;
        this.draftCapital -= 0.1;
        this.updateStats();

        // Push your luck: chance to reveal bust or increase power
        const roll = Math.random();
        if (roll < 0.3) {
            alert(`BREAKING NEWS: Internal reports suggest ${this.selectedProspect.name} might have 'maturity issues'. Bust Risk increased!`);
            this.selectedProspect.bustRisk += 0.1;
        } else if (roll > 0.7) {
            alert(`EXCELLENT SCOUTING: You found hidden tape. ${this.selectedProspect.name} looks like a generational talent! Power increased.`);
            this.selectedProspect.basePower += 10;
        } else {
            alert("Nothing new found. Scouts are just eating donuts.");
        }
        this.renderScout();
    }

    resolveDraft() {
        const p = this.selectedProspect;
        const isBust = Math.random() < p.bustRisk;
        const finalPower = isBust ? -p.basePower : p.basePower;

        this.roster.push({ ...p, finalPower, isBust });
        this.teamPower += finalPower;

        this.renderResolution(isBust);
    }

    renderResolution(isBust) {
        this.phase = 'RESOLVE';
        const p = this.selectedProspect;
        this.el.phaseContent.innerHTML = `
            <h2 class="${isBust ? 'bust' : ''}">${isBust ? 'BUSTED!' : 'SUCCESS!'}</h2>
            <p>${p.name} ${isBust ? 'failed to adjust to the pro level.' : 'is an immediate impact player!'}</p>
            <p>Power Change: ${isBust ? '-' : '+'}${p.basePower}</p>
        `;

        this.renderRoster();
        this.updateStats();

        this.el.actionBar.innerHTML = `
            <button class="primary-btn" onclick="game.nextStep()">
                ${this.currentRound < 3 ? 'Next Round' : 'See Final Results'}
            </button>
        `;
    }

    renderRoster() {
        this.el.rosterList.innerHTML = this.roster.map(p => `
            <div class="prospect-card ${p.isBust ? 'bust' : ''}">
                <span class="tier tier-${p.tier}">${p.tier}</span>
                <strong>${p.name}</strong>: ${p.isBust ? 'BUST' : '+' + p.finalPower}
            </div>
        `).join('');
    }

    nextStep() {
        if (this.currentRound < 3) {
            this.currentRound++;
            this.startRound();
        } else {
            this.checkVictory();
        }
    }

    checkVictory() {
        if (this.teamPower >= 100) {
            this.endGame("SUPER BOWL BOUND!", `Total Team Power: ${this.teamPower}. You've built a dynasty! Mendoza would be proud.`);
        } else if (this.teamPower >= 50) {
            this.endGame("PLAYOFF CONTENDER", `Total Team Power: ${this.teamPower}. A solid draft. You'll keep your job... for now.`);
        } else {
            this.endGame("DRAFT FAILURE", `Total Team Power: ${this.teamPower}. The fans are calling for your head. Better luck next year.`);
        }
    }

    endGame(title, message) {
        document.getElementById('game-over-title').textContent = title;
        document.getElementById('game-over-message').textContent = message;
        document.getElementById('final-stats').innerHTML = `
            <p>Final Team Power: ${this.teamPower}</p>
            <p>Remaining Capital: ${this.draftCapital.toFixed(1)}</p>
        `;
        this.el.overModal.showModal();
    }
}

const game = new Game();
window.game = game;
