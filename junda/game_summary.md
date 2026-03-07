# AI Layoff Survivor: 2026 Edition — Game Summary

## Overview
**AI Layoff Survivor: 2026 Edition** is a satirical web-based strategy game where you play as a tech worker desperately trying to keep your job as a relentless conveyor belt of corporate restructuring pushes you toward the dreaded **Layoff Zone**. Inspired by real-world layoff headlines from early 2026 — including massive cuts at Block, Oracle, Amazon, and Meta — the game captures the anxiety and dark humor of the modern tech workplace.

## Theme & Inspiration
The game is based on the [Layoff News Report: February – March 2026](layoff_news_report_2026.md), which documents a wave of layoffs driven by companies aggressively adopting AI to replace human workers. The satirical tone highlights the absurdity of being "restructured" by the very technology you're asked to use.

## Core Mechanics
The game combines **three** board-game-inspired mechanics:

| Mechanic | Role in Game |
| :--- | :--- |
| **Bias (Conveyor Belt)** | Each turn, the conveyor belt automatically drags your character closer to the Layoff Zone. This creates a constant, escalating pressure that guarantees the game eventually ends. |
| **Worker Placement** | You choose one of two daily tasks: **Manual Work** (safe, small reward) or **Use AI to Code** (risky, high reward). Your choice determines your fate each turn. |
| **Push-Your-Luck** | Using AI to code has a 70% chance of a massive productivity boost (step back 3 from the edge) but a 30% chance of an AI hallucination that slips you forward toward the Layoff Zone. |

## How to Play
1. **Survive** as many days as possible by choosing your daily task wisely.
2. **Manual Work** (💼): Safe play. Gain +10 Corporate Value and step back 1 position from the Layoff Zone.
3. **Use AI to Code** (🤖): Risky play. 70% chance of +35 Value and stepping back 3. But 30% chance of losing value and slipping forward 2!
4. The **conveyor belt** moves you toward the Layoff Zone every turn, and it speeds up every 10 days.
5. The game ends when you reach the **Layoff Zone** — "Your role has been replaced by an LLM."

## Difficulty Scaling
- The conveyor belt starts at a speed of 30px per turn.
- Every 10 days, belt speed increases by 5px, making survival progressively harder.
- This ensures every game eventually ends, regardless of strategy.

## Tech Stack
- **HTML5** — Semantic game layout with a modern, clean UI
- **Vanilla CSS** — Glassmorphism effects, CSS animations (conveyor belt, character bobble, shake on failure, floating text), and a dark premium color palette
- **Vanilla JavaScript** — Game state management, probability-based mechanics, and difficulty scaling

## Visual Design
- **Dark mode** with a deep navy background (`#0f172a`)
- **Glassmorphism panels** with frosted-glass action buttons
- **Gradient title** (blue → purple) using `background-clip: text`
- **Animated conveyor belt** with repeating stripe pattern
- **Red Layoff Zone** at the bottom with a glowing danger aesthetic
- **Floating text animations** for score changes
- **Character bobble** animation for the player avatar (🧑‍💻)

## Win/Loss Condition
- **Loss**: Your position drops to or below the Layoff Zone threshold (100px). You get "restructured."
- **Score**: Your final Corporate Value score reflects how productive you were before being let go. The goal is to maximize this score while surviving as long as possible.

---

> *"Survive the AI shift! Don't let the conveyor belt drag you to the Layoff Zone."*
