const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
const menuButton = document.querySelector("#menu-button");
const editorToggleButton = document.querySelector("#editor-toggle");
const editorPanel = document.querySelector("#editor-panel");
const editorCloseButton = document.querySelector("#editor-close");
const editorFileSelect = document.querySelector("#editor-file");
const editorFilePath = document.querySelector("#editor-file-path");
const editorText = document.querySelector("#editor-text");
const editorStatus = document.querySelector("#editor-status");
const editorValidateButton = document.querySelector("#editor-validate");
const editorSaveButton = document.querySelector("#editor-save");
const editorDownloadButton = document.querySelector("#editor-download");
const editorResetButton = document.querySelector("#editor-reset");
const enemyTuner = document.querySelector("#enemy-tuner");
const enemyTunerSelect = document.querySelector("#enemy-tuner-select");
const enemyTunerFields = document.querySelector("#enemy-tuner-fields");
const enemyPreviewLetter = document.querySelector("#enemy-preview-letter");
const enemyPreviewName = document.querySelector("#enemy-preview-name");
const explosionPreview = document.querySelector("#explosion-preview");
const dialog = document.querySelector("#settings-dialog");
const resumeButton = document.querySelector("#resume-button");
const closeMenuButton = document.querySelector("#close-menu");
const invertButton = document.querySelector("#invert-button");
const soundToggle = document.querySelector("#sound-toggle");
const slotList = document.querySelector("#save-slots");
const menuStatus = document.querySelector("#menu-status");
const restartButton = document.querySelector("#restart-button");
const gamepadStatus = document.querySelector("#gamepad-status");
const leftStick = document.querySelector("#left-stick"), rightStick = document.querySelector("#right-stick");
const leftStickKnob = document.querySelector("#left-stick-knob"), rightStickKnob = document.querySelector("#right-stick-knob");
const touchSticks = document.querySelector("#touch-sticks"), app = document.querySelector(".app");
const stage = document.querySelector(".stage");
const deathWallLine1 = document.querySelector("#death-wall-line-1");
const deathWallLine2 = document.querySelector("#death-wall-line-2");
const deathWall = document.querySelector("#death-wall");
const depthReadout = document.querySelector("#depth-readout");
const pickupMessageReadout = document.querySelector("#pickup-message");
const healthMeter = document.querySelector("#health-meter");
const healthText = document.querySelector("#health-text");
const livesReadout = document.querySelector("#lives-readout");
const scoreReadout = document.querySelector("#score-readout");
const weaponReadout = document.querySelector("#weapon-readout");
const fontSelect = document.querySelector("#font-theme");
const fontThemes = {
  dos: { canvas: "'Courier New', Courier, monospace" },
  vga: { canvas: "'Lucida Console', 'DejaVu Sans Mono', monospace" },
  arcade: { canvas: "'Arial Black', Impact, 'DejaVu Sans Mono', monospace" }
};
const controlMap = {keyboard:{moveUp:["w","ArrowUp"],moveDown:["s","ArrowDown"],moveLeft:["a","ArrowLeft"],moveRight:["d","ArrowRight"],aimUp:["i"],aimDown:["k"],aimLeft:["j"],aimRight:["l"],fire:[" "]},gamepad:{deadzone:.18,moveAxes:{x:0,y:1},aimAxes:{x:2,y:3},fireButtons:[0,7],dpad:{up:12,down:13,left:14,right:15}},touch:{deadzone:.12,fireWhileRightStickHeld:true}};
const input = {pad:null,move:{x:0,y:0},aim:{x:0,y:0},touchMove:{x:0,y:0},touchAim:{x:0,y:0},touchFire:false,mouseAim:{x:0,y:0},mouseFire:false};
let lastGamepadMessage = "";
const gamepadUiState = {
  startDown: false,
  selectDown: false,
  backDown: false,
  activateDown: false,
  direction: "",
  repeatIn: 0,
};

const palette = {
  paper: "#f4f0e6",
  ink: "#191919",
  accent: "#d84b3e",
};
const SLOT_PREFIX = "bulletPoints.saveSlot.";
const SLOT_COUNT = 3;
const EDITOR_DRAFT_PREFIX = "bulletPoints.editorDraft.";
const roomSettings = {
  scrollSpeed: 42,
  spawnInterval: 4.2,
  wallWidth: 54,
  glyphSpacing: 26,
  deathWallHeight: 160,
  deathWallLines: ["WALL OF DEATH", "NO ESCAPE"],
  leftWallGlyphs: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  rightWallGlyphs: "0123456789!?<>+-*/"
};
const uiText = {
  title: "PAUSED / SETTINGS",
  pauseSettings: "Ⅱ PAUSE / SETTINGS",
  resume: "RESUME RUN",
  displayHeading: "DISPLAY & SOUND",
  inkLabel: "Ink colors",
  invertOn: "INVERT INK: ON",
  invertOff: "INVERT INK: OFF",
  soundLabel: "Sound effects",
  soundNote: "(ready for audio)",
  controlsHeading: "CONTROLS",
  keyboard: "Keyboard and mouse",
  auto: "Auto: use any active input",
  keyboard: "Keyboard and mouse",
  gamepad: "Gamepad",
  touch: "Dual mobile sticks",
  touchNote: "(left moves · right aims and fires)",
  gamepadStatus: "Looking for a connected controller…",
  noGamepad: "No controller detected. Connect one, then press a button.",
  gamepadConnected: "Connected: ",
  gamepadUnsupported: "Gamepad API unavailable in this browser.",
  saveSlots: "SAVE SLOTS",
  storageNote: "Stored in this browser",
  slotName: "SAVE SLOT {slot}",
  empty: "EMPTY",
  savedPrefix: "Saved ",
  savedRun: "Saved run",
  save: "SAVE",
  load: "LOAD",
  clear: "CLEAR",
  restart: "RESTART RUN",
  replacePrompt: "Replace Save Slot ",
  clearPrompt: "Clear Save Slot ",
  restartPrompt: "Restart this run?",
  savedMessage: "Saved to Slot ",
  saveFailed: "Could not save. Browser storage may be unavailable.",
  loadEmpty: " has no readable save.",
  loadSuccess: "Loaded Slot ",
  clearedMessage: "Slot ",
  clearFailed: "Could not clear this save slot.",
  restartSuccess: "Run restarted.",
  soundEnabled: "Sound effects enabled.",
  soundMuted: "Sound effects muted.",
  autoSelected: "Auto controls enabled.",
  keyboardSelected: "Keyboard and mouse selected.",
  gamepadSelected: "Gamepad selected.",
  touchSelected: "Dual mobile sticks selected."
};

let editorDirty = false;
let editorLoaded = false;
let editorPath = "";

const weaponList = [{
  id: "period", name: "Period Pistol", projectileGlyph: ".", damage: 1,
  shotsPerSecond: 5, projectileSpeed: 560, spreadDegrees: 0, projectilesPerShot: 1, pattern: "single", unlockedByDefault: true
}];
let pickupList = [];
let enemyList = [];
let horizontalWallWords = ["STONE", "BARRIER", "PARAGRAPH", "BLOCK"];
const state = {
  inverted: false, paused: false, soundEnabled: true, controlScheme: "auto", fontTheme: "dos", keys: new Set(),
  player: { x: 0.5, y: 0.76 }, projectiles: [], beams: [], pickups: [], obstacles: [], effects: [],
  fireCooldown: 0, aim: { x: 0, y: -1 }, gameOver: false,
  enemies: [], enemyBullets: [], explosions: [], enemySpawnIndex: 0,
  health: 3, maxHealth: 3, lives: 3, maxLives: 3, score: 0, shields: 0, weaponId: "period", unlockedWeapons: ["period"],
  worldSpawnTimer: 1.5, nextWallSide: "left", runTime: 0, pickupMessage: "", pickupMessageTime: 0,
  gamepadPrevDown: false, gamepadNextDown: false,
  world: { scrollOffset: 0, deathWallY: null, distance: 0 }, lastTime: 0,
};

