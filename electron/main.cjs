const { app, BrowserWindow, Tray, Menu, screen, nativeImage, shell } = require("electron");
const path = require("path");
const fs = require("fs");

const APP_NAME = "Danglers";
app.setName(APP_NAME);
if (process.platform === "win32") app.setAppUserModelId("wtf.danglers.app");

const CONFIG_PATH = () => path.join(app.getPath("userData"), "config.json");

function iconImage() {
  const image = nativeImage.createFromPath(path.join(__dirname, "..", "build", "tray.png"));
  return image.isEmpty() ? nativeImage.createEmpty() : image;
}

// Create Desktop + Start Menu shortcuts the first time the app runs,
// so it can be started by double-clicking an icon.
function ensureShortcuts() {
  if (process.platform !== "win32") return;
  const stamp = path.join(app.getPath("userData"), "shortcuts.json");
  if (fs.existsSync(stamp)) return;
  const options = {
    target: process.execPath,
    icon: process.execPath,
    iconIndex: 0,
    description: `${APP_NAME} — unnecessary shit on your screen`,
    appUserModelId: "wtf.danglers.app",
  };
  const targets = [
    path.join(app.getPath("desktop"), `${APP_NAME}.lnk`),
    path.join(app.getPath("appData"), "Microsoft", "Windows", "Start Menu", "Programs", `${APP_NAME}.lnk`),
  ];
  for (const link of targets) {
    try {
      shell.writeShortcutLink(link, "create", options);
    } catch {
      /* ignore */
    }
  }
  try {
    fs.writeFileSync(stamp, JSON.stringify({ created: Date.now() }));
  } catch {
    /* ignore */
  }
}

function startsWithWindows() {
  try {
    return app.getLoginItemSettings().openAtLogin;
  } catch {
    return false;
  }
}

const defaults = {
  mode: "swing",
  anchor: 0.5,
  rope: 190,
  amplitude: 34,
  period: 2.6,
  loops: false,
  twoSeater: false,
  corner: "left",
  palette: 0,
};

let config = { ...defaults };
let win = null;
let tray = null;
let cursorTimer = null;

function loadConfig() {
  try {
    config = { ...defaults, ...JSON.parse(fs.readFileSync(CONFIG_PATH(), "utf8")) };
  } catch {
    config = { ...defaults };
  }
}

function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_PATH(), JSON.stringify(config));
  } catch {
    /* ignore */
  }
}

function push() {
  if (win && !win.isDestroyed()) win.webContents.send("config", config);
  saveConfig();
  buildTray();
}

function set(patch) {
  config = { ...config, ...patch };
  push();
}

function createWindow() {
  const { bounds } = screen.getPrimaryDisplay();
  win = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    transparent: true,
    frame: false,
    resizable: false,
    movable: false,
    hasShadow: false,
    skipTaskbar: true,
    focusable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  win.setIgnoreMouseEvents(true, { forward: true });
  win.setAlwaysOnTop(true, "screen-saver");
  win.loadFile(path.join(__dirname, "..", "public", "overlay.html"));
  win.webContents.on("did-finish-load", () => push());

  cursorTimer = setInterval(() => {
    if (!win || win.isDestroyed()) return;
    const p = screen.getCursorScreenPoint();
    win.webContents.send("cursor", { x: p.x - bounds.x, y: p.y - bounds.y });
  }, 60);
}

function radio(label, checked, click) {
  return { label, type: "checkbox", checked, click };
}

function buildTray() {
  if (!tray) {
    const image = iconImage();
    tray = new Tray(image.isEmpty() ? image : image.resize({ width: 16, height: 16 }));
    tray.setToolTip(APP_NAME);
  }
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "swingers", enabled: false },
      { type: "separator" },
      radio("Hang a swing", config.mode === "swing", () => set({ mode: "swing" })),
      radio("Park a sitter", config.mode === "sitter", () => set({ mode: "sitter" })),
      { type: "separator" },
      {
        label: "Rope length",
        submenu: [120, 190, 280, 380].map((v) => radio(`${v} px`, config.rope === v, () => set({ rope: v }))),
      },
      {
        label: "Amplitude",
        submenu: [16, 34, 55, 80].map((v) => radio(`${v}°`, config.amplitude === v, () => set({ amplitude: v }))),
      },
      {
        label: "Speed",
        submenu: [
          radio("Lazy", config.period === 4, () => set({ period: 4 })),
          radio("Normal", config.period === 2.6, () => set({ period: 2.6 })),
          radio("Hyper", config.period === 1.6, () => set({ period: 1.6 })),
        ],
      },
      {
        label: "Position",
        submenu: [
          radio("Left", config.anchor === 0.25, () => set({ anchor: 0.25 })),
          radio("Middle", config.anchor === 0.5, () => set({ anchor: 0.5 })),
          radio("Right", config.anchor === 0.75, () => set({ anchor: 0.75 })),
        ],
      },
      { type: "separator" },
      radio("Full loops", config.loops, () => set({ loops: !config.loops })),
      radio("Two-seater", config.twoSeater, () => set({ twoSeater: !config.twoSeater })),
      {
        label: "Sitter corner",
        submenu: [
          radio("Left", config.corner === "left", () => set({ corner: "left" })),
          radio("Right", config.corner === "right", () => set({ corner: "right" })),
        ],
      },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() },
    ]),
  );
}

app.whenReady().then(() => {
  loadConfig();
  createWindow();
  buildTray();
});

app.on("window-all-closed", () => {
  if (cursorTimer) clearInterval(cursorTimer);
  app.quit();
});
