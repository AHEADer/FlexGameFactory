---
name: Generate News-Based Game
description: A workflow to analyze a news report, select game mechanics from a documented structure, and develop a satirical web game based on the findings.
---

# Generate News-Based Game

This skill guides the AI to create a satirical or thematic web game based on a provided news report, leveraging existing game mechanics documented in a JSON structure.

## Workflow Steps

### 1. Requirements Analysis & Game Design
- **Read the News Report:** Understand the key themes, keywords, and tone of the provided news report (e.g., `layoff_news_report_2026.md`). 
- **Review Game Mechanics:** Read the JSON documentation file to identify potential game categories and mechanisms.
- **Select Mechanics:** Choose 2-3 appropriate game mechanics that thematically fit the news report.
- **Explore Documentation:** Use the `view_file` tool to read the specific markdown details of the chosen mechanics (e.g., `MOV-14 Bias`, `WPL-01 Worker Placement`, `UNC-02 Push-Your-Luck`).
- **Create an Implementation Plan:** Draft an implementation plan outlining the game mechanics, aesthetics (HTML/CSS/JS), and difficulty scaling. Ensure the plan defines a clear win or loss condition so the game does not last infinitely.

### 2. Summary & Cover Image Generation
- **Write a Game Summary:** Before writing any code, produce a concise summary (3-5 sentences) covering: the news theme, chosen game mechanics, core loop, and win/loss conditions.
- **Generate Cover Image:** Use the `generate_nano_banana_image` skill to create a cover image based on the summary. Load `GEMINI_API_KEY` from the project's `.env` file, then run:
  ```bash
  export $(grep -v '^#' .env | xargs) && python3 tools/nano_banana_gen.py "<PROMPT>" --aspect_ratio 16:9 --image_size 1K --output <OUTPUT_PATH>
  ```
  - Aspect ratio: `16:9`, resolution: `1280 x 720 px` (`1K`).
  - The image must be saved as `cover.png` in the same directory as the game files.
  - Do **not** proceed to code until the image is successfully generated.

### 3. Implementation (after cover image is generated)
- **Create HTML Structure:** Build `index.html` with a modern, clean UI, game board, player avatar, and action buttons. 
  - **CRITICAL - Game Introduction Modal:** Implement a `<dialog>` or full-screen overlay id="game-intro-modal". This modal MUST display the Game Theme, Lore, Core Loop, Win/Loss conditions, explicit player controls (e.g. "Drag and drop or Click"), and contain a prominent "Start Game" button.
  - Include sections for the Game Board, Player Stats (Resources), and Action Buttons.
  - **CRITICAL - Accessibility & Controls:** Ensure that all interactive game mechanics (like worker placement zones) support intuitive clicking. If using drag-and-drop, you MUST implement a click-to-deploy fallback mechanism and apply `cursor: pointer` styles to playable zones.
- **Apply Vanilla CSS Styling:** Create `style.css` using modern techniques like CSS variables, glassmorphism, flexbox, and smooth CSS animations. Ensure it looks rich, dynamic, and premium.
  - Style the Game Introduction Modal to look premium (centered, blurred background backdrop).
  - Add visual juice: smooth transitions for resource changes, hover effects for action buttons, and visual cues for disabled actions.
  - **Generate Game Elements:** Use the `generate_nano_banana_image` skill to create any necessary visual game elements (e.g., player avatars, resources, obstacles). Load `GEMINI_API_KEY` from the project's `.env` file, then run the tool for each asset:
    ```bash
    export $(grep -v '^#' .env | xargs) && python3 tools/nano_banana_gen.py "<PROMPT>" --aspect_ratio <ASPECT_RATIO> --image_size <SIZE> --output <OUTPUT_PATH>
    ```
    - For example, you can use `--aspect_ratio 1:1` and `--image_size 1K` for avatars/icons, saving them to the game directory.
- **Develop JavaScript Logic:** 
  - Write `game.js` containing game state, initialization, and core loops.
  - **Intro Logic:** On page load, show the Game Introduction modal. Pause all game timers until the user clicks "Start Game".
  - Implement the chosen mechanics (like automatically moving the player via Bias, resolving risky/safe actions).
  - Include sequential checking for Game Over conditions immediately after an action executes to prevent invalid states.
  - Implement **Difficulty Scaling** (e.g., accelerating belts over time) to guarantee the game ends eventually.

### 4. Verification & Refinement
- **Local Playtesting:** You MUST start a local python HTTP server (`python3 -m http.server`) and use your browser tools to manually playtest the game.
  - Verify that the game initializes correctly.
  - Verify that all modals (like the intro modal or game over modal) appear and disappear correctly when interacted with (check for CSS `display` overrides breaking default `<dialog>` behavior).
  - Verify that the Win/Loss conditions trigger appropriately.
- **Test Game Logic:** Create a comprehensive test script (e.g. using `node` and a mock DOM) or perform manual tests to verify that game states update correctly and difficulty scaling forces a Game Over trigger.
- **Tidy Up:** Create a specific directory for the final game output and move all game files (`index.html`, `style.css`, `game.js`) into it securely. Clean up temporary verify scripts.
- **Document Output:** Complete a walkthrough explaining the rules, logic refinements, and verification tests.