async function loadCombatData() {
  try {
    const [weaponResponse, pickupResponse, enemyResponse] = await Promise.all([
      fetch(new URL("../data/weapons.json", import.meta.url)),
      fetch(new URL("../data/pickups.json", import.meta.url)),
      fetch(new URL("../data/enemies.json", import.meta.url))
    ]);
    if (weaponResponse.ok) {
      const data = await weaponResponse.json();
      if (Array.isArray(data.weapons) && data.weapons.length) {
        weaponList.splice(0, weaponList.length, ...data.weapons);
        state.unlockedWeapons = weaponList.filter(w => w.unlockedByDefault).map(w => w.id);
        if (!state.unlockedWeapons.length) state.unlockedWeapons = [weaponList[0].id];
        state.weaponId = state.unlockedWeapons.includes("period") ? "period" : state.unlockedWeapons[0];
      }
    }
    if (pickupResponse.ok) {
      const data = await pickupResponse.json();
      if (Array.isArray(data.pickups)) pickupList = data.pickups;
    }
    if (enemyResponse.ok) {
      let data = await enemyResponse.json();
      try {
        const draft = localStorage.getItem(EDITOR_DRAFT_PREFIX + "../data/enemies.json");
        if (draft) data = JSON.parse(draft);
      } catch {}
      if (Array.isArray(data.enemies)) enemyList = data.enemies.filter(enemy => enemy && enemy.id && enemy.letter && enemy.name);
    }
  } catch {
    // Keep the built-in Period Pistol if the editable lists cannot load.
  }
}
function getWeapon(id = state.weaponId) {
  return weaponList.find(weapon => weapon.id === id) || weaponList[0];
}
function cycleWeapon(direction) {
  const unlocked = weaponList.filter(weapon => state.unlockedWeapons.includes(weapon.id));
  if (unlocked.length < 2) {
    state.pickupMessage = "Find a weapon page to unlock more weapons";
    state.pickupMessageTime = 2;
    return;
  }
  let index = unlocked.findIndex(weapon => weapon.id === state.weaponId);
  index = (index + direction + unlocked.length) % unlocked.length;
  state.weaponId = unlocked[index].id;
  state.pickupMessage = unlocked[index].name;
  state.pickupMessageTime = 1.8;
}
function effectValue(effect, fallback = 1) {
  return state.effects.filter(item => item.effect === effect).reduce((value, item) => value * item.amount, fallback);
}
function effectTotal(effect) {
  return state.effects.filter(item => item.effect === effect).reduce((sum, item) => sum + Number(item.amount || 0), 0);
}
function sayPickup(message) {
  state.pickupMessage = message;
  state.pickupMessageTime = 2.2;
}
function collectPickup(pickup) {
  const item = pickup.data;
  state.score += 50;
  if (item.effect === "bonusDistance") state.score += Math.floor(Number(item.amount || 0) / 10);
  if (item.effect === "restoreHealth") {
    const before = state.health;
    state.health = Math.min(state.maxHealth, state.health + item.amount);
    sayPickup(state.health > before ? item.name + " +" + (state.health - before) + " HP" : "HEALTH FULL");
  } else if (item.effect === "addShield") {
    state.shields += item.amount;
    sayPickup(item.name + " +" + item.amount);
  } else if (item.effect === "modifyFireRate" || item.effect === "extraProjectiles" || item.effect === "slowScroll") {
    state.effects.push({ effect: item.effect, amount: item.amount, remaining: item.durationSeconds });
    sayPickup(item.name + " · " + item.durationSeconds + "s");
  } else if (item.effect === "grantWeapon") {
    const locked = weaponList.filter(weapon => !state.unlockedWeapons.includes(weapon.id));
    const options = locked.length ? locked : weaponList.filter(weapon => weapon.id !== state.weaponId);
    const weapon = item.amount === "random" ? options[Math.floor(Math.random() * options.length)] : weaponList.find(entry => entry.id === item.amount);
    if (weapon) {
      if (!state.unlockedWeapons.includes(weapon.id)) state.unlockedWeapons.push(weapon.id);
      state.weaponId = weapon.id;
      sayPickup((locked.length ? "UNLOCKED · " : "WEAPON DROP · ") + weapon.name);
    } else {
      state.shields += 1;
      sayPickup("ARSENAL COMPLETE · +1 SHIELD");
    }
  } else if (item.effect === "increaseMaxHealth") {
    state.maxHealth += item.amount;
    state.health = Math.min(state.maxHealth, state.health + item.amount);
    sayPickup("MAX HP +" + item.amount);
  } else if (item.effect === "bonusDistance") {
    state.world.distance += item.amount;
    sayPickup("PAGE SKIP · +" + Math.round(item.amount / 10) + "m");
  } else {
    sayPickup(item.name || "PICKUP");
  }
}
function shootWeapon(weapon, aim, width, height) {
  const baseAngle = Math.atan2(aim.y, aim.x);
  if (weapon.pattern === "beam") {
    state.beams.push({ x: width * state.player.x, y: height * state.player.y, angle: baseAngle, length: weapon.beamLength || 400, duration: weapon.beamDuration || 0.12, remaining: weapon.beamDuration || 0.12 });
    return;
  }
  const count = Math.max(1, Number(weapon.projectilesPerShot) || 1) + Math.max(0, Math.floor(effectTotal("extraProjectiles")));
  const spread = (Number(weapon.spreadDegrees) || 0) * Math.PI / 180;
  const speed = Number(weapon.projectileSpeed) || 500;
  for (let i = 0; i < count; i += 1) {
    const angle = baseAngle + (count === 1 ? 0 : spread * (i / (count - 1) - 0.5));
    state.projectiles.push({
      x: width * state.player.x + Math.cos(angle) * 14,
      y: height * state.player.y + Math.sin(angle) * 14,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, angle,
      glyph: weapon.projectileGlyph || ".", damage: Number(weapon.damage) || 1
    });
  }
}
async function loadControlMap() {
  try {
    const response = await fetch(new URL("../data/controls.json", import.meta.url));
    if (!response.ok) return;
    const config = await response.json();
    Object.assign(controlMap.keyboard, config.keyboard || {});
    Object.assign(controlMap.gamepad, config.gamepad || {});
    Object.assign(controlMap.touch, config.touch || {});
  } catch {}
}
function applyControlScheme() {
  app.classList.toggle("touch-mode", state.controlScheme === "touch");
  touchSticks.hidden = state.controlScheme !== "touch" && !matchMedia("(pointer: coarse)").matches;
}
function deadzone(value, zone) {
  return Math.abs(value) < zone ? 0 : Math.sign(value) * (Math.abs(value) - zone) / (1 - zone);
}
function pollGamepad() {
  if (!navigator.getGamepads) {
    input.pad = null;
    gamepadStatus.textContent = uiText.gamepadUnsupported;
    return;
  }
  input.pad = Array.from(navigator.getGamepads() || []).find(p => p && p.connected) || null;
  const pad = input.pad, cfg = controlMap.gamepad;
  const status = pad ? uiText.gamepadConnected.replace("{name}", pad.id || "Controller") : uiText.noGamepad;
  if (status !== lastGamepadMessage) { lastGamepadMessage = status; gamepadStatus.textContent = status; }
  if (!pad) { input.move = {x:0,y:0}; input.aim = {x:0,y:0}; return; }
  const ax = i => Number.isFinite(pad.axes[i]) ? pad.axes[i] : 0;
  const down = i => Boolean(pad.buttons[i]?.pressed);
  input.move = {x:deadzone(ax(cfg.moveAxes.x),cfg.deadzone)+Number(down(cfg.dpad.right))-Number(down(cfg.dpad.left)),y:deadzone(ax(cfg.moveAxes.y),cfg.deadzone)+Number(down(cfg.dpad.down))-Number(down(cfg.dpad.up))};
  input.aim = {x:deadzone(ax(cfg.aimAxes.x),cfg.deadzone),y:deadzone(ax(cfg.aimAxes.y),cfg.deadzone)};
}
function handleGamepadUi(dt) {
  const pad = input.pad;
  if (!pad) {
    gamepadUiState.startDown = false;
    gamepadUiState.selectDown = false;
    gamepadUiState.backDown = false;
    gamepadUiState.activateDown = false;
    gamepadUiState.direction = "";
    gamepadUiState.repeatIn = 0;
    return;
  }
  const cfg = controlMap.gamepad;
  const down = index => Number.isInteger(index) && Boolean(pad.buttons[index]?.pressed);
  const start = down(cfg.menuButton ?? 9);
  const select = down(cfg.editorButton ?? 8);
  const back = down(cfg.backButton ?? 1);
  const activate = down(cfg.activateButton ?? 0);

  if (start && !gamepadUiState.startDown) {
    if (dialog.open) resumeRun();
    else openSettings();
  }
  if (select && !gamepadUiState.selectDown) {
    if (!editorPanel.hidden) toggleEditor(false);
    else toggleEditor(true);
  }
  if (back && !gamepadUiState.backDown) {
    if (!editorPanel.hidden) toggleEditor(false);
    else if (dialog.open) resumeRun();
  }

  const root = dialog.open ? dialog : (!editorPanel.hidden ? editorPanel : null);
  if (root) {
    const deadzoneValue = cfg.deadzone ?? 0.18;
    const axis = index => Number.isFinite(pad.axes[index]) ? pad.axes[index] : 0;
    const horizontal = Number(down(cfg.dpad?.right ?? 15)) - Number(down(cfg.dpad?.left ?? 14)) + deadzone(axis(cfg.moveAxes?.x ?? 0), deadzoneValue);
    const vertical = Number(down(cfg.dpad?.down ?? 13)) - Number(down(cfg.dpad?.up ?? 12)) + deadzone(axis(cfg.moveAxes?.y ?? 1), deadzoneValue);
    let direction = "";
    if (Math.abs(vertical) > 0.5) direction = vertical > 0 ? "down" : "up";
    else if (Math.abs(horizontal) > 0.5) direction = horizontal > 0 ? "right" : "left";

    if (direction) {
      if (direction !== gamepadUiState.direction || gamepadUiState.repeatIn <= 0) {
        const controls = Array.from(root.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'))
          .filter(element => element.getClientRects().length > 0);
        if (document.activeElement?.tagName === "SELECT") {
          const select = document.activeElement;
          const step = direction === "down" || direction === "right" ? 1 : -1;
          select.selectedIndex = (select.selectedIndex + step + select.options.length) % select.options.length;
          select.dispatchEvent(new Event("change", { bubbles: true }));
        } else if (controls.length) {
          let index = controls.indexOf(document.activeElement);
          if (index < 0) index = 0;
          const step = direction === "down" || direction === "right" ? 1 : -1;
          controls[(index + step + controls.length) % controls.length].focus();
        }
        gamepadUiState.repeatIn = 0.28;
      } else {
        gamepadUiState.repeatIn -= dt;
      }
    }
    gamepadUiState.direction = direction;

    if (activate && !gamepadUiState.activateDown) {
      const target = document.activeElement;
      if (target && root.contains(target) && target.matches("button, input[type=checkbox], input[type=radio], select, [role=button]")) target.click();
    }
  } else {
    gamepadUiState.direction = "";
    gamepadUiState.repeatIn = 0;
  }

  gamepadUiState.startDown = start;
  gamepadUiState.selectDown = select;
  gamepadUiState.backDown = back;
  gamepadUiState.activateDown = activate;
}
function keyAxis(negative, positive) {
  return Number(positive.some(k => state.keys.has(k))) - Number(negative.some(k => state.keys.has(k)));
}
function readControls() {
  pollGamepad();
  const scheme=state.controlScheme, kb=controlMap.keyboard;
  const useK=scheme==="auto"||scheme==="keyboard", useG=scheme==="auto"||scheme==="gamepad", useT=scheme==="auto"||scheme==="touch";
  let move={x:(useK?keyAxis(kb.moveLeft,kb.moveRight):0)+(useG?input.move.x:0)+(useT?input.touchMove.x:0),y:(useK?keyAxis(kb.moveUp,kb.moveDown):0)+(useG?input.move.y:0)+(useT?input.touchMove.y:0)};
  const m=Math.hypot(move.x,move.y); if(m>1) move={x:move.x/m,y:move.y/m};
  const keyAim=useK?{x:keyAxis(kb.aimLeft,kb.aimRight),y:keyAxis(kb.aimUp,kb.aimDown)}:{x:0,y:0};
  const aim=[useT?input.touchAim:null,useG?input.aim:null,keyAim,useK?input.mouseAim:null].find(v=>v&&Math.hypot(v.x,v.y)>.15)||{x:0,y:-1};
  if (useG && input.pad) {
    const down = index => Boolean(input.pad.buttons[index]?.pressed);
    const prev = (controlMap.gamepad.weaponPrevButtons || [4]).some(down);
    const next = (controlMap.gamepad.weaponNextButtons || [5]).some(down);
    if (prev && !state.gamepadPrevDown) cycleWeapon(-1);
    if (next && !state.gamepadNextDown) cycleWeapon(1);
    state.gamepadPrevDown = prev;
    state.gamepadNextDown = next;
  } else {
    state.gamepadPrevDown = false;
    state.gamepadNextDown = false;
  }
  const rightStickFiring = useG && input.pad && controlMap.gamepad.rightStickFires !== false && Math.hypot(input.aim.x, input.aim.y) > (controlMap.gamepad.rightStickFireThreshold ?? 0.24);
  const fire=(useK&&(kb.fire||[]).some(k=>state.keys.has(k)|| (k===" "&&state.keys.has(" "))))||(useK&&input.mouseFire)||(useG&&input.pad&&(controlMap.gamepad.fireButtons||[]).some(i=>input.pad.buttons[i]?.pressed))||rightStickFiring||(useT&&input.touchFire&&controlMap.touch.fireWhileRightStickHeld);
  return {move,aim,fire};
}
function setStick(stick, knob, point) {
  const r=Math.min(stick.clientWidth,stick.clientHeight)*.34, box=stick.getBoundingClientRect();
  let x=point.clientX-(box.left+box.width/2), y=point.clientY-(box.top+box.height/2), d=Math.hypot(x,y), scale=d>r?r/d:1;
  x=x*scale/r; y=y*scale/r;
  if(Math.hypot(x,y)<(controlMap.touch.deadzone||.12)) x=y=0;
  knob.style.transform="translate("+x*r+"px,"+y*r+"px)";
  return {x,y};
}
function bindStick(stick,knob,type) {
  let active=null;
  const release=e=>{if(active!==null&&e.pointerId!==active)return; active=null; stick.classList.remove("is-active"); knob.style.transform="translate(0,0)"; if(type==="move")input.touchMove={x:0,y:0};else{input.touchAim={x:0,y:0};input.touchFire=false;}};
  stick.addEventListener("pointerdown",e=>{if(!["auto","touch"].includes(state.controlScheme))return;e.preventDefault();active=e.pointerId;stick.setPointerCapture(active);stick.classList.add("is-active");const v=setStick(stick,knob,e);if(type==="move")input.touchMove=v;else{input.touchAim=v;input.touchFire=true;}});
  stick.addEventListener("pointermove",e=>{if(e.pointerId!==active)return;const v=setStick(stick,knob,e);if(type==="move")input.touchMove=v;else{input.touchAim=v;input.touchFire=true;}});
  ["pointerup","pointercancel","lostpointercapture"].forEach(t=>stick.addEventListener(t,release));
}
function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.round(bounds.width * scale);
  canvas.height = Math.round(bounds.height * scale);
  context.setTransform(scale, 0, 0, scale, 0, 0);
  draw();
}

