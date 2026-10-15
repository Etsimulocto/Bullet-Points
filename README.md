# Bullet Points

An experimental, word-driven endless dungeon crawler and bullet-hell game.

The playfield scrolls upward through a dungeon made from words. The player runs, dodges, and shoots while a kill wall rises from below. The goal is to make the words part of the gameplay: walls, doors, hazards, and enemies all come from editable word feeds.

## Project status

This repository is a lightweight browser-game scaffold for building on the Raspberry Pi. It has no build system or external dependencies yet. Gameplay and the custom feed editor are next.

## Run locally

From the repository folder:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` in a browser. To test from a phone on the same Wi-Fi, open `http://<pi-local-ip>:8080`.

## Current structure

- `index.html` — page shell and game canvas
- `styles.css` — responsive, paper-like presentation
- `src/main.js` — canvas startup and input scaffold
- `data/feeds/default.json` — first editable feed/config
- `docs/GAME_DESIGN.md` — current design direction

## Controls planned

- Keyboard: WASD or arrow keys to move; mouse or keyboard to aim and fire
- Mobile: dual on-screen joysticks, left for movement and right for aiming/firing
- Display: responsive vertical playfield; invert paper/ink colors

Keep the feed data separate from the game code so dungeon words, spawn patterns, speed, and colors can be tuned without editing engine logic.
