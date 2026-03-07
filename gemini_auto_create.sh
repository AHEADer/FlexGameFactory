#!/bin/bash

# Navigate to the project directory
cd /Users/junda/Documents/Projects/FlexGameFactory || exit

# Run the Gemini CLI in non-interactive (headless) mode to generate the game.
# 
# Explanation of flags:
# -p (or --prompt): Supply the prompt and run in non-interactive mode.
# -y (or --yolo): Automatically accept all tool execution prompts (YOLO mode) so no human intervention is needed.
# @[]: You can include the skill file and the news file directly in your prompt text.
# -m (or --model): Specifies the model to use. Used here to select the best available pro model.
gemini -p "Use @[junda/generate_news_based_game/SKILL.md] to generate a game, theme can be found in news @[nba.md]. Game files should be saved in the junda_games dir." -y -m gemini-3-pro-preview
