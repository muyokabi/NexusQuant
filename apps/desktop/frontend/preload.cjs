const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (method, args) => ipcRenderer.invoke('invoke', { method, args })
});
