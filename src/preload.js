const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('chmReader', {
  openBook: () => ipcRenderer.invoke('book:open'),
  createBookUrl: (topicPath) => ipcRenderer.invoke('book:url', topicPath),
  openExternal: (url) => ipcRenderer.invoke('external:open', url),
  onBookOpened: (callback) => {
    const listener = (_, book) => callback(book);
    ipcRenderer.on('book:opened', listener);
    return () => ipcRenderer.removeListener('book:opened', listener);
  },
  onFocusSearch: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('navigation:focus-search', listener);
    return () => ipcRenderer.removeListener('navigation:focus-search', listener);
  },
});
