const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ammi", {
  onConfig: (cb) => ipcRenderer.on("config", (_e, cfg) => cb(cfg)),
  onCursor: (cb) => ipcRenderer.on("cursor", (_e, pos) => cb(pos)),
  onSay: (cb) => ipcRenderer.on("say", (_e, key) => cb(key)),
  onPowerup: (cb) => ipcRenderer.on("powerup", (_e, name) => cb(name)),
  finishOnboarding: (data) => ipcRenderer.send("onboarding:finish", data),
  updateConfig: (patch) => ipcRenderer.send("config:patch", patch),
  sayNow: (key) => ipcRenderer.send("say:now", key),
  previewPowerup: (name) => ipcRenderer.send("powerup:preview", name),
  minimizeDashboard: () => ipcRenderer.send("dashboard:minimize"),
  closeDashboard: () => ipcRenderer.send("dashboard:close"),
  setIgnoreMouseEvents: (ignore, options) => ipcRenderer.send("set-ignore-mouse-events", ignore, options),
});