function colors() {
  return state.inverted
    ? { paper: palette.ink, ink: palette.paper, accent: "#ff7668" }
    : palette;
}

function drawScrollingSidewall(x, wallWidth, glyphs, color, side) {
  const { height } = canvas.getBoundingClientRect();
  const spacing = roomSettings.glyphSpacing;
  const phase = state.world.scrollOffset % spacing;
  context.fillStyle = state.inverted ? "#252525" : "#e9e2d2";
  context.fillRect(x, 0, wallWidth, height);
  context.fillStyle = color.ink;
  context.textAlign = "center";
  setCanvasFont(13, "bold");
  const rows = Math.ceil(height / spacing) + 2;
  for (let row = 0; row < rows; row += 1) {
    const y = -spacing + phase + row * spacing;
    const streamRow = Math.floor(state.world.scrollOffset / spacing) + row - 1;
    for (let column = 0; column < 3; column += 1) {
      const index = ((streamRow + column * (side === "left" ? 5 : 9)) % glyphs.length + glyphs.length) % glyphs.length;
      const character = glyphs[index];
      const xPosition = x + wallWidth * ((column + 0.5) / 3);
      context.globalAlpha = 0.48 + ((streamRow + column) % 3) * 0.16;
      context.fillText(character, xPosition, y);
    }
  }
  context.globalAlpha = 1;
  context.strokeStyle = color.ink;
  context.globalAlpha = 0.55;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(side === "left" ? x + wallWidth : x, 0);
  context.lineTo(side === "left" ? x + wallWidth : x, height);
  context.stroke();
  context.globalAlpha = 1;
}

function getDeathWallHeight() {
  return deathWall.getBoundingClientRect().height || roomSettings.deathWallHeight;
}

function getPlayerStartY() {
  const height = Math.max(1, canvas.getBoundingClientRect().height);
  return Math.max(0.18, Math.min(0.72, (height - getDeathWallHeight() - 28) / height));
}

function applyDeathWallSettings() {
  stage.style.setProperty("--death-wall-height", roomSettings.deathWallHeight + "px");
  stage.style.setProperty("--death-wall-reserved-height", getDeathWallHeight() + "px");
  deathWallLine1.textContent = roomSettings.deathWallLines[0] || "WALL OF DEATH";
  deathWallLine2.textContent = roomSettings.deathWallLines[1] || "NO ESCAPE";
}

function renderHud() {
  healthMeter.max = Math.max(1, state.maxHealth);
  healthMeter.value = Math.max(0, state.health);
  healthText.textContent = `${Math.max(0, Math.ceil(state.health))}/${Math.max(1, state.maxHealth)}`;
  livesReadout.textContent = `LIVES ${"●".repeat(Math.max(0, state.lives))}${"○".repeat(Math.max(0, state.maxLives - state.lives))}`;
  scoreReadout.textContent = `PTS ${Math.floor(state.score).toLocaleString()}`;
  depthReadout.textContent = `DEPTH ${Math.floor(state.world.distance / 10)} m`;
  pickupMessageReadout.textContent = state.gameOver ? "ERASED · PRESS R TO RESTART" : state.pickupMessageTime > 0 ? state.pickupMessage : "";
  const weapon = getWeapon();
  weaponReadout.textContent = `${weapon.projectileGlyph || "."} ${weapon.name.toUpperCase()}`;
}

function createEnemyExplosion(enemy) {
  const count = Math.max(2, Math.min(32, Number(enemy.data.explosionCount) || 8));
  const duration = Math.max(0.1, Number(enemy.data.explosionDuration) || 0.55);
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i / count) + Math.random() * 0.24;
    const speed = 35 + Math.random() * 90;
    state.explosions.push({
      x: enemy.x, y: enemy.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      glyph: enemy.data.explosionGlyph || enemy.letter,
      color: enemy.data.explosionColor || enemy.data.enemyColor || "#ffffff",
      life: duration, duration
    });
  }
}

