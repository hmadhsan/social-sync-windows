const { app, BrowserWindow, Tray, Menu, screen, nativeImage, shell } = require("electron");
const path = require("path");
const fs = require("fs");

const APP_NAME = "Ammi";
app.setName(APP_NAME);
if (process.platform === "win32") app.setAppUserModelId("app.ammi.desktop");

const CONFIG_PATH = () => path.join(app.getPath("userData"), "config.json");

const REMINDERS = [
  { key: "water", label: "Pani pee lo" },
  { key: "food", label: "Khana kha liya?" },
  { key: "break", label: "Thora chal lo" },
  { key: "eyes", label: "Ankhon ko aaram do" },
  { key: "tea", label: "Chai bana doon?" },
  { key: "posture", label: "Seedhi tarhan baitho" },
  { key: "late", label: "Ab so jao" },
  { key: "charger", label: "Charger laga lo" },
  { key: "medicine", label: "Dawai le li?" },
  { key: "morning", label: "Subha bakhair" },
  { key: "call", label: "Phone karna" },
  { key: "praise", label: "Shabash mera bacha" },
  { key: "phone", label: "Phone rakh do" },
  { key: "dua", label: "Duaon mein yaad" },
];

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
    description: `${APP_NAME} — someone's looking out for you`,
    appUserModelId: "app.ammi.desktop",
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
  position: "center",
  interval: 25 * 60,
  visible: 9,
  translation: true,
  scale: 1,
  auto: true,
  enabled: REMINDERS.map((r) => r.key),
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
  if (!Array.isArray(config.enabled) || !config.enabled.length) config.enabled = defaults.enabled;
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

function toggleReminder(key) {
  const on = config.enabled.includes(key);
  const next = on ? config.enabled.filter((k) => k !== key) : [...config.enabled, key];
  set({ enabled: next.length ? next : config.enabled });
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
    tray.setToolTip(`${APP_NAME} — someone's looking out for you`);
  }
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: `${APP_NAME}`, enabled: false },
      { type: "separator" },
      {
        label: "Say something now",
        click: () => win && !win.isDestroyed() && win.webContents.send("say"),
      },
      { type: "separator" },
      {
        label: "How often she checks in",
        submenu: [
          ["Every 10 minutes", 10 * 60],
          ["Every 25 minutes", 25 * 60],
          ["Every hour", 60 * 60],
          ["Every 2 hours", 120 * 60],
        ].map(([label, v]) => radio(label, config.interval === v, () => set({ interval: v }))),
      },
      {
        label: "How long she stays",
        submenu: [
          ["A quick word (6s)", 6],
          ["Normal (9s)", 9],
          ["A proper chat (16s)", 16],
        ].map(([label, v]) => radio(label, config.visible === v, () => set({ visible: v }))),
      },
      {
        label: "Where she appears",
        submenu: [
          radio("Top left", config.position === "left", () => set({ position: "left" })),
          radio("Top centre", config.position === "center", () => set({ position: "center" })),
          radio("Top right", config.position === "right", () => set({ position: "right" })),
        ],
      },
      {
        label: "Her size",
        submenu: [
          ["Small", 0.8],
          ["Normal", 1],
          ["Large", 1.3],
        ].map(([label, v]) => radio(label, config.scale === v, () => set({ scale: v }))),
      },
      { type: "separator" },
      {
        label: "What she reminds you about",
        submenu: REMINDERS.map((r) =>
          radio(r.label, config.enabled.includes(r.key), () => toggleReminder(r.key)),
        ),
      },
      radio("Show English translation", config.translation, () =>
        set({ translation: !config.translation }),
      ),
      radio("Pause her reminders", !config.auto, () => set({ auto: !config.auto })),
      { type: "separator" },
      radio("Start with Windows", startsWithWindows(), () => {
        try {
          app.setLoginItemSettings({ openAtLogin: !startsWithWindows(), path: process.execPath });
        } catch {
          /* ignore */
        }
        buildTray();
      }),
      {
        label: "Put an icon on my desktop",
        click: () => {
          if (process.platform !== "win32") return;
          try {
            shell.writeShortcutLink(path.join(app.getPath("desktop"), `${APP_NAME}.lnk`), "create", {
              target: process.execPath,
              icon: process.execPath,
              iconIndex: 0,
              description: `${APP_NAME} — someone's looking out for you`,
              appUserModelId: "app.ammi.desktop",
            });
          } catch {
            /* ignore */
          }
        },
      },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() },
    ]),
  );
}

app.whenReady().then(() => {
  loadConfig();
  ensureShortcuts();
  createWindow();
  buildTray();
});

app.on("window-all-closed", () => {
  if (cursorTimer) clearInterval(cursorTimer);
  app.quit();
});
