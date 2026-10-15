# Bullet Points

An experimental, word-driven endless dungeon crawler and bullet-hell game.

The playfield scrolls upward through a dungeon made from words. The player runs, dodges, and shoots while a kill wall rises from below. The words can form walls, doors, hazards, enemies, and pickups.

## Project status

This lightweight browser-game scaffold is set up for building on the Raspberry Pi. It has no build system or external dependencies. The game engine and feed editor are still being built; the JSON files are the editable content/configuration starting point.

## Run locally

From the repository folder:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` in a browser. To test from a phone on the same Wi-Fi, open `http://<pi-local-ip>:8080`.

## Current structure

- `index.html`, `styles.css` — page shell and paper-like presentation
- `src/main.js` — canvas startup and keyboard movement scaffold
- `data/settings.json` — colors, scrolling, player, and display settings
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

For normal content changes, edit the matching JSON file under `data/`. For example, change words in `data/word-sets/default.json`, weapon tuning in `data/weapons.json`, or menu text in `data/menu.json`. Keep JSON syntax valid. The built-in rough editor opens with F8 and edits one JSON data file at a time. It saves drafts in the current browser or downloads a JSON file; only menu labels and the existing scaffold settings are currently consumed by the game.

## Feed editor

Press **F8** or click **EDITOR [F8]** to open the side editor. Choose a JSON file, edit it, check syntax, then save a browser-local draft or download the file. Press F8, Escape, or × to close. On narrow screens the editor fills the screen. Drafts are local to the current browser; downloaded JSON files are the portable copy.

## Pause menu and save slots

Open **Pause / Settings** to pause movement, resume, restart the current scaffold run, invert the ink, and choose a control scheme. Three save slots store the current scaffold state in this browser's local storage. They are local to this browser/device and are not cloud saves.

The current scaffold save includes player position and settings. The save format can grow when real dungeon progress and inventory are implemented. Sound and dual-stick choices are settings placeholders until their game systems are added. Menu wording is editable in `data/menu.json`.

## Controls planned

- Keyboard: WASD or arrow keys to move; mouse/keyboard to aim and fire
- Mobile: dual on-screen joysticks, left for movement and right for aiming/firing
- Display: responsive vertical playfield with invertible paper/ink colors

