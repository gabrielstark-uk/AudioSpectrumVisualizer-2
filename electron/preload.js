const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    getAppPath: () => ipcRenderer.invoke('get-app-path'),
    // Add any other methods you need to expose here
  }
);