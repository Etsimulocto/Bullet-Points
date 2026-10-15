# Editing game data

These JSON files are meant to be easy to edit with a text editor. Keep the JSON punctuation intact: double quotes around names and values, commas between items, and no comma after the last item.

## Files

- `settings.json` — paper/ink colors, scroll speed, player defaults, display options
- `weapons.json` — weapon names and starter tuning values
- `pickups.json` — pickup names and effects
- `enemies.json` — enemy stats and behavior identifiers
- `obstacles.json` — walls, doors, and collision behavior
- `word-sets/default.json` — the words used by the starter feed
- `spawn-patterns.json` — groups and arrangements of enemies or obstacles
- `menu.json` — menu button labels and settings-menu wording, including slot actions
- `feeds/default.json` — selects which files a feed uses

The content schemas are starter formats. They describe editable data; the game engine still needs to load and apply them. Behavior names such as `chase` or `restoreHealth` are identifiers, not code you should need to edit for routine tuning.


The settings dialog reads its button and status wording from `menu.json`. Three browser-local save slots currently preserve the scaffold player's position and settings; expand the save snapshot when game progress is added.


Press F8 to open the built-in JSON editor. It supports one data file at a time, JSON validation, browser-local drafts, downloads, and reset to the repository copy. The data files are not all connected to gameplay yet.
