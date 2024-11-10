import { app, Tray, Menu, BrowserWindow, MenuItem, Event } from 'electron';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import path from 'node:path';
import {ApiService} from "./server/api-service.js";

// @ts-ignore
global.require = createRequire(import.meta.url);
// @ts-ignore
globalThis.__filename = fileURLToPath(import.meta.url);
globalThis.__dirname = path.dirname(__filename);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow;

function createWindow() {
  const mainWindow = new BrowserWindow({
    icon: './src/static/logo-32x32.png',
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: 'preload.js'
    }
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile('./renderer/${MAIN_WINDOW_VITE_NAME}/index.html');
  }

  function onWindowClose(e: Event) {
    mainWindow.removeListener('close', onWindowClose);
    mainWindow.hide();
    e.preventDefault();

    return false;
  }

  mainWindow.addListener('close', onWindowClose);

  return mainWindow;
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
  const trayButton = new Tray('./src/static/logo-192x192.png');

  trayButton.setContextMenu(Menu.buildFromTemplate([
    new MenuItem({label: 'Close', click: () => { app.quit(); }}),
  ]));

  trayButton.setTitle('Sensor');

  trayButton.addListener('click', showMainWindow);

  return trayButton;
}

app.whenReady().then(async () => {
  const apiService = new ApiService();
  await apiService.initialize();

  createTray();

  await apiService.start();
});
