---
name: Generate News-Based Game
description: A workflow to analyze a news report, select game mechanics from a documented structure, and develop a satirical web game based on the findings.
---

# Generate News-Based Game

This skill guides the AI to create a satirical or thematic web game based on a provided news report, leveraging existing game mechanics documented in a JSON structure.

## Workflow Steps

### 1. Requirements Analysis & Game Design
- **Read the News Report:** Understand the key themes, keywords, and tone of the user-provided news report. 
- **Review Game Mechanics:** Read the JSON documentation file to identify potential game categories and mechanisms.
- **Select Mechanics:** Choose 2-3 appropriate game mechanics that thematically fit the news report.
- **Explore Documentation:** Use the `view_file` tool to read the specific markdown details of the chosen mechanics (using the mechanic IDs and titles found in the JSON log).
- **Create an Implementation Plan:** Draft an implementation plan outlining the game mechanics, aesthetics (HTML/CSS/JS), and difficulty scaling. Ensure the plan defines a clear win or loss condition so the game does not last infinitely.

### 2. Implementation
- **Create HTML Structure:** Build `index.html` with a modern, clean UI, game board, player avatar, and action buttons. 
- **Apply Vanilla CSS Styling:** Create `style.css` using modern techniques like CSS variables, glassmorphism, flexbox, and smooth CSS animations. Ensure it looks rich, dynamic, and premium.
- **Develop JavaScript Logic:** 
  - Write `game.js` containing game state, initialization, and core loops.
  - Implement the chosen mechanics based on their documentation.
  - Include sequential checking for Game Over conditions immediately after an action executes to prevent invalid states.
  - Implement **Difficulty Scaling** (e.g., increasing enemy speed, tightening time limits, or increasing movement biases over time) to guarantee the game ends eventually.

### 3. Verification & Refinement
- **Test Game Logic:** Create a comprehensive test script (e.g. using `node` and a mock DOM) or perform manual tests to verify that game states update correctly and difficulty scaling forces a Game Over trigger.
- **Tidy Up:** Create a specific directory for the final game output and move all game files (`index.html`, `style.css`, `game.js`) into it securely. Clean up temporary verify scripts.
- **Document Output:** 
  - Complete a `game_summary.md` detailing the game's theme, mechanics, and instructions on how to play.
  - Craft a concise plain text prompt describing the game's cinematic visual theme (do not use the full markdown layout as the prompt).
  - Generate a cover image for the game named `cover.png` using the `nano_banana_gen` skill with this plain text prompt. Ensure you pass the arguments `--aspect_ratio 16:9` and `--image_size 1K` to achieve the recommended 1280x720 resolution required for the library cards.
