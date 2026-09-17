const { app, BrowserWindow, Tray, Menu, screen, nativeImage, shell, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const APP_NAME = "Ammi";
app.setName(APP_NAME);
if (process.platform === "win32") app.setAppUserModelId("app.ammi.desktop");

const CONFIG_PATH = () => path.join(app.getPath("userData"), "config.json");

const REMINDERS = [
  { key: "water", label: "Pani pee lo / Water" },
  { key: "food", label: "Khana kha liya? / Food" },
  { key: "break", label: "Thora chal lo / Break" },
  { key: "eyes", label: "Ankhon ko aaram do / Eyes" },
  { key: "tea", label: "Chai bana doon? / Tea" },
  { key: "posture", label: "Seedhi tarhan baitho / Posture" },
  { key: "late", label: "Ab so jao / Sleep" },
  { key: "charger", label: "Charger laga lo / Charger" },
  { key: "medicine", label: "Dawai le li? / Medicine" },
  { key: "morning", label: "Subha bakhair / Morning" },
  { key: "call", label: "Phone karna / Call home" },
  { key: "praise", label: "Shabash mera bacha / Praise" },
  { key: "phone", label: "Phone rakh do / Screen break" },
  { key: "dua", label: "Duaon mein yaad / Prayer" },
];

function iconImage() {
  try {
    const iconPath = path.join(__dirname, "..", "build", "tray.png");
    if (fs.existsSync(iconPath)) {
      const buf = fs.readFileSync(iconPath);
      const img = nativeImage.createFromBuffer(buf);
      if (!img.isEmpty()) return img;
    }
  } catch {
    /* ignore */
  }
  return nativeImage.createEmpty();
}

// Create Desktop + Start Menu shortcuts the first time the app runs
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
  language: "urdu",
  energy: "playful",
  tone: "playful",
  appearance: "classic",
  onboardingComplete: false,
  enabled: REMINDERS.map((r) => r.key),
};

let config = { ...defaults };
let win = null;
let dashboardWin = null;
let onboardingWin = null;
let tray = null;

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
  if (dashboardWin && !dashboardWin.isDestroyed()) dashboardWin.webContents.send("config", config);
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