function defeatEnemy(enemy) {
  createEnemyExplosion(enemy);
  state.score += Math.max(0, Number(enemy.data.score) || 0);
  sayPickup("DEFEATED · " + enemy.data.name);
}

function damagePlayer(amount) {
  const damage = Math.max(0, Number(amount) || 0);
  if (damage === 0) return;
  if (state.shields > 0) state.shields -= 1;
  else state.health = Math.max(0, state.health - damage);
  if (state.health <= 0) loseLife();
}

function fireEnemyBullet(enemy, playerX, playerY) {
  const dx = playerX - enemy.x, dy = playerY - enemy.y;
  const distance = Math.hypot(dx, dy) || 1;
  const type = enemy.data.bulletType || "letter";
  const glyph = type === "dot" ? (enemy.data.bulletGlyph || "·")
    : type === "letter" ? enemy.letter
    : type === "word" ? (enemy.data.bulletGlyph || enemy.letter + enemy.letter)
    : type === "ring" ? "○"
    : type === "slash" ? "/"
    : (enemy.data.bulletGlyph || "·");
  state.enemyBullets.push({
    x: enemy.x, y: enemy.y, vx: dx / distance * (Number(enemy.data.bulletSpeed) || 180),
    vy: dy / distance * (Number(enemy.data.bulletSpeed) || 180),
    glyph, type, damage: Number(enemy.data.bulletDamage) || 1,
    color: enemy.data.bulletColor || enemy.data.enemyColor || "#ffffff",
    angle: Math.atan2(dy, dx)
  });
}

function updateEnemySystem(dt, width, height, scrollDelta) {
  const minX = roomSettings.wallWidth + 16;
  const maxX = Math.max(minX + 1, width - roomSettings.wallWidth - 16);
  const playerX = width * state.player.x;
  const playerY = height * state.player.y;

  state.enemies = state.enemies.filter(enemy => {
    const def = enemy.data;
    const speed = Math.max(0, Number(def.speed) || 0);
    enemy.age += dt;
    enemy.phase += dt;
    enemy.y += scrollDelta;
    const dx = playerX - enemy.x, dy = playerY - enemy.y;
    const distance = Math.hypot(dx, dy) || 1;

    if (def.behavior === "charge" && Math.sin(enemy.phase * 1.3) > 0.25) {
      enemy.x += dx / distance * speed * 1.7 * dt;
      enemy.y += dy / distance * speed * 1.7 * dt;
    } else if (def.behavior === "chase") {
      enemy.x += dx / distance * speed * dt;
      enemy.y += dy / distance * speed * dt;
    } else if (def.behavior === "strafe") {
      enemy.x = enemy.originX + Math.sin(enemy.phase * 1.4) * Math.min(90, speed * 1.3);
    } else if (def.behavior === "weave") {
      enemy.x += Math.sin(enemy.phase * 2.7) * speed * dt;
      enemy.y += Math.cos(enemy.phase * 1.8) * speed * 0.18 * dt;
    } else if (def.behavior === "bounce") {
      enemy.x += enemy.direction * speed * dt;
      if (enemy.x < minX || enemy.x > maxX) enemy.direction *= -1;
    } else if (def.behavior === "swoop") {
      enemy.x += dx / distance * speed * 0.65 * dt;
      enemy.y += Math.sin(enemy.phase * 2) * speed * 0.35 * dt;
    } else if (def.behavior === "orbit") {
      enemy.angle += dt * Math.max(0.6, speed / 45);
      enemy.x = playerX + Math.cos(enemy.angle) * 68;
      enemy.y = playerY + Math.sin(enemy.angle) * 48;
    } else if (def.behavior === "stalk") {
      enemy.x += Math.sign(dx) * speed * 0.45 * dt;
      enemy.y += Math.sign(dy) * speed * 0.22 * dt;
    } else {
      enemy.x += Math.sin(enemy.phase + enemy.phase * 0.35) * speed * 0.28 * dt;
    }

    enemy.x = Math.max(minX, Math.min(maxX, enemy.x));
    enemy.fireCooldown -= dt;
    if (def.shoots && enemy.fireCooldown <= 0) {
      fireEnemyBullet(enemy, playerX, playerY);
      enemy.fireCooldown = Math.max(0.25, Number(def.fireRate) || 1.6);
    }
    if (Math.hypot(enemy.x - playerX, enemy.y - playerY) < 22) {
      damagePlayer(def.contactDamage);
      createEnemyExplosion(enemy);
      sayPickup("HIT BY · " + def.name);
      return false;
    }
    return enemy.y < state.world.deathWallY + 30;
  });

  state.enemyBullets = state.enemyBullets.filter(bullet => {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    if (Math.hypot(bullet.x - playerX, bullet.y - playerY) < 14) {
      damagePlayer(bullet.damage);
      sayPickup("HIT BY · ENEMY FIRE");
      return false;
    }
    return bullet.x > -24 && bullet.x < width + 24 && bullet.y > -24 && bullet.y < height + 24;
  });

  state.explosions = state.explosions.filter(particle => {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.life -= dt;
    return particle.life > 0;
  });
}

function updatePlayerShots(dt, width, height) {
  const remaining = [];
  for (const shot of state.projectiles) {
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    shot.angle = Math.atan2(shot.vy, shot.vx);
    const targetIndex = state.enemies.findIndex(enemy => Math.hypot(enemy.x - shot.x, enemy.y - shot.y) < 18);
    if (targetIndex >= 0) {
      const target = state.enemies[targetIndex];
      target.health -= Math.max(1, Number(shot.damage) || 1);
      if (target.health <= 0) {
        state.enemies.splice(targetIndex, 1);
        defeatEnemy(target);
      }
      continue;
    }
    if (shot.x >= -20 && shot.x <= width + 20 && shot.y >= -20 && shot.y <= height + 20) remaining.push(shot);
  }
  state.projectiles = remaining;
}

function loseLife() {
  state.lives = Math.max(0, state.lives - 1);
  state.enemyBullets = [];
  if (state.lives === 0) {
    state.gameOver = true;
    state.paused = true;
    state.keys.clear();
    return;
  }
  state.player = { x: 0.5, y: getPlayerStartY() };
  state.health = state.maxHealth;
  state.projectiles = [];
  state.enemyBullets = [];
  state.pickupMessage = `LIFE LOST · ${state.lives} LEFT`;
  state.pickupMessageTime = 2.4;
}

