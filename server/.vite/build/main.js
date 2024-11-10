var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { app, Tray, Menu, MenuItem, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";
import createExpress from "express";
class Server {
  constructor() {
    __publicField(this, "engine");
  }
  async initialize() {
    this.engine = createExpress();
    this.engine.post("/tracker_update", (request, response) => {
      console.log(request, response);
    });
    this.engine.delete("/tracker/:id", (request, response) => {
      console.log(request, response);
    });
  }
  async start() {
    this.engine.listen(3300, function() {
      console.log("Сервер запущен по адресу http://localhost:3300");
    });
  }
}
global.require = createRequire(import.meta.url);
globalThis.__filename = fileURLToPath(import.meta.url);
globalThis.__dirname = path.dirname(__filename);
if (require("electron-squirrel-startup")) {
  app.quit();
}
let mainWindow;
function createWindow() {
  const mainWindow2 = new BrowserWindow({
    icon: "./src/static/logo-32x32.png",
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: "preload.js"
    }
  });
  {
    mainWindow2.loadURL("http://localhost:5173");
  }
  function onWindowClose(e) {
    mainWindow2.removeListener("close", onWindowClose);
    mainWindow2.hide();
    e.preventDefault();
    return false;
  }
  mainWindow2.addListener("close", onWindowClose);
  return mainWindow2;
}
function showMainWindow() {
  if (mainWindow) {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
    return;
  }
  mainWindow = createWindow();
}
function createTray() {
  const trayButton = new Tray("./src/static/logo-192x192.png");
  trayButton.setContextMenu(Menu.buildFromTemplate([
    new MenuItem({ label: "Close", click: () => {
      app.quit();
    } })
  ]));
  trayButton.setTitle("Sensor");
  trayButton.addListener("click", showMainWindow);
  return trayButton;
}
app.whenReady().then(async () => {
  const server = new Server();
  await server.initialize();
  createTray();
  await server.start();
});
