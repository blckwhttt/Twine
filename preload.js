const { contextBridge, ipcRenderer, desktopCapturer } = require('electron');

const imageToDataUrl = (image) => {
  if (!image || image.isEmpty()) {
    return null;
  }

  try {
    return image.toDataURL();
  } catch (error) {
    console.error('[Electron preload] Failed to convert nativeImage to data URL', error);
    return null;
  }
};

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  getScreenSources: async (options = {}) => {
    const {
      types = ['screen', 'window'],
      thumbnailSize = { width: 480, height: 270 },
      fetchWindowIcons = true,
    } = options ?? {};

    try {
      const sources = await desktopCapturer.getSources({
        types,
        thumbnailSize,
        fetchWindowIcons,
      });

      return sources.map((source) => ({
        id: source.id,
        name: source.name,
        type: source.id.startsWith('screen:') ? 'screen' : 'window',
        displayId: source.display_id ?? null,
        thumbnail: imageToDataUrl(source.thumbnail),
        appIcon: imageToDataUrl(source.appIcon),
      }));
    } catch (error) {
      console.error('[Electron preload] Failed to fetch screen sources', error);
      throw error;
    }
  },
});

// Примечание: для splash screen мы используем прямой ipcRenderer в splash.html
// так как это отдельное окно которое не требует такой же изоляции как основное приложение
