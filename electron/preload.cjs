const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("swingers", {
  onConfig: (cb) => ipcRenderer.on("config", (_e, cfg) => cb(cfg)),
  onCursor: (cb) => ipcRenderer.on("cursor", (_e, pos) => cb(pos)),
});