function draw() {
  renderHud();
  const { width, height } = canvas.getBoundingClientRect();
  const color = colors();
  context.clearRect(0, 0, width, height);
  context.fillStyle = color.paper;
  context.fillRect(0, 0, width, height);

  const wallWidth = Math.min(roomSettings.wallWidth, Math.max(34, width * 0.16));
  drawScrollingSidewall(0, wallWidth, roomSettings.leftWallGlyphs, color, "left");
  drawScrollingSidewall(width - wallWidth, wallWidth, roomSettings.rightWallGlyphs, color, "right");

  state.obstacles.forEach(obstacle => {
    context.save();
    context.beginPath();
    context.rect(obstacle.x, obstacle.y - obstacle.height / 2, obstacle.width, obstacle.height);
    context.clip();
    context.fillStyle = color.paper;
    context.fillRect(obstacle.x, obstacle.y - obstacle.height / 2, obstacle.width, obstacle.height);
    context.strokeStyle = color.accent;
    context.lineWidth = 2;
    context.strokeRect(obstacle.x, obstacle.y - obstacle.height / 2, obstacle.width, obstacle.height);
    context.fillStyle = color.ink;
    context.textAlign = "center";
    context.textBaseline = "middle";
    setCanvasFont(14, "bold");
    context.fillText(obstacle.label, obstacle.x + obstacle.width / 2, obstacle.y);
    context.restore();
  });

  state.pickups.forEach(pickup => {
    const pulse = 1 + Math.sin(state.runTime * 6 + pickup.y * 0.03) * 0.08;
    context.save();
    context.translate(pickup.x, pickup.y);
    context.scale(pulse, pulse);
    context.fillStyle = color.paper;
    context.beginPath();
    context.arc(0, 0, 14, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = color.accent;
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = color.accent;
    context.textAlign = "center";
    context.textBaseline = "middle";
    setCanvasFont(16, "bold");
    context.fillText(pickup.data.glyph || "?", 0, 0);
    context.restore();
  });

  state.enemies.forEach(enemy => {
    context.save();
    context.beginPath();
    context.arc(enemy.x, enemy.y, 15, 0, Math.PI * 2);
    context.fillStyle = color.paper;
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = enemy.data.enemyColor || color.accent;
    context.stroke();
    context.fillStyle = enemy.data.enemyColor || color.accent;
    context.textAlign = "center";
    context.textBaseline = "middle";
    setCanvasFont(22, "bold");
    context.fillText(enemy.letter, enemy.x, enemy.y + 1);
    context.restore();
  });

  state.enemyBullets.forEach(bullet => {
    context.save();
    context.translate(bullet.x, bullet.y);
    context.rotate(bullet.angle);
    context.fillStyle = bullet.color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    setCanvasFont(bullet.type === "word" ? 13 : 17, "bold");
    context.fillText(bullet.glyph, 0, 0);
    context.restore();
  });

  state.explosions.forEach(particle => {
    context.save();
    context.globalAlpha = Math.max(0, particle.life / particle.duration);
    context.fillStyle = particle.color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    setCanvasFont(12 + (1 - particle.life / particle.duration) * 9, "bold");
    context.fillText(particle.glyph, particle.x, particle.y);
    context.restore();
  });

  const px = width * state.player.x;
  const py = height * state.player.y;
  context.fillStyle = color.accent;
  context.beginPath();
  context.arc(px, py, 10, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = color.paper;
  setCanvasFont(10, "bold");
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.fillText("@", px, py + 3.5);

  state.projectiles.forEach(shot => {
    context.save();
    context.translate(shot.x, shot.y);
    context.rotate(shot.angle);
    context.fillStyle = color.accent;
    context.textAlign = "center";
    context.textBaseline = "middle";
    setCanvasFont(18, "bold");
    context.fillText(shot.glyph, 0, 0);
    if (shot.glyph === ".") {
      context.globalAlpha = 0.5;
      context.fillRect(-9, -1, 5, 2);
    }
    context.restore();
  });
  state.beams.forEach(beam => {
    context.save();
    context.translate(beam.x, beam.y);
    context.rotate(beam.angle);
    context.globalAlpha = Math.max(0.15, beam.remaining / beam.duration);
    context.strokeStyle = color.accent;
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(8, 0);
    context.lineTo(beam.length, 0);
    context.stroke();
    context.globalAlpha *= 0.55;
    context.lineWidth = 10;
    context.beginPath();
    context.moveTo(8, 0);
    context.lineTo(beam.length, 0);
    context.stroke();
    context.restore();
  });

}

function update(time) {
  const dt = Math.min((time - state.lastTime) / 1000 || 0, 0.04);
  state.lastTime = time;
  pollGamepad();
  handleGamepadUi(dt);
  const { width, height } = canvas.getBoundingClientRect();
  state.world.deathWallY = height - getDeathWallHeight();

  if (!state.paused && !state.gameOver) {
    state.runTime += dt;
    state.effects = state.effects.map(effect => ({ ...effect, remaining: effect.remaining - dt })).filter(effect => effect.remaining > 0);
    state.pickupMessageTime = Math.max(0, state.pickupMessageTime - dt);
    const controls = readControls();
    const previousPlayerX = state.player.x;
    const previousPlayerY = state.player.y;
    let nextPlayerX = state.player.x + controls.move.x * dt * 0.45;
    let nextPlayerY = state.player.y + controls.move.y * dt * 0.45;
    if (Math.hypot(controls.aim.x, controls.aim.y) > 0.15) state.aim = controls.aim;

    const scrollScale = effectValue("slowScroll", 1);
    const scrollStep = roomSettings.scrollSpeed * scrollScale;
    const scrollDelta = dt * scrollStep;
    state.world.scrollOffset += scrollDelta;
    const previousDepth = Math.floor(state.world.distance / 10);
    state.world.distance += dt * scrollStep;
    state.score += Math.floor(state.world.distance / 10) - previousDepth;

    state.worldSpawnTimer -= dt;
    if (state.worldSpawnTimer <= 0) {
      spawnWorldDrop(width);
      state.worldSpawnTimer = roomSettings.spawnInterval * (0.75 + Math.random() * 0.5);
    }

    state.fireCooldown -= dt;
    const weapon = getWeapon();
    const fireRate = effectValue("modifyFireRate", 1);
    if (controls.fire && state.fireCooldown <= 0) {
      shootWeapon(weapon, state.aim, width, height);
      state.fireCooldown = 1 / Math.max(0.2, (Number(weapon.shotsPerSecond) || 4) * fireRate);
    }
    updatePlayerShots(dt, width, height);
    state.beams = state.beams.map(beam => ({ ...beam, remaining: beam.remaining - dt })).filter(beam => beam.remaining > 0);
    state.obstacles = state.obstacles.filter(obstacle => {
      obstacle.previousY = obstacle.y;
      obstacle.y += dt * scrollStep;
      return obstacle.y < state.world.deathWallY - 12;
    });
    const wallMargin = Math.min(0.18, roomSettings.wallWidth / Math.max(width, 1) + 0.025);
    const minX = wallMargin, maxX = 1 - wallMargin;
    const minY = 0.08, maxY = Math.min(0.98, (state.world.deathWallY - 16) / height);
    nextPlayerX = Math.max(minX, Math.min(maxX, nextPlayerX));
    nextPlayerY = Math.max(minY, Math.min(maxY, nextPlayerY));
    const nextPx = nextPlayerX * width, nextPy = nextPlayerY * height;
    const oldPx = previousPlayerX * width, oldPy = previousPlayerY * height;
    const endCollision = collidesWithObstacle(nextPx, nextPy);
    const sweptCollision = state.obstacles.find(obstacle =>
      segmentHitsObstacle(oldPx, oldPy, nextPx, nextPy, obstacle)
    );

    if (endCollision || sweptCollision) {
      const hitsHorizontalPath = state.obstacles.some(obstacle =>
        collidesWithObstacle(nextPx, oldPy) === obstacle ||
        segmentHitsObstacle(oldPx, oldPy, nextPx, oldPy, obstacle)
      );
      const hitsVerticalPath = state.obstacles.some(obstacle =>
        collidesWithObstacle(oldPx, nextPy) === obstacle ||
        segmentHitsObstacle(oldPx, oldPy, oldPx, nextPy, obstacle)
      );

      const scrollCarry = scrollDelta / height;
      if (!hitsHorizontalPath) {
        nextPlayerY = Math.max(minY, Math.min(maxY, previousPlayerY + scrollCarry));
      } else if (!hitsVerticalPath) {
        nextPlayerX = previousPlayerX;
      } else {
        nextPlayerX = previousPlayerX;
        nextPlayerY = Math.max(minY, Math.min(maxY, previousPlayerY + scrollCarry));
      }
    }
    state.player.x = nextPlayerX;
    state.player.y = nextPlayerY;
    updateEnemySystem(dt, width, height, scrollDelta);
    const playerX = width * state.player.x, playerY = height * state.player.y;
    state.pickups = state.pickups.filter(pickup => {
      pickup.y += dt * scrollStep;
      if (Math.hypot(pickup.x - playerX, pickup.y - playerY) < 22) {
        collectPickup(pickup);
        return false;
      }
      return pickup.y < state.world.deathWallY - 10;
    });

    if (height * state.player.y + 10 >= state.world.deathWallY) loseLife();
  }
  draw();
  requestAnimationFrame(update);
}

function resetRun() {
  const { height } = canvas.getBoundingClientRect();
  state.player = { x: 0.5, y: getPlayerStartY() };
  state.world = { scrollOffset: 0, deathWallY: height - getDeathWallHeight(), distance: 0 };
  state.gameOver = false;
  state.projectiles = [];
  state.beams = [];
  state.enemies = [];
  state.enemyBullets = [];
  state.explosions = [];
  state.enemySpawnIndex = 0;
  state.pickups = [];
  state.obstacles = [];
  state.effects = [];
  state.health = 3;
  state.maxHealth = 3;
  state.lives = 3;
  state.maxLives = 3;
  state.score = 0;
  state.shields = 0;
  state.unlockedWeapons = weaponList.filter(weapon => weapon.unlockedByDefault).map(weapon => weapon.id);
  if (!state.unlockedWeapons.length) state.unlockedWeapons = [weaponList[0].id];
  state.weaponId = state.unlockedWeapons.includes("period") ? "period" : state.unlockedWeapons[0];
  state.worldSpawnTimer = 1.5;
  state.nextWallSide = "left";
  state.runTime = 0;
  state.pickupMessage = "";
  state.pickupMessageTime = 0;
  state.fireCooldown = 0;
  state.paused = dialog.open || !editorPanel.hidden;
  state.keys.clear();
  state.lastTime = 0;
  draw();
}

async function loadHorizontalWallWords() {
  try {
    const response = await fetch(new URL("../data/word-sets/default.json", import.meta.url));
    if (!response.ok) return;
    const wordSet = await response.json();
    if (Array.isArray(wordSet.horizontalWalls) && wordSet.horizontalWalls.length) {
      horizontalWallWords = wordSet.horizontalWalls.filter(word => typeof word === "string" && word.trim()).map(word => word.trim().toUpperCase());
    }
  } catch {
    // Keep the built-in wall words if the editable word set cannot load.
  }
}

function spawnEnemy(width) {
  if (!enemyList.length || state.enemies.length >= 5) return;
  const data = enemyList[state.enemySpawnIndex % enemyList.length];
  state.enemySpawnIndex += 1;
  const left = roomSettings.wallWidth + 18;
  const right = Math.max(left + 1, width - roomSettings.wallWidth - 18);
  const spawnX = left + Math.random() * (right - left);
  state.enemies.push({
    id: data.id, letter: data.letter, data,
    x: spawnX, y: -24,
    originX: spawnX, phase: Math.random() * Math.PI * 2,
    age: 0, direction: Math.random() < 0.5 ? -1 : 1, angle: Math.random() * Math.PI * 2,
    health: Math.max(1, Number(data.health) || 1),
    fireCooldown: Math.random() * Math.max(0.4, Number(data.fireRate) || 1.5)
  });
}

function spawnWorldDrop(width) {
  const roomWidth = Math.max(80, width - roomSettings.wallWidth * 2 - 24);
  const enemyChance = enemyList.length ? 0.3 : 0;
  const pickupChance = pickupList.length ? 0.35 : 0;
  const roll = Math.random();
  if (roll < enemyChance) {
    spawnEnemy(width);
    return;
  }
  if (roll < enemyChance + pickupChance) {
    const totalWeight = pickupList.reduce((sum, item) => sum + Math.max(0, Number(item.weight) || 1), 0);
    let itemRoll = Math.random() * totalWeight;
    const item = pickupList.find(entry => (itemRoll -= Math.max(0, Number(entry.weight) || 1)) <= 0) || pickupList[0];
    const left = roomSettings.wallWidth + 12;
    state.pickups.push({ data: item, x: left + Math.random() * roomWidth, y: -20 });
    return;
  }

  const left = roomSettings.wallWidth + 12;
  const maxWidth = Math.max(0, Math.min(roomWidth * 0.9, roomWidth - 28));
  const minWidth = Math.min(maxWidth, Math.max(72, roomWidth * 0.32));
  const barrierWidth = minWidth + Math.random() * Math.max(0, maxWidth - minWidth);
  const gapSide = state.nextWallSide;
  const x = gapSide === "left" ? left : left + roomWidth - barrierWidth;
  const word = horizontalWallWords[Math.floor(Math.random() * horizontalWallWords.length)] || "STONE";
  setCanvasFont(14, "bold");
  let label = word;
  while (context.measureText(label).width < barrierWidth - 18) label += " · " + word;
  state.obstacles.push({ word, label, x, y: -28, width: barrierWidth, height: 26 });
  state.nextWallSide = gapSide === "left" ? "right" : "left";
}

function obstacleContainsPoint(x, y, obstacle, obstacleY = obstacle.y) {
  const radius = 10;
  return x + radius > obstacle.x && x - radius < obstacle.x + obstacle.width &&
    y + radius > obstacleY - obstacle.height / 2 && y - radius < obstacleY + obstacle.height / 2;
}

function collidesWithObstacle(x, y) {
  return state.obstacles.find(obstacle => obstacleContainsPoint(x, y, obstacle));
}

function segmentHitsObstacle(fromX, fromY, toX, toY, obstacle) {
  const radius = 10;
  const left = obstacle.x - radius;
  const right = obstacle.x + obstacle.width + radius;
  const previousY = Number.isFinite(obstacle.previousY) ? obstacle.previousY : obstacle.y;
  const fromRelativeY = fromY - previousY;
  const toRelativeY = toY - obstacle.y;
  const top = -obstacle.height / 2 - radius;
  const bottom = obstacle.height / 2 + radius;
  let enter = 0;
  let leave = 1;

  for (const [origin, delta, min, max] of [
    [fromX, toX - fromX, left, right],
    [fromRelativeY, toRelativeY - fromRelativeY, top, bottom]
  ]) {
    if (Math.abs(delta) < 0.0001) {
      if (origin < min || origin > max) return false;
      continue;
    }
    let near = (min - origin) / delta;
    let far = (max - origin) / delta;
    if (near > far) [near, far] = [far, near];
    enter = Math.max(enter, near);
    leave = Math.min(leave, far);
    if (enter > leave) return false;
  }
  return leave >= 0 && enter <= 1;
}

async function loadWorldSettings() {
  try {
    const response = await fetch(new URL("../data/settings.json", import.meta.url));
    if (!response.ok) return;
    const settings = await response.json();
    if (Number.isFinite(settings.world?.scrollSpeed)) roomSettings.scrollSpeed = settings.world.scrollSpeed;
    if (Number.isFinite(settings.world?.spawnInterval)) roomSettings.spawnInterval = Math.max(1.5, settings.world.spawnInterval);
    const room = settings.room || {};
    if (Number.isFinite(room.wallWidth)) roomSettings.wallWidth = room.wallWidth;
    if (Number.isFinite(room.glyphSpacing)) roomSettings.glyphSpacing = room.glyphSpacing;
    if (Number.isFinite(settings.wallOfDeath?.height)) roomSettings.deathWallHeight = settings.wallOfDeath.height;
    if (Array.isArray(settings.wallOfDeath?.lines) && settings.wallOfDeath.lines.length >= 2) roomSettings.deathWallLines = settings.wallOfDeath.lines.slice(0, 2);
    applyDeathWallSettings();
    if (typeof room.leftWallGlyphs === "string" && room.leftWallGlyphs.length > 0) roomSettings.leftWallGlyphs = room.leftWallGlyphs;
    if (typeof room.rightWallGlyphs === "string" && room.rightWallGlyphs.length > 0) roomSettings.rightWallGlyphs = room.rightWallGlyphs;
    draw();
  } catch {
    // Use the built-in room values if settings cannot be loaded.
  }
}

function announce(message) {
  menuStatus.textContent = message;
}

function applyFontTheme(theme, persist = false) {
  const selected = Object.hasOwn(fontThemes, theme) ? theme : "dos";
  state.fontTheme = selected;
  document.documentElement.dataset.gameFont = selected;
  fontSelect.value = selected;
  if (persist) {
    try { localStorage.setItem("bulletPoints.fontTheme", selected); } catch {}
  }
  draw();
}

function setCanvasFont(size, weight = "bold") {
  context.font = `${weight} ${size}px ${fontThemes[state.fontTheme].canvas}`;
}

function applyTheme() {
  const color = colors();
  document.documentElement.style.setProperty("--paper", color.paper);
  document.documentElement.style.setProperty("--ink", color.ink);
  document.documentElement.style.setProperty("--accent", color.accent);
  invertButton.setAttribute("aria-pressed", String(state.inverted));
  invertButton.textContent = state.inverted ? uiText.invertOn : uiText.invertOff;
  draw();
}

function openSettings() {
  if (!editorPanel.hidden) {
    editorPanel.hidden = true;
    document.body.classList.remove("editor-open");
  }
  state.paused = true;
  state.keys.clear();
  menuStatus.textContent = "";
  if (!dialog.open) dialog.showModal();
  draw();
  resumeButton.focus();
}

function resumeRun() {
  if (dialog.open) dialog.close();
  state.paused = false;
  state.keys.clear();
  state.lastTime = 0;
  menuButton.focus();
  draw();
}

function editorDraftKey(path) {
  return EDITOR_DRAFT_PREFIX + path;
}

function setEditorStatus(message) {
  editorStatus.textContent = message;
}

function renderEnemyPreview(enemy) {
  if (!enemy) return;
  enemyPreviewLetter.textContent = enemy.letter || "?";
  enemyPreviewLetter.style.color = enemy.enemyColor || "#ffffff";
  enemyPreviewName.textContent = enemy.name || "Unnamed enemy";
  enemyPreviewName.style.color = enemy.enemyColor || "#ffffff";
  const count = Math.max(1, Math.min(24, Number(enemy.explosionCount) || 8));
  explosionPreview.textContent = Array.from({ length: count }, () => enemy.explosionGlyph || enemy.letter || "?").join(" ");
  explosionPreview.style.color = enemy.explosionColor || enemy.enemyColor || "#ffffff";
}

function refreshEnemyRosterFromEditor(data) {
  if (!Array.isArray(data?.enemies)) return;
  enemyList = data.enemies;
  state.enemies.forEach(enemy => {
    const updated = enemyList.find(entry => entry.id === enemy.id);
    if (updated) {
      enemy.data = updated;
      enemy.health = Math.min(enemy.health, Math.max(1, Number(updated.health) || 1));
    }
  });
}

function renderEnemyTuner() {
  const active = editorPath === "../data/enemies.json";
  enemyTuner.hidden = !active;
  if (!active) return;

  let data;
  try { data = JSON.parse(editorText.value); } catch { return; }
  if (!Array.isArray(data.enemies) || !data.enemies.length) return;
  const previousSelection = enemyTunerSelect.value;
  enemyTunerSelect.replaceChildren();
  data.enemies.forEach(enemy => {
    const option = document.createElement("option");
    option.value = enemy.id;
    option.textContent = enemy.letter + " · " + enemy.name;
    enemyTunerSelect.append(option);
  });
  enemyTunerSelect.value = data.enemies.some(enemy => enemy.id === previousSelection) ? previousSelection : data.enemies[0].id;
  const enemy = data.enemies.find(entry => entry.id === enemyTunerSelect.value) || data.enemies[0];
  enemyTunerFields.replaceChildren();

  const schema = [
    { section: "IDENTITY & STATS" },
    { key: "name", label: "Enemy name", type: "text" },
    { key: "health", label: "Health", type: "number", min: 1, max: 99, step: 1 },
    { key: "speed", label: "Movement speed", type: "number", min: 0, max: 500, step: 1 },
    { key: "contactDamage", label: "Contact damage", type: "number", min: 0, max: 20, step: 1 },
    { key: "score", label: "Points", type: "number", min: 0, max: 9999, step: 5 },
    { key: "enemyColor", label: "Enemy color", type: "color" },
    { key: "behavior", label: "Movement", type: "select", options: ["drift","charge","chase","strafe","weave","bounce","swoop","orbit","stalk"] },
    { section: "ATTACK" },
    { key: "shoots", label: "Shoots at player", type: "checkbox" },
    { key: "fireRate", label: "Seconds between shots", type: "number", min: 0.25, max: 12, step: 0.05 },
    { key: "bulletType", label: "Bullet style", type: "select", options: ["dot","letter","word","ring","slash"] },
    { key: "bulletGlyph", label: "Bullet glyph", type: "text" },
    { key: "bulletSpeed", label: "Bullet speed", type: "number", min: 20, max: 900, step: 5 },
    { key: "bulletDamage", label: "Bullet damage", type: "number", min: 0, max: 20, step: 1 },
    { key: "bulletColor", label: "Bullet color", type: "color" },
    { section: "LETTER BURST" },
    { key: "explosionGlyph", label: "Burst letter", type: "text" },
    { key: "explosionCount", label: "Burst letters", type: "number", min: 2, max: 32, step: 1 },
    { key: "explosionDuration", label: "Burst duration", type: "number", min: 0.1, max: 2, step: 0.05 },
    { key: "explosionColor", label: "Burst color", type: "color" }
  ];

  schema.forEach(field => {
    if (field.section) {
      const heading = document.createElement("h4");
      heading.className = "enemy-tuner-section";
      heading.textContent = field.section;
      enemyTunerFields.append(heading);
      return;
    }
    const label = document.createElement("label");
    label.className = "enemy-tuner-field";
    const caption = document.createElement("span");
    caption.textContent = field.label;
    let control;
    if (field.type === "select") {
      control = document.createElement("select");
      field.options.forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value.toUpperCase();
        control.append(option);
      });
      control.value = enemy[field.key] || field.options[0];
    } else {
      control = document.createElement("input");
      control.type = field.type;
      if (field.type === "checkbox") control.checked = Boolean(enemy[field.key]);
      else if (field.type === "color") control.value = /^#[0-9a-f]{6}$/i.test(enemy[field.key] || "") ? enemy[field.key] : "#ffffff";
      else {
        control.value = enemy[field.key] ?? "";
        if (field.type === "number") {
          control.min = field.min;
          control.max = field.max;
          control.step = field.step;
        }
      }
    }
    control.addEventListener(field.type === "select" ? "change" : "input", () => {
      const roster = parsedEditorData();
      const target = roster?.enemies?.find(entry => entry.id === enemyTunerSelect.value);
      if (!target) return;
      target[field.key] = field.type === "checkbox" ? control.checked
        : field.type === "number" ? Number(control.value)
        : control.value;
      editorText.value = JSON.stringify(roster, null, 2);
      editorText.dispatchEvent(new Event("input", { bubbles: true }));
      refreshEnemyRosterFromEditor(roster);
      renderEnemyPreview(target);
    });
    label.append(caption, control);
    enemyTunerFields.append(label);
  });
  renderEnemyPreview(enemy);
}

