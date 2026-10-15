const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
const invertButton = document.querySelector("#invert-button");

const palette = {
  paper: "#f4f0e6",
  ink: "#191919",
  accent: "#d84b3e",
};

const state = {
  inverted: false,
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
  context.fillText("MOVE · AIM · SURVIVE", width / 2, height * 0.37);

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
  const speed = dt * 0.45;
  if (state.keys.has("ArrowLeft") || state.keys.has("a")) state.player.x -= speed;
  if (state.keys.has("ArrowRight") || state.keys.has("d")) state.player.x += speed;
  if (state.keys.has("ArrowUp") || state.keys.has("w")) state.player.y -= speed;
  if (state.keys.has("ArrowDown") || state.keys.has("s")) state.player.y += speed;
  state.player.x = Math.max(0.04, Math.min(0.96, state.player.x));
  state.player.y = Math.max(0.08, Math.min(0.92, state.player.y));
  draw();
  requestAnimationFrame(update);
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(key)) event.preventDefault();
  state.keys.add(key);
});
window.addEventListener("keyup", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  state.keys.delete(key);
});
window.addEventListener("blur", () => state.keys.clear());

invertButton.addEventListener("click", () => {
  state.inverted = !state.inverted;
  invertButton.setAttribute("aria-pressed", String(state.inverted));
  document.documentElement.style.setProperty("--paper", state.inverted ? palette.ink : palette.paper);
  document.documentElement.style.setProperty("--ink", state.inverted ? palette.paper : palette.ink);
  draw();
});

resizeCanvas();
requestAnimationFrame(update);
