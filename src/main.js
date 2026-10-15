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

const palette = {
  paper: "#f4f0e6",
  ink: "#191919",
  accent: "#d84b3e",
};
const SLOT_PREFIX = "bulletPoints.saveSlot.";
const SLOT_COUNT = 3;
const EDITOR_DRAFT_PREFIX = "bulletPoints.editorDraft.";
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
  touch: "Dual mobile sticks",
  touchNote: "(input support is planned)",
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
  keyboardSelected: "Keyboard and mouse selected.",
  touchSelected: "Dual mobile sticks selected; touch input is a future build step."
};

let editorDirty = false;
let editorLoaded = false;
let editorPath = "";

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
    inverted: state.inverted,
    soundEnabled: state.soundEnabled,
    controlScheme: state.controlScheme,
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
    y: Number.isFinite(snapshot.player.y) ? Math.max(0.08, Math.min(0.92, snapshot.player.y)) : 0.76,
  };
  state.inverted = Boolean(snapshot.inverted);
  state.soundEnabled = snapshot.soundEnabled !== false;
  state.controlScheme = snapshot.controlScheme === "touch" ? "touch" : "keyboard";
  soundToggle.checked = state.soundEnabled;
  document.querySelector('input[name="control-scheme"][value="' + state.controlScheme + '"]').checked = true;
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
    document.querySelector("#keyboard-label").textContent = uiText.keyboard;
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

window.addEventListener("resize", resizeCanvas);
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
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
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
    announce(radio.value === "touch" ? uiText.touchSelected : uiText.keyboardSelected);
  });
});
restartButton.addEventListener("click", () => {
  if (!window.confirm(uiText.restartPrompt)) return;
  state.player = { x: 0.5, y: 0.76 };
  state.keys.clear();
  announce(uiText.restartSuccess);
  draw();
});

renderSaveSlots();
applyMenuCopy();
resizeCanvas();
requestAnimationFrame(update);
