const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ammi", {
  onConfig: (cb) => ipcRenderer.on("config", (_e, cfg) => cb(cfg)),
  onCursor: (cb) => ipcRenderer.on("cursor", (_e, pos) => cb(pos)),
  onSay: (cb) => ipcRenderer.on("say", () => cb()),
  finishOnboarding: (data) => ipcRenderer.send("onboarding:finish", data),
});
