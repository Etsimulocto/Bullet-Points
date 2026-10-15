const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
const menuButton = document.querySelector("#menu-button");
const dialog = document.querySelector("#settings-dialog");
const resumeButton = document.querySelector("#resume-button");
const closeMenuButton = document.querySelector("#close-menu");
const invertButton = document.querySelector("#invert-button");
const soundToggle = document.querySelector("#sound-toggle");
const slotList = document.querySelector("#save-slots");
const menuStatus = document.querySelector("#menu-status");
const restartButton = document.querySelector("#restart-button");

const palette = {
  paper: "#f4f0e6",
  ink: "#191919",
  accent: "#d84b3e",
};
const SLOT_PREFIX = "bulletPoints.saveSlot.";
const SLOT_COUNT = 3;

const state = {
  inverted: false,
  paused: false,
  soundEnabled: true,
  controlScheme: "keyboard",
  keys: new Set(),
  player: { x: 0.5, y: 0.76 },
  lastTime: 0,
};

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

function draw() {
  const { width, height } = canvas.getBoundingClientRect();
  const color = colors();
  context.clearRect(0, 0, width, height);
  context.fillStyle = color.paper;
  context.fillRect(0, 0, width, height);

  context.fillStyle = color.ink;
  context.font = "14px 'Courier New', monospace";
  context.textAlign = "center";
  context.fillText("THE DUNGEON IS A SENTENCE", width / 2, height * 0.31);
  context.fillStyle = color.accent;
  context.font = "bold 11px 'Courier New', monospace";
  context.fillText(state.paused ? "PAUSED · TAKE YOUR TIME" : "MOVE · AIM · SURVIVE", width / 2, height * 0.37);

  const px = width * state.player.x;
  const py = height * state.player.y;
  context.fillStyle = color.accent;
  context.beginPath();
  context.arc(px, py, 10, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = color.paper;
  context.font = "bold 10px 'Courier New', monospace";
  context.fillText("@", px, py + 3.5);
}

function update(time) {
  const dt = Math.min((time - state.lastTime) / 1000 || 0, 0.04);
  state.lastTime = time;
  if (!state.paused) {
    const speed = dt * 0.45;
    if (state.keys.has("ArrowLeft") || state.keys.has("a")) state.player.x -= speed;
    if (state.keys.has("ArrowRight") || state.keys.has("d")) state.player.x += speed;
    if (state.keys.has("ArrowUp") || state.keys.has("w")) state.player.y -= speed;
    if (state.keys.has("ArrowDown") || state.keys.has("s")) state.player.y += speed;
    state.player.x = Math.max(0.04, Math.min(0.96, state.player.x));
    state.player.y = Math.max(0.08, Math.min(0.92, state.player.y));
  }
  draw();
  requestAnimationFrame(update);
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
  invertButton.textContent = state.inverted ? "INVERT INK: ON" : "INVERT INK: OFF";
  draw();
}

function openSettings() {
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
  if (previous && !window.confirm("Replace Save Slot " + slot + "?")) return;
  const snapshot = {
    schemaVersion: 1,
    savedAt: new Date().toISOString(),
    player: { x: state.player.x, y: state.player.y },
    inverted: state.inverted,
    soundEnabled: state.soundEnabled,
    controlScheme: state.controlScheme,
  };
  try {
    localStorage.setItem(slotKey(slot), JSON.stringify(snapshot));
    announce("Saved to Slot " + slot + ".");
    renderSaveSlots();
  } catch {
    announce("Could not save. Browser storage may be unavailable.");
  }
}

function loadRun(slot) {
  const snapshot = readSlot(slot);
  if (!snapshot || snapshot.schemaVersion !== 1 || !snapshot.player) {
    announce("Slot " + slot + " has no readable save.");
    return;
  }
  state.player = {
    x: Number.isFinite(snapshot.player.x) ? Math.max(0.04, Math.min(0.96, snapshot.player.x)) : 0.5,
    y: Number.isFinite(snapshot.player.y) ? Math.max(0.08, Math.min(0.92, snapshot.player.y)) : 0.76,
  };
  state.inverted = Boolean(snapshot.inverted);
  state.soundEnabled = snapshot.soundEnabled !== false;
  state.controlScheme = snapshot.controlScheme === "touch" ? "touch" : "keyboard";
  soundToggle.checked = state.soundEnabled;
  document.querySelector('input[name="control-scheme"][value="' + state.controlScheme + '"]').checked = true;
  applyTheme();
  announce("Loaded Slot " + slot + ".");
}

function clearSlot(slot) {
  if (!window.confirm("Clear Save Slot " + slot + "?")) return;
  try {
    localStorage.removeItem(slotKey(slot));
    announce("Slot " + slot + " cleared.");
    renderSaveSlots();
  } catch {
    announce("Could not clear this save slot.");
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
    title.textContent = "SAVE SLOT " + slot;
    const detail = document.createElement("p");
    detail.className = "slot-detail";
    detail.textContent = snapshot ? formatSavedAt(snapshot.savedAt) : "EMPTY";
    description.append(title, detail);

    const actions = document.createElement("div");
    actions.className = "slot-actions";
    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.textContent = "SAVE";
    saveButton.addEventListener("click", () => saveCurrentRun(slot));
    const loadButton = document.createElement("button");
    loadButton.type = "button";
    loadButton.textContent = "LOAD";
    loadButton.disabled = !snapshot;
    loadButton.addEventListener("click", () => loadRun(slot));
    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.textContent = "CLEAR";
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
    const labels = menu.settingsMenu;
    if (!labels) return;
    document.querySelector("#settings-title").textContent = labels.title || "PAUSED / SETTINGS";
    resumeButton.textContent = labels.resume || "RESUME RUN";
    document.querySelector("#slots-heading").textContent = labels.saveSlots || "SAVE SLOTS";
    restartButton.textContent = labels.restart || "RESTART RUN";
  } catch {
    // Keep the built-in labels if the menu text file is unavailable.
  }
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && dialog.open) {
    event.preventDefault();
    resumeRun();
    return;
  }
  if (dialog.open) {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) event.preventDefault();
    return;
  }
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(key)) event.preventDefault();
  state.keys.add(key);
});
window.addEventListener("keyup", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  state.keys.delete(key);
});
window.addEventListener("blur", () => state.keys.clear());

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
  announce(state.soundEnabled ? "Sound effects enabled." : "Sound effects muted.");
});
document.querySelectorAll('input[name="control-scheme"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    if (!radio.checked) return;
    state.controlScheme = radio.value;
    announce(radio.value === "touch" ? "Dual mobile sticks selected; touch input is a future build step." : "Keyboard and mouse selected.");
  });
});
restartButton.addEventListener("click", () => {
  if (!window.confirm("Restart this run?")) return;
  state.player = { x: 0.5, y: 0.76 };
  state.keys.clear();
  announce("Run restarted.");
  draw();
});

renderSaveSlots();
applyMenuCopy();
resizeCanvas();
requestAnimationFrame(update);
