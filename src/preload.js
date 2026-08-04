const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('chmReader', {
  listLibrary: () => ipcRenderer.invoke('library:list'),
  importBooks: (collectionId) => ipcRenderer.invoke('library:import', collectionId),
  openLibraryBook: (id) => ipcRenderer.invoke('library:open', id),
  removeLibraryBook: (id) => ipcRenderer.invoke('library:remove', id),
  createCollection: (name) => ipcRenderer.invoke('collection:create', name),
  renameCollection: (id, name) => ipcRenderer.invoke('collection:rename', id, name),
  removeCollection: (id) => ipcRenderer.invoke('collection:remove', id),
  createBookUrl: (topicPath) => ipcRenderer.invoke('book:url', topicPath),
  searchBook: (query) => ipcRenderer.invoke('book:search', query),
  setTextEncoding: (encoding) => ipcRenderer.invoke('book:encoding', encoding),
  openExternal: (url) => ipcRenderer.invoke('external:open', url),
  onBookOpened: (callback) => {
    const listener = (_, book) => callback(book);
    ipcRenderer.on('book:opened', listener);
    return () => ipcRenderer.removeListener('book:opened', listener);
  },
  onBookIndexReady: (callback) => {
    const listener = (_, result) => callback(result);
    ipcRenderer.on('book:index-ready', listener);
    return () => ipcRenderer.removeListener('book:index-ready', listener);
  },
  onLibraryUpdated: (callback) => {
    const listener = (_, entries) => callback(entries);
    ipcRenderer.on('library:updated', listener);
    return () => ipcRenderer.removeListener('library:updated', listener);
  },
  onShowLibrary: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('library:show', listener);
    return () => ipcRenderer.removeListener('library:show', listener);
  },
  onFocusSearch: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('navigation:focus-search', listener);
    return () => ipcRenderer.removeListener('navigation:focus-search', listener);
  },
});