async function loadEditorFile(path, allowDiscard = false) {
  if (editorDirty && !allowDiscard && !window.confirm("Discard unsaved editor changes?")) {
    editorFileSelect.value = editorPath;
    return;
  }
  editorPath = path;
  editorFileSelect.value = path;
  editorFilePath.textContent = path.replace("../", "");
  editorDirty = false;
  try {
    const draft = localStorage.getItem(editorDraftKey(path));
    if (draft !== null) {
      editorText.value = draft;
      setEditorStatus("Loaded your browser-local draft. Save it as a file when ready.");
      renderEnemyTuner();
      try { refreshEnemyRosterFromEditor(JSON.parse(draft)); } catch {}
      editorLoaded = true;
      return;
    }
  } catch {
    // Continue by loading the repository version if local storage is unavailable.
  }
  try {
    const response = await fetch(new URL(path, import.meta.url));
    if (!response.ok) throw new Error("HTTP " + response.status);
    const data = await response.text();
    JSON.parse(data);
    editorText.value = JSON.stringify(JSON.parse(data), null, 2);
    setEditorStatus("Loaded the repository version.");
    renderEnemyTuner();
    if (path === "../data/enemies.json") refreshEnemyRosterFromEditor(JSON.parse(data));
    editorLoaded = true;
  } catch {
    editorText.value = "";
    setEditorStatus("Could not load this file. Run the game through the local web server.");
    renderEnemyTuner();
  }
}

