---
name: Generate News-Based Game
description: A workflow to analyze a news report, select game mechanics from a documented structure, and develop a satirical web game based on the findings.
---

# Generate News-Based Game

This skill guides the AI to create a satirical or thematic web game based on a provided news report, leveraging existing game mechanics documented in a JSON structure.

## Workflow Steps

### 1. Requirements Analysis & Game Design
- **Read the News Report:** Understand the key themes, keywords, and tone of the provided news report (e.g., `junda/layoff_news_report_2026.md`). 
- **Review Game Mechanics:** Read the JSON documentation file to identify potential game categories and mechanisms.
- **Select Mechanics:** Choose 2-3 appropriate game mechanics that thematically fit the news report.
- **Explore Documentation:** Use the `view_file` tool to read the specific markdown details of the chosen mechanics (e.g., `MOV-14 Bias`, `WPL-01 Worker Placement`, `UNC-02 Push-Your-Luck`).
- **Create an Implementation Plan:** Draft an implementation plan outlining the game mechanics, aesthetics (HTML/CSS/JS), and difficulty scaling. Ensure the plan defines a clear win or loss condition so the game does not last infinitely.

### 2. Implementation
- **Create HTML Structure:** Build `index.html` with a modern, clean UI, game board, player avatar, and action buttons. 
- **Apply Vanilla CSS Styling:** Create `style.css` using modern techniques like CSS variables, glassmorphism, flexbox, and smooth CSS animations. Ensure it looks rich, dynamic, and premium.
- **Develop JavaScript Logic:** 
  - Write `game.js` containing game state, initialization, and core loops.
  - Implement the chosen mechanics (like automatically moving the player via Bias, resolving risky/safe actions).
  - Include sequential checking for Game Over conditions immediately after an action executes to prevent invalid states.
  - Implement **Difficulty Scaling** (e.g., accelerating belts over time) to guarantee the game ends eventually.

### 3. Verification & Refinement
- **Test Game Logic:** Create a comprehensive test script (e.g. using `node` and a mock DOM) or perform manual tests to verify that game states update correctly and difficulty scaling forces a Game Over trigger.
- **Tidy Up:** Create a specific directory for the final game output and move all game files (`index.html`, `style.css`, `game.js`) into it securely. Clean up temporary verify scripts.
- **Document Output:** Complete a walkthrough explaining the rules, logic refinements, and verification tests.