function createOnboardingWindow() {
  if (onboardingWin && !onboardingWin.isDestroyed()) {
    onboardingWin.focus();
    return;
  }
  if (process.platform === "darwin" && app.dock) {
    app.dock.show();
  }
  onboardingWin = new BrowserWindow({
    width: 580,
    height: 640,
    center: true,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    backgroundColor: "#000000",
    autoHideMenuBar: true,
    icon: path.join(__dirname, "..", "build", "tray.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  onboardingWin.loadFile(path.join(__dirname, "..", "public", "onboarding.html"));
}

function createDashboardWindow() {
  if (dashboardWin && !dashboardWin.isDestroyed()) {
    dashboardWin.show();
    dashboardWin.focus();
    return;
  }
  if (process.platform === "darwin" && app.dock) {
    app.dock.show();
  }
  dashboardWin = new BrowserWindow({
    width: 980,
    height: 720,
    minWidth: 820,
    minHeight: 600,
    center: true,
    frame: false,
    titleBarStyle: "hidden",
    backgroundColor: "#000000",
    icon: path.join(__dirname, "..", "build", "tray.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  dashboardWin.loadFile(path.join(__dirname, "..", "public", "dashboard.html"));
  dashboardWin.webContents.on("did-finish-load", () => {
    dashboardWin.webContents.send("config", config);
  });
  dashboardWin.on("closed", () => {
    dashboardWin = null;
  });
}

ipcMain.on("onboarding:finish", (_e, data) => {
  if (data) {
    if (data.language) config.language = data.language;
    if (data.energy) config.energy = data.energy;
  }
  config.onboardingComplete = true;
  saveConfig();

  if (onboardingWin && !onboardingWin.isDestroyed()) {
    onboardingWin.close();
  }

  // Open the full desktop app dashboard
  createDashboardWindow();

  // Also start the companion overlay in the background
  if (!win || win.isDestroyed()) {
    createWindow();
  }
  buildTray();
  push();
});

ipcMain.on("config:patch", (_e, patch) => {
  set(patch);
});

ipcMain.on("say:now", (_e, key) => {
  if (win && !win.isDestroyed()) {
    win.webContents.send("say", key);
  }
});

ipcMain.on("powerup:preview", (_e, name) => {
  if (win && !win.isDestroyed()) {
    win.webContents.send("powerup", name);
  }
});

ipcMain.on("dashboard:minimize", () => {
  if (dashboardWin && !dashboardWin.isDestroyed()) {
    dashboardWin.minimize();
  }
});

ipcMain.on("dashboard:close", () => {
  if (dashboardWin && !dashboardWin.isDestroyed()) {
    dashboardWin.hide();
  }
});

ipcMain.on("set-ignore-mouse-events", (event, ignore, options) => {
  const targetWin = BrowserWindow.fromWebContents(event.sender);
  if (targetWin && !targetWin.isDestroyed()) {
    targetWin.setIgnoreMouseEvents(ignore, options);
  }
});

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
}

function radio(label, checked, click) {
  return { label, type: "checkbox", checked, click };
}

function buildTray() {
  if (!tray) {
    const image = iconImage();
    tray = new Tray(image.isEmpty() ? image : image.resize({ width: 16, height: 16 }));
    tray.setToolTip(`${APP_NAME} — someone's looking out for you`);
    tray.on("click", () => {
      if (dashboardWin && !dashboardWin.isDestroyed()) {
        if (dashboardWin.isVisible()) {
          dashboardWin.hide();
        } else {
          dashboardWin.show();
          dashboardWin.focus();
        }
      } else {
        createDashboardWindow();
      }
    });
  }
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: `${APP_NAME}`, enabled: false },
      {
        label: "Open Dashboard",
        click: () => createDashboardWindow(),
      },
      { type: "separator" },
      {
        label: "Say something now",
        click: () => win && !win.isDestroyed() && win.webContents.send("say"),
      },
      { type: "separator" },
      {
        label: "Language",
        submenu: [
          radio("English", config.language === "english", () => set({ language: "english" })),
          radio("Urdu", config.language === "urdu", () => set({ language: "urdu" })),
          radio("German", config.language === "german", () => set({ language: "german" })),
          radio("Punjabi", config.language === "punjabi", () => set({ language: "punjabi" })),
        ],
      },
      {
        label: "Mom energy",
        submenu: [
          radio("Gentle (Soft nudges)", config.energy === "gentle", () => set({ energy: "gentle" })),
          radio("Playful (Loving & light)", config.energy === "playful", () => set({ energy: "playful" })),
          radio("Extra dramatic (Full mom energy)", config.energy === "dramatic", () => set({ energy: "dramatic" })),
        ],
      },
      {
        label: "Screen position",
        submenu: [
          radio("Center", config.position === "center", () => set({ position: "center" })),
          radio("Left", config.position === "left", () => set({ position: "left" })),
          radio("Right", config.position === "right", () => set({ position: "right" })),
        ],
      },
      {
        label: "English translation",
        type: "checkbox",
        checked: !!config.translation,
        click: () => set({ translation: !config.translation }),
      },
      {
        label: "Pause reminders",
        type: "checkbox",
        checked: !config.auto,
        click: () => set({ auto: !config.auto }),
      },
      {
        label: "Frequency",
        submenu: [
          radio("Every 15 min", config.interval === 15 * 60, () => set({ interval: 15 * 60 })),
          radio("Every 25 min", config.interval === 25 * 60, () => set({ interval: 25 * 60 })),
          radio("Every 45 min", config.interval === 45 * 60, () => set({ interval: 45 * 60 })),
          radio("Every 60 min", config.interval === 60 * 60, () => set({ interval: 60 * 60 })),
        ],
      },
      {
        label: "Reminders",
        submenu: REMINDERS.map((r) => radio(r.label, config.enabled.includes(r.key), () => toggleReminder(r.key))),
      },
      { type: "separator" },
      ...(process.platform === "win32"
        ? [
            {
              label: "Start with Windows",
              type: "checkbox",
              checked: startsWithWindows(),
              click: (item) => {
                try {
                  app.setLoginItemSettings({
                    openAtLogin: item.checked,
                    path: process.execPath,
                    args: ["--hidden"],
                  });
                } catch {
                  /* ignore */
                }
              },
            },
          ]
        : []),
      { type: "separator" },
      { label: "Quit", click: () => app.quit() },
    ]),
  );
}

app.whenReady().then(() => {
  loadConfig();
  ensureShortcuts();
  if (process.platform === "darwin" && app.dock) {
    if (!config.onboardingComplete) {
      app.dock.show();
    } else {
      app.dock.hide();
    }
  }
  if (!config.onboardingComplete) {
    createOnboardingWindow();
  } else {
    createWindow();
    createDashboardWindow();
  }
  buildTray();
});

app.on("window-all-closed", (e) => {
  // Prevent quitting so the tray and overlay stay alive in the background
  e.preventDefault();
});