function parsedEditorData() {
  try {
    return JSON.parse(editorText.value);
  } catch (error) {
    setEditorStatus("JSON error: " + error.message);
    return null;
  }
}

function toggleEditor(forceOpen) {
  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : editorPanel.hidden;
  if (shouldOpen) {
    if (dialog.open) dialog.close();
    state.paused = true;
    state.keys.clear();
    editorPanel.hidden = false;
    document.body.classList.add("editor-open");
    if (!editorLoaded) loadEditorFile(editorFileSelect.value, true);
    editorFileSelect.focus();
  } else {
    editorPanel.hidden = true;
    document.body.classList.remove("editor-open");
    state.paused = dialog.open;
    state.keys.clear();
    state.lastTime = 0;
    menuButton.focus();
    draw();
  }
}

function saveEditorDraft() {
  if (parsedEditorData() === null) return;
  try {
    localStorage.setItem(editorDraftKey(editorPath), editorText.value);
    editorDirty = false;
    setEditorStatus("Draft saved in this browser. Download the file to keep or share it.");
  } catch {
    setEditorStatus("Browser storage unavailable. Use Download File to keep this edit.");
  }
}

function downloadEditorFile() {
  const parsed = parsedEditorData();
  if (parsed === null) return;
  const blob = new Blob([JSON.stringify(parsed, null, 2) + "\n"], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = editorPath.replace("../data/", "").replaceAll("/", "-");
  link.click();
  URL.revokeObjectURL(url);
  editorDirty = false;
  setEditorStatus("Downloaded " + link.download + ".");
}

function resetEditorFile() {
  if (!window.confirm("Remove the local draft and reload this repository file?")) return;
  try {
    localStorage.removeItem(editorDraftKey(editorPath));
  } catch {
    // The file can still be reloaded even if browser storage is blocked.
  }
  editorDirty = false;
  loadEditorFile(editorPath, true);
}

function slotKey(slot) {
  return SLOT_PREFIX + slot;
}

function readSlot(slot) {
  try {
    const raw = localStorage.getItem(slotKey(slot));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatSavedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved run";
  return "Saved " + date.toLocaleString();
}

function saveCurrentRun(slot) {
  const previous = readSlot(slot);
  if (previous && !window.confirm(uiText.replacePrompt + slot + "?")) return;
  const snapshot = {
    schemaVersion: 1,
    savedAt: new Date().toISOString(),
    player: { x: state.player.x, y: state.player.y },
    world: { ...state.world },
    inverted: state.inverted,
    soundEnabled: state.soundEnabled,
    controlScheme: state.controlScheme,
    health: state.health,
    maxHealth: state.maxHealth,
    lives: state.lives,
    score: state.score,
    shields: state.shields,
    weaponId: state.weaponId,
    unlockedWeapons: [...state.unlockedWeapons],
  };
  try {
    localStorage.setItem(slotKey(slot), JSON.stringify(snapshot));
    announce(uiText.savedMessage + slot + ".");
    renderSaveSlots();
  } catch {
    announce(uiText.saveFailed);
  }
}

function loadRun(slot) {
  const snapshot = readSlot(slot);
  if (!snapshot || snapshot.schemaVersion !== 1 || !snapshot.player) {
    announce(uiText.clearedMessage + slot + uiText.loadEmpty);
    return;
  }
  state.player = {
    x: Number.isFinite(snapshot.player.x) ? Math.max(0.04, Math.min(0.96, snapshot.player.x)) : 0.5,
    y: Number.isFinite(snapshot.player.y) ? Math.max(0.08, Math.min(getPlayerStartY(), snapshot.player.y)) : getPlayerStartY(),
  };
  if (snapshot.world && Number.isFinite(snapshot.world.scrollOffset)) {
    state.world = {
      scrollOffset: snapshot.world.scrollOffset,
      deathWallY: Number.isFinite(snapshot.world.deathWallY) ? snapshot.world.deathWallY : canvas.getBoundingClientRect().height - getDeathWallHeight(),
      distance: Number.isFinite(snapshot.world.distance) ? snapshot.world.distance : 0,
    };
  } else {
    const { height } = canvas.getBoundingClientRect();
    state.world = { scrollOffset: 0, deathWallY: height - roomSettings.deathWallHeight, distance: 0 };
  }
  state.gameOver = false;
  state.health = Number.isFinite(snapshot.health) ? snapshot.health : 3;
  state.maxHealth = Number.isFinite(snapshot.maxHealth) ? snapshot.maxHealth : 3;
  state.lives = Number.isFinite(snapshot.lives) ? Math.max(0, Math.min(3, snapshot.lives)) : 3;
  state.maxLives = 3;
  state.score = Number.isFinite(snapshot.score) ? Math.max(0, snapshot.score) : 0;
  state.shields = Number.isFinite(snapshot.shields) ? snapshot.shields : 0;
  state.unlockedWeapons = Array.isArray(snapshot.unlockedWeapons) ? snapshot.unlockedWeapons.filter(id => weaponList.some(weapon => weapon.id === id)) : weaponList.filter(weapon => weapon.unlockedByDefault).map(weapon => weapon.id);
  if (!state.unlockedWeapons.length) state.unlockedWeapons = [weaponList[0].id];
  state.weaponId = state.unlockedWeapons.includes(snapshot.weaponId) ? snapshot.weaponId : state.unlockedWeapons[0];
  state.pickups = [];
  state.obstacles = [];
  state.worldSpawnTimer = 1.5;
  state.nextWallSide = "left";
  state.effects = [];
  state.inverted = Boolean(snapshot.inverted);
  state.soundEnabled = snapshot.soundEnabled !== false;
  state.controlScheme = ["auto","keyboard","gamepad","touch"].includes(snapshot.controlScheme) ? snapshot.controlScheme : "auto";
  soundToggle.checked = state.soundEnabled;
  document.querySelector('input[name="control-scheme"][value="' + state.controlScheme + '"]').checked = true;
  applyControlScheme();
  applyTheme();
  announce(uiText.loadSuccess + slot + ".");
}

function clearSlot(slot) {
  if (!window.confirm(uiText.clearPrompt + slot + "?")) return;
  try {
    localStorage.removeItem(slotKey(slot));
    announce(uiText.clearedMessage + slot + " cleared.");
    renderSaveSlots();
  } catch {
    announce(uiText.clearFailed);
  }
}

function renderSaveSlots() {
  slotList.replaceChildren();
  for (let slot = 1; slot <= SLOT_COUNT; slot += 1) {
    const snapshot = readSlot(slot);
    const card = document.createElement("article");
    card.className = "save-slot";

    const description = document.createElement("div");
    const title = document.createElement("p");
    title.className = "slot-title";
    title.textContent = uiText.slotName.replace("{slot}", slot);
    const detail = document.createElement("p");
    detail.className = "slot-detail";
    detail.textContent = snapshot ? formatSavedAt(snapshot.savedAt) : uiText.empty;
    description.append(title, detail);

    const actions = document.createElement("div");
    actions.className = "slot-actions";
    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.textContent = uiText.save;
    saveButton.addEventListener("click", () => saveCurrentRun(slot));
    const loadButton = document.createElement("button");
    loadButton.type = "button";
    loadButton.textContent = uiText.load;
    loadButton.disabled = !snapshot;
    loadButton.addEventListener("click", () => loadRun(slot));
    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.textContent = uiText.clear;
    clearButton.disabled = !snapshot;
    clearButton.addEventListener("click", () => clearSlot(slot));
    actions.append(saveButton, loadButton, clearButton);

    card.append(description, actions);
    slotList.append(card);
  }
}

async function applyMenuCopy() {
  try {
    const response = await fetch(new URL("../data/menu.json", import.meta.url));
    if (!response.ok) return;
    const menu = await response.json();
    if (menu.title) document.title = menu.title;
    Object.assign(uiText, menu.settingsMenu || {});
    document.querySelector("#settings-title").textContent = uiText.title;
    menuButton.textContent = uiText.pauseSettings;
    resumeButton.textContent = uiText.resume;
    document.querySelector("#display-heading").textContent = uiText.displayHeading;
    document.querySelector("#ink-label").textContent = uiText.inkLabel;
    document.querySelector("#sound-label").textContent = uiText.soundLabel;
    document.querySelector("#font-label").textContent = uiText.fontLabel || "Game font";
    document.querySelector("#sound-note").textContent = uiText.soundNote;
    document.querySelector("#controls-heading").textContent = uiText.controlsHeading;
    document.querySelector("#auto-label").textContent = uiText.auto;
    document.querySelector("#keyboard-label").textContent = uiText.keyboard;
    document.querySelector("#gamepad-label").textContent = uiText.gamepad;
    document.querySelector("#touch-label").textContent = uiText.touch;
    document.querySelector("#touch-note").textContent = uiText.touchNote;
    document.querySelector("#slots-heading").textContent = uiText.saveSlots;
    document.querySelector("#slot-storage-note").textContent = uiText.storageNote;
    restartButton.textContent = uiText.restart;
    renderSaveSlots();
    applyTheme();
  } catch {
    // Keep the built-in labels if the menu text file is unavailable.
  }
}

bindStick(leftStick,leftStickKnob,"move");
bindStick(rightStick,rightStickKnob,"aim");
window.addEventListener("resize",()=>{applyControlScheme();applyDeathWallSettings();resizeCanvas();});
canvas.addEventListener("pointermove",e=>{
  if(e.pointerType==="touch"||["gamepad","touch"].includes(state.controlScheme))return;
  const b=canvas.getBoundingClientRect(),dx=e.clientX-b.left-b.width*state.player.x,dy=e.clientY-b.top-b.height*state.player.y,len=Math.hypot(dx,dy);
  if(len>8)input.mouseAim={x:dx/len,y:dy/len};
});
canvas.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"&&["auto","keyboard"].includes(state.controlScheme))input.mouseFire=true;});
window.addEventListener("pointerup",e=>{if(e.pointerType==="mouse")input.mouseFire=false;});
window.addEventListener("blur",()=>{state.keys.clear();input.mouseFire=false;input.touchFire=false;input.touchMove={x:0,y:0};input.touchAim={x:0,y:0};});
window.addEventListener("keydown", (event) => {
  if (event.key === "F8") {
    event.preventDefault();
    toggleEditor();
    return;
  }
  if (event.key === "Escape" && !editorPanel.hidden) {
    event.preventDefault();
    toggleEditor(false);
    return;
  }
  if (event.key === "Escape" && dialog.open) {
    event.preventDefault();
    resumeRun();
    return;
  }
  if (dialog.open) {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) event.preventDefault();
    return;
  }
  if (!editorPanel.hidden) return;
  if (state.gameOver && event.key.toLowerCase() === "r") {
    event.preventDefault();
    resetRun();
    return;
  }
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (["auto", "keyboard"].includes(state.controlScheme)) {
    if ((controlMap.keyboard.weaponPrev || ["q"]).includes(key)) { event.preventDefault(); cycleWeapon(-1); return; }
    if ((controlMap.keyboard.weaponNext || ["e"]).includes(key)) { event.preventDefault(); cycleWeapon(1); return; }
  }
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(key)) event.preventDefault();
  state.keys.add(key);
});
window.addEventListener("keyup", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  state.keys.delete(key);
});
window.addEventListener("blur", () => state.keys.clear());

