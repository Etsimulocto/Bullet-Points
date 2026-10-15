# Bullet Points

An experimental, word-driven endless dungeon crawler and bullet-hell game.

The playfield scrolls upward through a dungeon made from words. The player runs, dodges, and shoots while a fixed two-line kill wall marks the bottom edge. The words can form walls, doors, hazards, enemies, and pickups.

## Project status

This lightweight browser-game scaffold is set up for building on the Raspberry Pi. It has no build system or external dependencies. The room-scroll scaffold moves distinct letter and symbol sidewalls downward while a fixed, two-line Wall of Death marks the bottom edge. The title, buttons, control directions, health meter, three lives, score, and weapon readout sit inside the room frame. Wall contact costs one life; losing all three ends the run. Room speed, wall glyphs, wall width, and the death wall’s height and text load from `data/settings.json`. If the run ends, press **R** or use **Restart Run** in the pause menu.

## Run locally

From the repository folder:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` in a browser. To test from a phone on the same Wi-Fi, open `http://<pi-local-ip>:8080`.

## Current structure

- `index.html`, `styles.css` — page shell and paper-like presentation
- `src/main.js` — canvas game loop and keyboard, gamepad, mouse, and touch input
- `data/settings.json` — colors, scrolling, player, and display settings
- `data/controls.json` — keyboard, standard gamepad, and touch bindings
- `data/weapons.json` — weapon list and tuning values
- `data/pickups.json` — pickup list and effects
- `data/enemies.json` — enemy list and behavior values
- `data/obstacles.json` — walls, doors, and collision values
- `data/word-sets/default.json` — background, wall, door, enemy, and pickup words
- `data/spawn-patterns.json` — starter enemy and obstacle arrangements
- `data/menu.json` — menu labels and screen messages
- `data/feeds/default.json` — manifest selecting the files used by the default feed
- `data/README.md` — editing notes for the JSON files
- `docs/GAME_DESIGN.md` — current design direction

## Editing

For normal content changes, edit the matching JSON file under `data/`. For example, change words in `data/word-sets/default.json`, weapon tuning in `data/weapons.json`, or menu text in `data/menu.json`. Keep JSON syntax valid. The built-in rough editor opens with F8 and edits one JSON data file at a time. It saves drafts in the current browser or downloads a JSON file; controls, weapons, pickups, menu labels, and room settings are currently read by the game.

## Feed editor

Press **F8** or click **EDITOR [F8]** to open the side editor. Choose a JSON file, edit it, check syntax, then save a browser-local draft or download the file. Press F8, Escape, or × to close. On narrow screens the editor fills the screen. Drafts are local to the current browser; downloaded JSON files are the portable copy.

## Pause menu and save slots

Open **Pause / Settings** to pause movement, resume, restart the current scaffold run, invert the ink, and choose a control scheme. Three save slots store the current scaffold state, including health, lives, and score, in this browser's local storage. They are local to this browser/device and are not cloud saves.

The current scaffold save includes player position, room scroll position, wall position, and settings. The save format can grow when real dungeon progress and inventory are implemented. Sound remains a placeholder. The current weapon roster and pickups are active: collect floating pickups, and cycle through weapons with Q/E or gamepad LB/RB. Shots rotate toward their travel direction; the laser draws a short beam. Enemies and projectile damage are not connected yet. Menu wording is editable in `data/menu.json`.

## Controls

- Keyboard: WASD or arrows to move; IJKL or mouse to aim; Space or mouse click to fire; Q/E to cycle weapons
- Gamepad: left stick or D-pad to move; right stick to aim; A or RT to fire; LB/RB to cycle weapons
- Mobile: dual on-screen joysticks, left for movement and right for aiming/firing
- Display: responsive vertical playfield with invertible paper/ink colors

