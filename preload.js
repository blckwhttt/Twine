const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
});

// Примечание: для splash screen мы используем прямой ipcRenderer в splash.html
// так как это отдельное окно которое не требует такой же изоляции как основное приложение
