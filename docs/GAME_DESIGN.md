# Bullet Points — Game Direction

## Core idea

A vertically scrolling, infinite word dungeon built on the visual language of a sheet of paper. The player is armed and must keep moving upward while shooting, dodging, and navigating a screen full of text.

A kill wall advances from the bottom of the playfield. It creates the urgency: pause or get trapped, and the run ends. The dungeon has no side exits; play is about moving, aiming, and surviving the feed.

## Words are the world

Words should serve as game objects, not just decoration:

- Background words establish the paper/text atmosphere.
- Wall words form obstacles.
- Door or key words create route changes and objectives.
- Enemy words move and attack.
- Some words may react to being shot: break into letters, split into smaller enemies, or trigger an effect.

Exact word behaviors are open for playtesting.

## Presentation

- Clear, high-contrast typography with a paper-like field.
- An invert-colors option swaps ink and paper colors.
- Tall, responsive playfield that works on desktop and mobile.
- Scrolling words and letter fragments provide motion without cluttering the action.

## Controls

- Keyboard movement: WASD and arrow keys.
- Desktop aiming/firing: mouse plus a fire input; configurable keyboard alternative.
- Mobile: dual virtual joysticks, left to move and right to aim/fire.

## Feed editor

The editor should let the Architect create and tune custom feeds without code edits. Feed data should cover word lists, object roles, spawn weights, scroll speed, patterns, and color settings. Provide load, save, duplicate, preview, and import/export of feed files.

Treat feed schema as editable while the game is young. Keep content/configuration data separate from rendering and gameplay code.

## First playable milestone

1. Responsive vertical canvas and color inversion.
2. Player movement and auto-scrolling world.
3. Kill wall and collision/game-over loop.
4. Basic word obstacles and word enemies.
5. Shooting and hit feedback.
6. Keyboard/mouse and dual-touch controls.
7. Feed editor and import/export.

Build this in small testable steps. Preserve the simple static-browser setup until a real need for a build tool appears.