editorToggleButton.addEventListener("click", () => toggleEditor());
editorCloseButton.addEventListener("click", () => toggleEditor(false));
editorFileSelect.addEventListener("change", async () => {
  await loadEditorFile(editorFileSelect.value);
  renderEnemyTuner();
});
editorText.addEventListener("input", () => {
  editorDirty = true;
  setEditorStatus("Unsaved edits. Check the JSON before saving your draft.");
  if (editorPath === "../data/enemies.json") {
    try {
      const data = JSON.parse(editorText.value);
      refreshEnemyRosterFromEditor(data);
      const enemy = data.enemies?.find(entry => entry.id === enemyTunerSelect.value);
      if (enemy) renderEnemyPreview(enemy);
    } catch {}
  }
});
enemyTunerSelect.addEventListener("change", renderEnemyTuner);
editorValidateButton.addEventListener("click", () => {
  if (parsedEditorData() !== null) setEditorStatus("JSON is valid.");
});
editorSaveButton.addEventListener("click", saveEditorDraft);
editorDownloadButton.addEventListener("click", downloadEditorFile);
editorResetButton.addEventListener("click", resetEditorFile);
menuButton.addEventListener("click", openSettings);
resumeButton.addEventListener("click", resumeRun);
closeMenuButton.addEventListener("click", resumeRun);
dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  resumeRun();
});
invertButton.addEventListener("click", () => {
  state.inverted = !state.inverted;
  applyTheme();
});
fontSelect.addEventListener("change", () => applyFontTheme(fontSelect.value, true));
soundToggle.addEventListener("change", () => {
  state.soundEnabled = soundToggle.checked;
  announce(state.soundEnabled ? uiText.soundEnabled : uiText.soundMuted);
});
document.querySelectorAll('input[name="control-scheme"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    if (!radio.checked) return;
    state.controlScheme = radio.value;
    applyControlScheme();
    announce(({auto:uiText.autoSelected,keyboard:uiText.keyboardSelected,gamepad:uiText.gamepadSelected,touch:uiText.touchSelected})[radio.value]);
  });
});
restartButton.addEventListener("click", () => {
  if (!window.confirm(uiText.restartPrompt)) return;
  resetRun();
  announce(uiText.restartSuccess);
});

renderSaveSlots();
applyMenuCopy();
try { applyFontTheme(localStorage.getItem("bulletPoints.fontTheme") || "dos"); } catch { applyFontTheme("dos"); }
applyControlScheme();
applyDeathWallSettings();
state.player.y = getPlayerStartY();
loadControlMap();
loadCombatData();
loadWorldSettings();
loadHorizontalWallWords();
resizeCanvas();
requestAnimationFrame(update);
