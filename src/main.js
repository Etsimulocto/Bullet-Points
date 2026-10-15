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
const controlMap = {keyboard:{moveUp:["w","ArrowUp"],moveDown:["s","ArrowDown"],moveLeft:["a","ArrowLeft"],moveRight:["d","ArrowRight"],aimUp:["i"],aimDown:["k"],aimLeft:["j"],aimRight:["l"],fire:[" "]},gamepad:{deadzone:.18,moveAxes:{x:0,y:1},aimAxes:{x:2,y:3},fireButtons:[0,7],dpad:{up:12,down:13,left:14,right:15}},touch:{deadzone:.12,fireWhileRightStickHeld:true}};
const input = {pad:null,move:{x:0,y:0},aim:{x:0,y:0},touchMove:{x:0,y:0},touchAim:{x:0,y:0},touchFire:false,mouseAim:{x:0,y:0},mouseFire:false};
let lastGamepadMessage = "";

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
let horizontalWallWords = ["STONE", "BARRIER", "PARAGRAPH", "BLOCK"];
const state = {
  inverted: false, paused: false, soundEnabled: true, controlScheme: "auto", keys: new Set(),
  player: { x: 0.5, y: 0.76 }, projectiles: [], beams: [], pickups: [], obstacles: [], effects: [],
  fireCooldown: 0, aim: { x: 0, y: -1 }, gameOver: false,
  health: 3, maxHealth: 3, lives: 3, maxLives: 3, score: 0, shields: 0, weaponId: "period", unlockedWeapons: ["period"],
  worldSpawnTimer: 1.5, nextWallSide: "left", runTime: 0, pickupMessage: "", pickupMessageTime: 0,
  gamepadPrevDown: false, gamepadNextDown: false,
  world: { scrollOffset: 0, deathWallY: null, distance: 0 }, lastTime: 0,
};

async function loadCombatData() {
  try {
    const [weaponResponse, pickupResponse] = await Promise.all([
      fetch(new URL("../data/weapons.json", import.meta.url)),
      fetch(new URL("../data/pickups.json", import.meta.url))
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
  const fire=(useK&&(kb.fire||[]).some(k=>state.keys.has(k)|| (k===" "&&state.keys.has(" "))))||(useK&&input.mouseFire)||(useG&&input.pad&&(controlMap.gamepad.fireButtons||[]).some(i=>input.pad.buttons[i]?.pressed))||(useT&&input.touchFire&&controlMap.touch.fireWhileRightStickHeld);
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
  context.font = "bold 13px 'Courier New', monospace";
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

function loseLife() {
  state.lives = Math.max(0, state.lives - 1);
  if (state.lives === 0) {
    state.gameOver = true;
    state.paused = true;
    state.keys.clear();
    return;
  }
  state.player = { x: 0.5, y: getPlayerStartY() };
  state.health = state.maxHealth;
  state.projectiles = [];
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
    context.font = "bold 14px Courier New, monospace";
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
    context.font = "bold 16px 'Courier New', monospace";
    context.fillText(pickup.data.glyph || "?", 0, 0);
    context.restore();
  });

  const px = width * state.player.x;
  const py = height * state.player.y;
  context.fillStyle = color.accent;
  context.beginPath();
  context.arc(px, py, 10, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = color.paper;
  context.font = "bold 10px 'Courier New', monospace";
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
    context.font = "bold 18px 'Courier New', monospace";
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
    state.world.scrollOffset += dt * scrollStep;
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
    state.projectiles = state.projectiles.filter(shot => {
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
      shot.angle = Math.atan2(shot.vy, shot.vx);
      return shot.x >= -20 && shot.x <= width + 20 && shot.y >= -20 && shot.y <= height + 20;
    });
    state.beams = state.beams.map(beam => ({ ...beam, remaining: beam.remaining - dt })).filter(beam => beam.remaining > 0);
    state.obstacles = state.obstacles.filter(obstacle => {
      obstacle.y += dt * scrollStep;
      return obstacle.y < state.world.deathWallY - 12;
    });
    const wallMargin = Math.min(0.18, roomSettings.wallWidth / Math.max(width, 1) + 0.025);
    const minX = wallMargin, maxX = 1 - wallMargin;
    const minY = 0.08, maxY = Math.min(0.98, (state.world.deathWallY - 16) / height);
    nextPlayerX = Math.max(minX, Math.min(maxX, nextPlayerX));
    nextPlayerY = Math.max(minY, Math.min(maxY, nextPlayerY));
    const nextPx = nextPlayerX * width, nextPy = nextPlayerY * height;
    if (collidesWithObstacle(nextPx, nextPy)) {
      const oldPx = previousPlayerX * width, oldPy = previousPlayerY * height;
      if (!collidesWithObstacle(nextPx, oldPy)) nextPlayerY = previousPlayerY;
      else if (!collidesWithObstacle(oldPx, nextPy)) nextPlayerX = previousPlayerX;
      else {
        const obstacle = collidesWithObstacle(nextPx, nextPy);
        nextPlayerY = Math.max(minY, (obstacle.y - obstacle.height / 2 - 12) / height);
      }
    }
    state.player.x = nextPlayerX;
    state.player.y = nextPlayerY;
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

function spawnWorldDrop(width) {
  const roomWidth = Math.max(80, width - roomSettings.wallWidth * 2 - 24);
  if (pickupList.length && Math.random() < 0.46) {
    const totalWeight = pickupList.reduce((sum, item) => sum + Math.max(0, Number(item.weight) || 1), 0);
    let roll = Math.random() * totalWeight;
    const item = pickupList.find(entry => (roll -= Math.max(0, Number(entry.weight) || 1)) <= 0) || pickupList[0];
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
  context.font = "bold 14px Courier New, monospace";
  let label = word;
  while (context.measureText(label).width < barrierWidth - 18) label += " · " + word;
  state.obstacles.push({ word, label, x, y: -28, width: barrierWidth, height: 26 });
  state.nextWallSide = gapSide === "left" ? "right" : "left";
}

function collidesWithObstacle(x, y) {
  const radius = 10;
  return state.obstacles.find(obstacle =>
    x + radius > obstacle.x && x - radius < obstacle.x + obstacle.width &&
    y + radius > obstacle.y - obstacle.height / 2 && y - radius < obstacle.y + obstacle.height / 2
  );
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
    editorLoaded = true;
  } catch {
    editorText.value = "";
    setEditorStatus("Could not load this file. Run the game through the local web server.");
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
editorFileSelect.addEventListener("change", () => loadEditorFile(editorFileSelect.value));
editorText.addEventListener("input", () => {
  editorDirty = true;
  setEditorStatus("Unsaved edits. Check the JSON before saving your draft.");
});
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
applyControlScheme();
applyDeathWallSettings();
state.player.y = getPlayerStartY();
loadControlMap();
loadCombatData();
loadWorldSettings();
loadHorizontalWallWords();
resizeCanvas();
requestAnimationFrame(update);
