# F1 2026: The Sandbagging Simulator - Implementation Notes

## Overview
This game is a satirical take on the recent F1 2026 technical regulations news, specifically focusing on the reduced cornering speeds, new "Overtake Mode", and the concept of "sandbagging" during testing.

## Mechanics Implemented

### 1. MOV-08 Drift
**Concept:** "Two movement cards... sum represents forward... difference represents sideways."
**Implementation:**
- The car has `Power` (forward speed) and `Grip` (lateral resistance).
- When entering a corner at high speed (high Power), the centrifugal force overcomes Grip.
- If `Force > Grip`, the car loses steering control and slides outwards (`Drift`).
- This forces players to slow down for corners or upgrade their Grip, simulating the "reduced cornering speeds" reported in the news.

### 2. UNC-02 Push-Your-Luck
**Concept:** "Decide between settling for existing gains, or risking them all for further rewards."
**Implementation:**
- The player can activate **Overtake Mode** (Up Arrow) at any time.
- **Reward:** Higher top speed and acceleration.
- **Risk:** Increases `Instability` meter over time.
- If `Instability` reaches 100%, the engine blows up and it's **Game Over**.
- This mimics the "new power unit modes" and the risk of reliability issues mentioned in testing.

### 3. ECO-11 Upgrades
**Concept:** "Assets may be Upgraded to improved versions."
**Implementation:**
- **Sandbags** appear randomly on the track as collectible items.
- Collecting them increases the player's currency.
- Between laps (or via menu), players can spend Sandbags to upgrade:
    - **Grip:** Reduces drifting.
    - **Cooling:** Slows down instability buildup.
    - **Power:** Increases top speed.
- This satirizes the "sandbagging" teams do in testing to hide performance.

## Verification Tests

### Test 1: Drift Physics
- **Scenario:** Car enters a sharp curve (curvature 2) at 200 km/h with base grip.
- **Expected:** Centrifugal force calculates to > 0.8 (base grip), triggering drift state.
- **Result:** **PASS**. Adjusted force multiplier to 0.25 to ensure drift occurs at high speeds.

### Test 2: Push-Your-Luck Risk
- **Scenario:** Player holds Overtake Mode for several seconds.
- **Expected:** Instability meter rises from 0 to > 0.
- **Result:** **PASS**. Instability increases correctly based on Cooling stat.

### Test 3: Upgrades
- **Scenario:** Player collects 5 Sandbags and buys "More Downforce".
- **Expected:** Sandbag count decreases, Grip stat increases.
- **Result:** **PASS**. Validated via test script logic.

## Logic Refinements
- **Physics Tuning:** Initially, the centrifugal force was too weak (0.05 multiplier), allowing the car to rail corners at full speed. Increased to 0.25 to make cornering challenging and force the player to use the brake or lift off.
- **Game Loop:** Added a "rolling resistance" to slow the car down naturally if no input is given, making control smoother.

## How to Play
1. Open `index.html` in a modern browser.
2. Click "Start Engine".
3. Use Arrow Keys to drive.
4. Watch the "Instability" meter when using Overtake Mode (Up Arrow).
5. Collect Sandbags to buy upgrades at the end of each lap.
6. Complete 3 laps to win.
