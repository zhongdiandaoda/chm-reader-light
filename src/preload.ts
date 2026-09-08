export {};

import type { BookContentsItem, SearchResult } from './chm';

interface LibraryBook {
  id: string;
  name: string;
  filePath?: string;
  storedName?: string;
  addedAt?: number;
  lastOpenedAt?: number;
  collectionId: string | null;
  sourceMissing?: boolean;
}

interface LibraryCollection {
  id: string;
  name: string;
  createdAt?: number;
}

interface LibraryState {
  collections: LibraryCollection[];
  books: LibraryBook[];
}

interface OpenedBook {
  name: string;
  filePath: string;
  contents: BookContentsItem[];
  defaultPage: string | null;
  searchablePageCount: number;
  textEncoding: string | null;
}

interface IndexReady {
  searchablePageCount: number;
}

type Unsubscribe = () => void;
type Listener<T> = (...args: T[]) => void;
type ReaderShortcutCommand =
  | 'history-back'
  | 'history-forward'
  | 'previous-topic'
  | 'next-topic'
  | 'find-next'
  | 'find-previous'
  | 'toggle-sidebar'
  | 'zoom-out'
  | 'zoom-in'
  | 'zoom-reset';

interface ChmReaderApi {
  listLibrary: () => Promise<LibraryState>;
  importBooks: (collectionId: string | null) => Promise<LibraryState | null>;
  importDroppedFiles: (files: readonly File[], collectionId: string | null) => Promise<LibraryState>;
  openLibraryBook: (id: string) => Promise<OpenedBook | null>;
  removeLibraryBook: (id: string) => Promise<LibraryState>;
  revealLibraryBook: (id: string) => Promise<unknown>;
  relinkLibraryBook: (id: string) => Promise<LibraryState | null>;
  copyText: (text: string) => Promise<unknown>;
  createCollection: (name: string) => Promise<LibraryState>;
  renameCollection: (id: string, name: string) => Promise<LibraryState>;
  removeCollection: (id: string) => Promise<LibraryState>;
  createBookUrl: (topicPath: string | null) => Promise<string | null>;
  searchBook: (query: string) => Promise<SearchResult[]>;
  setTextEncoding: (encoding: string) => Promise<OpenedBook | { textEncoding: string | null }>;
  setView: (view: 'library' | 'reader') => Promise<unknown>;
  openExternal: (url: string) => Promise<unknown>;
  onBookOpened: (callback: (book: OpenedBook) => void) => Unsubscribe;
  onBookIndexReady: (callback: (result: IndexReady) => void) => Unsubscribe;
  onLibraryUpdated: (callback: (entries: LibraryState) => void) => Unsubscribe;
  onShowLibrary: (callback: () => void) => Unsubscribe;
  onFocusSearch: (callback: () => void) => Unsubscribe;
  onReaderShortcut: (callback: (command: ReaderShortcutCommand) => void) => Unsubscribe;
}

const { contextBridge, ipcRenderer, webUtils } = require('electron') as {
  contextBridge: {
    exposeInMainWorld: (name: string, api: ChmReaderApi) => void;
  };
  webUtils: {
    getPathForFile: (file: File) => string;
  };
  ipcRenderer: {
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
    on: (channel: string, listener: Listener<[unknown, unknown]>) => void;
    removeListener: (channel: string, listener: Listener<[unknown, unknown]>) => void;
  };
};

const chmReader: ChmReaderApi = {
  listLibrary: () => ipcRenderer.invoke('library:list') as Promise<LibraryState>,
  importBooks: (collectionId) => ipcRenderer.invoke('library:import', collectionId) as Promise<LibraryState | null>,
  importDroppedFiles: (files, collectionId) => {
    const filePaths = files
      .map((file) => webUtils.getPathForFile(file))
      .filter(Boolean);
    return ipcRenderer.invoke('library:import-paths', filePaths, collectionId) as Promise<LibraryState>;
  },
  openLibraryBook: (id) => ipcRenderer.invoke('library:open', id) as Promise<OpenedBook | null>,
  removeLibraryBook: (id) => ipcRenderer.invoke('library:remove', id) as Promise<LibraryState>,
  revealLibraryBook: (id) => ipcRenderer.invoke('library:reveal', id),
  relinkLibraryBook: (id) => ipcRenderer.invoke('library:relink', id) as Promise<LibraryState | null>,
  copyText: (text) => ipcRenderer.invoke('clipboard:write-text', text),
  createCollection: (name) => ipcRenderer.invoke('collection:create', name) as Promise<LibraryState>,
  renameCollection: (id, name) => ipcRenderer.invoke('collection:rename', id, name) as Promise<LibraryState>,
  removeCollection: (id) => ipcRenderer.invoke('collection:remove', id) as Promise<LibraryState>,
  createBookUrl: (topicPath) => ipcRenderer.invoke('book:url', topicPath) as Promise<string | null>,
  searchBook: (query) => ipcRenderer.invoke('book:search', query) as Promise<SearchResult[]>,
  setTextEncoding: (encoding) => ipcRenderer.invoke('book:encoding', encoding) as Promise<OpenedBook | { textEncoding: string | null }>,
  setView: (view) => ipcRenderer.invoke('view:set', view),
  openExternal: (url) => ipcRenderer.invoke('external:open', url),
  onBookOpened: (callback) => {
    const listener = (_event: unknown, book: unknown) => callback(book as OpenedBook);
    ipcRenderer.on('book:opened', listener);
    return () => ipcRenderer.removeListener('book:opened', listener);
  },
  onBookIndexReady: (callback) => {
    const listener = (_event: unknown, result: unknown) => callback(result as IndexReady);
    ipcRenderer.on('book:index-ready', listener);
    return () => ipcRenderer.removeListener('book:index-ready', listener);
  },
  onLibraryUpdated: (callback) => {
    const listener = (_event: unknown, entries: unknown) => callback(entries as LibraryState);
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
  onReaderShortcut: (callback) => {
    const listener = (_event: unknown, command: unknown) => callback(command as ReaderShortcutCommand);
    ipcRenderer.on('reader:shortcut', listener);
    return () => ipcRenderer.removeListener('reader:shortcut', listener);
  },
};

contextBridge.exposeInMainWorld('chmReader', chmReader);
