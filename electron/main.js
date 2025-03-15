const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const ServerProcess = require('./server');

// Keep a global reference of the window object to avoid garbage collection
let mainWindow;
let serverProcess;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../build/icon.png')
  });

  // Load the app
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../dist/index.html'),
    protocol: 'file:',
    slashes: true
  });
  
  mainWindow.loadURL(startUrl);

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.whenReady().then(() => {
  // Start the server in production mode
  if (process.env.NODE_ENV === 'production') {
    serverProcess = new ServerProcess();
    serverProcess.start();
  }

  createWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', function () {
  // On macOS applications keep their menu bar active until the user quits explicitly
  if (process.platform !== 'darwin') app.quit();
});

// Clean up resources before quitting
app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.stop();
  }
});

app.on('activate', function () {
  // On macOS re-create a window when dock icon is clicked and no other windows open
  if (mainWindow === null) createWindow();
});

// Handle IPC messages from renderer process
ipcMain.handle('get-app-path', () => app.getPath('userData'));