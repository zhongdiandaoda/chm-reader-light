export { };

import type {
  BrowserWindow as BrowserWindowType,
  IpcMainInvokeEvent,
} from 'electron';
import type { Worker as WorkerType } from 'node:worker_threads';
import type {
  BookContentsItem,
  BookMetadata,
  ExtractBookOptions,
  SearchIndexEntry,
  SearchResult,
} from './chm';

const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  net,
  protocol,
  shell,
} = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');
const { Worker } = require('node:worker_threads');
const { pathToFileURL } = require('node:url');
const {
  decodeMarkup,
  extractBook,
  highlightSearchMatches,
  injectContentNavigationBridge,
  readExtractedBook,
  resolveBookResource,
  searchBookContents,
} = require('./chm') as typeof import('./chm');
const { renameCollectionInLibrary } = require('./library') as typeof import('./library');

protocol.registerSchemesAsPrivileged([{
  scheme: 'chm',
  privileges: {
    standard: true,
    secure: true,
    supportFetchAPI: true,
  },
}]);

interface LibraryBook {
  id: string;
  name: string;
  filePath?: string;
  storedName?: string;
  addedAt?: number;
  collectionId: string | null;
}

interface LibraryCollection {
  id: string;
  name: string;
  createdAt?: number;
  [key: string]: unknown;
}

interface LibraryState {
  collections: LibraryCollection[];
  books: LibraryBook[];
  [key: string]: unknown;
}

interface OpenedBook {
  name: string;
  filePath: string;
  contents: BookContentsItem[];
  defaultPage: string | null;
  searchablePageCount: number;
  textEncoding: string | null;
}

interface SearchIndexWorkerMessage {
  searchIndex?: SearchIndexEntry[];
  error?: { message: string; stack?: string };
}

let mainWindow: BrowserWindowType | undefined;
let bookRoot: string | undefined;
let bookSearchIndex: SearchIndexEntry[] = [];
let bookTextEncoding: string | null = null;
let currentBookPath: string | null = null;
let currentBookName: string | null = null;
let bookRootIsCached = false;
let searchIndexWorker: WorkerType | undefined;
let searchIndexGeneration = 0;
let pendingFile: string | undefined;
let currentView: 'library' | 'reader' = 'library';
let isQuitting = false;

function getLiveMainWindow(): BrowserWindowType | null {
  if (!mainWindow) return null;
  if (mainWindow.isDestroyed()) {
    mainWindow = undefined;
    return null;
  }
  return mainWindow;
}

function sendToMainWindow(channel: string, ...args: unknown[]): void {
  const targetWindow = getLiveMainWindow();
  if (!targetWindow || targetWindow.webContents.isDestroyed()) return;
  targetWindow.webContents.send(channel, ...args);
}

function getLibraryDir(): string {
  return path.join(app.getPath('userData'), 'library');
}

function getLibraryIndexPath(): string {
  return path.join(getLibraryDir(), 'library.json');
}

function getExtractCacheDir(): string {
  return path.join(app.getPath('userData'), 'extracted-books');
}

async function getExtractCacheRoot(chmPath: string): Promise<string> {
  const stats = await fs.promises.stat(chmPath);
  const cacheKey = createHash('sha256')
    .update(path.resolve(chmPath))
    .update('\0')
    .update(String(stats.size))
    .update('\0')
    .update(String(Math.trunc(stats.mtimeMs)))
    .digest('hex');
  return path.join(getExtractCacheDir(), cacheKey);
}

function normalizeLibrary(parsed: unknown): LibraryState {
  if (Array.isArray(parsed)) {
    return {
      collections: [],
      books: parsed.map((book) => ({
        ...(typeof book === 'object' && book !== null ? book : {}),
        collectionId: null,
      })) as LibraryBook[],
    };
  }
  return {
    collections: Array.isArray((parsed as { collections?: unknown[] })?.collections)
      ? (parsed as { collections: LibraryCollection[] }).collections
      : [],
    books: Array.isArray((parsed as { books?: unknown[] })?.books)
      ? (parsed as { books: LibraryBook[] }).books
      : [],
  };
}

async function readLibrary(): Promise<LibraryState> {
  try {
    const raw = await fs.promises.readFile(getLibraryIndexPath(), 'utf-8');
    return normalizeLibrary(JSON.parse(raw));
  } catch {
    return { collections: [], books: [] };
  }
}

async function writeLibrary(library: LibraryState): Promise<void> {
  await fs.promises.mkdir(getLibraryDir(), { recursive: true });
  await fs.promises.writeFile(getLibraryIndexPath(), JSON.stringify(library, null, 2));
}

async function importBooks(
  filePaths: readonly string[],
  collectionId: string | null = null,
): Promise<LibraryState> {
  const library = await readLibrary();

  for (const filePath of filePaths) {
    if (path.extname(filePath).toLowerCase() !== '.chm') continue;

    library.books.push({
      id: randomUUID(),
      name: path.basename(filePath, path.extname(filePath)),
      filePath,
      addedAt: Date.now(),
      collectionId: collectionId || null,
    });
  }

  await writeLibrary(library);
  return library;
}

async function removeBook(id: string): Promise<LibraryState> {
  const library = await readLibrary();
  library.books = library.books.filter((item) => item.id !== id);
  await writeLibrary(library);
  return library;
}

async function createCollection(name: string): Promise<LibraryState> {
  const library = await readLibrary();
  const collection = { id: randomUUID(), name: name || '新书库', createdAt: Date.now() };
  library.collections.push(collection);
  await writeLibrary(library);
  return library;
}

async function renameCollection(id: string, name: string): Promise<LibraryState> {
  const library = normalizeLibrary(renameCollectionInLibrary(await readLibrary(), id, name));
  await writeLibrary(library);
  return library;
}

async function removeCollection(id: string): Promise<LibraryState> {
  const library = await readLibrary();
  library.books = library.books.map((item) => (
    item.collectionId === id ? { ...item, collectionId: null } : item
  ));
  library.collections = library.collections.filter((item) => item.id !== id);
  await writeLibrary(library);
  return library;
}

function createWindow() {
  const browserWindow = new BrowserWindow({
    width: 1240,
    height: 800,
    minWidth: 760,
    minHeight: 520,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#f5f4f1',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow = browserWindow;
  browserWindow.on('close', (event: { preventDefault: () => void }) => {
    if (isQuitting || currentView !== 'reader') return;
    event.preventDefault();
    currentView = 'library';
    sendToMainWindow('library:show');
  });
  browserWindow.on('closed', () => {
    if (mainWindow !== browserWindow) return;
    stopSearchIndexWorker();
    mainWindow = undefined;
  });
  browserWindow.loadFile(path.join(__dirname, 'index.html'));
}

function createMenu() {
  const template = [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { type: 'separator' },
      { role: 'quit' },
    ],
  }, {
    label: 'File',
    submenu: [{
      label: 'Add CHM to Library...',
      accelerator: 'CmdOrCtrl+O',
      click: () => selectAndImportBooks(),
    }, {
      label: 'Show Library',
      accelerator: 'CmdOrCtrl+L',
      click: () => {
        currentView = 'library';
        sendToMainWindow('library:show');
      },
    }, {
      role: 'close',
    }],
  }, {
    label: 'Edit',
    submenu: [
      { role: 'copy' },
      { role: 'selectAll' },
      { type: 'separator' },
      {
        label: 'Find in Contents',
        accelerator: 'CmdOrCtrl+F',
        click: () => sendToMainWindow('navigation:focus-search'),
      },
    ],
  }, {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  }, {
    role: 'windowMenu',
  }];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function locateExtractor() {
  async function resolveExecutable(candidate: string): Promise<string> {
    if (path.isAbsolute(candidate)) {
      await fs.promises.access(candidate, fs.constants.X_OK);
      return candidate;
    }

    const paths = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
    for (const directory of paths) {
      const executable = path.join(directory, candidate);
      try {
        await fs.promises.access(executable, fs.constants.X_OK);
        return executable;
      } catch {
        // Continue searching PATH.
      }
    }
    throw new Error(`Executable not found: ${candidate}`);
  }

  const nativeName = process.platform === 'darwin'
    ? `darwin-${process.arch}`
    : `${process.platform}-${process.arch}`;
  const resourcesPath = (process as NodeJS.Process & { resourcesPath: string }).resourcesPath;
  const candidates: string[] = [
    path.join(resourcesPath, 'native', nativeName, 'bin', 'extract_chmLib'),
    path.join(__dirname, '..', 'resources', 'native', nativeName, 'bin', 'extract_chmLib'),
    '/opt/homebrew/bin/extract_chmLib',
    '/usr/local/bin/extract_chmLib',
    'extract_chmLib',
  ];

  for (const candidate of candidates) {
    try {
      return await resolveExecutable(candidate);
    } catch {
      // Try the next bundled or system extractor candidate.
    }
  }

  throw new Error('未找到可用的 CHM 解包器。请重新安装应用，或在开发环境安装 chmlib。');
}

function createBookUrl(topicPath: string | null | undefined): string | null {
  if (!topicPath) return null;

  const hashIndex = topicPath.indexOf('#');
  const resource = hashIndex >= 0 ? topicPath.slice(0, hashIndex) : topicPath;
  const hash = hashIndex >= 0 ? topicPath.slice(hashIndex) : '';
  const encodedPath = resource.split('/').map(encodeURIComponent).join('/');
  return `chm://book/${encodedPath}${hash}`;
}

function createBookResult(
  name: string,
  chmPath: string,
  metadata: BookMetadata,
): OpenedBook {
  return {
    name,
    filePath: chmPath,
    contents: metadata.contents,
    defaultPage: createBookUrl(metadata.defaultPage),
    searchablePageCount: metadata.searchIndex.length,
    textEncoding: bookTextEncoding,
  };
}

function stopSearchIndexWorker() {
  searchIndexGeneration += 1;
  if (searchIndexWorker) {
    searchIndexWorker.terminate();
    searchIndexWorker = undefined;
  }
}

function startSearchIndexBuild(
  root: string,
  contents: BookContentsItem[],
  textEncoding: string | null,
): void {
  stopSearchIndexWorker();
  const generation = searchIndexGeneration;
  const worker = new Worker(path.join(__dirname, 'search-index-worker.js'), {
    workerData: {
      root,
      contents,
      textEncoding: textEncoding || null,
      concurrency: 4,
    },
  });
  searchIndexWorker = worker;

  worker.once('message', (message: SearchIndexWorkerMessage) => {
    if (generation !== searchIndexGeneration || root !== bookRoot) return;
    searchIndexWorker = undefined;
    if (message.error) {
      console.error(`CHM search index failed: ${message.error.message}`);
      return;
    }

    bookSearchIndex = message.searchIndex || [];
    sendToMainWindow('book:index-ready', {
      searchablePageCount: bookSearchIndex.length,
    });
  });
  worker.once('error', (error: Error) => {
    if (generation !== searchIndexGeneration || root !== bookRoot) return;
    searchIndexWorker = undefined;
    console.error(`CHM search index worker failed: ${error.message}`);
  });
  worker.once('exit', () => {
    if (searchIndexWorker === worker) searchIndexWorker = undefined;
  });
}

function normalizeTextEncoding(encoding: string): string | null {
  if (!encoding || encoding === 'auto') return null;
  new TextDecoder(encoding);
  return encoding;
}

function addSearchHighlightStyles(markup: string): string {
  const styles = `<style>
    .chm-search-match { background: #f7df83; color: inherit; border-radius: 2px; padding: 0 1px; }
    .chm-search-current { background: #f2a93b; box-shadow: 0 0 0 2px rgba(210, 125, 20, 0.28); animation: chm-search-pulse 650ms ease-out; }
    @keyframes chm-search-pulse { from { box-shadow: 0 0 0 6px rgba(210, 125, 20, 0.38); } to { box-shadow: 0 0 0 2px rgba(210, 125, 20, 0.28); } }
  </style>`;
  return /<\/head>/i.test(markup) ? markup.replace(/<\/head>/i, `${styles}</head>`) : `${styles}${markup}`;
}

async function openBook(chmPath: string, displayName?: string): Promise<OpenedBook> {
  if (!chmPath || path.extname(chmPath).toLowerCase() !== '.chm') {
    throw new Error('请选择有效的 .chm 文件');
  }

  const name = displayName || path.basename(chmPath, path.extname(chmPath));
  const nextRoot = await getExtractCacheRoot(chmPath);
  let stagingRoot: string | null = null;
  try {
    let metadata: BookMetadata;
    try {
      metadata = await readExtractedBook(nextRoot, {
        textEncoding: bookTextEncoding,
        buildSearchIndex: false,
      });
    } catch {
      const activeStagingRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-cache-'));
      stagingRoot = activeStagingRoot;
      metadata = await extractBook(chmPath, activeStagingRoot, await locateExtractor(), {
        textEncoding: bookTextEncoding,
        buildSearchIndex: false,
      });
      await fs.promises.mkdir(path.dirname(nextRoot), { recursive: true });
      await fs.promises.rm(nextRoot, { recursive: true, force: true });
      await fs.promises.rename(activeStagingRoot, nextRoot);
      stagingRoot = null;
    }

    const previousRoot = bookRoot;
    const previousRootIsCached = bookRootIsCached;
    bookRoot = nextRoot;
    bookRootIsCached = true;
    bookSearchIndex = metadata.searchIndex;
    currentBookPath = chmPath;
    currentBookName = name;

    if (previousRoot && !previousRootIsCached) {
      fs.promises.rm(previousRoot, { recursive: true, force: true }).catch(() => { });
    }

    const result = createBookResult(name, chmPath, metadata);

    const targetWindow = getLiveMainWindow();
    targetWindow?.setRepresentedFilename(chmPath);
    targetWindow?.setTitle(`${result.name} - CHMReaderLight`);
    sendToMainWindow('book:opened', result);
    startSearchIndexBuild(nextRoot, metadata.contents, bookTextEncoding);
    return result;
  } catch (error) {
    if (stagingRoot) {
      await fs.promises.rm(stagingRoot, { recursive: true, force: true });
    }
    throw error;
  }
}

async function openLibraryBook(id: string): Promise<OpenedBook | null> {
  const library = await readLibrary();
  const entry = library.books.find((item) => item.id === id);
  if (!entry) throw new Error('该文档已不在书库中');

  const chmPath = entry.filePath || path.join(getLibraryDir(), entry.storedName);
  try {
    return await openBook(chmPath, entry.name);
  } catch (error) {
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: '无法打开 CHM',
      message: error instanceof Error ? error.message : String(error),
      detail: '请确认文件仍存在且未损坏。若问题持续存在，请重新安装应用以恢复内置 CHM 解包器。',
    });
    return null;
  }
}

async function setBookTextEncoding(
  encoding: string,
): Promise<OpenedBook | { textEncoding: string | null }> {
  bookTextEncoding = normalizeTextEncoding(encoding);
  if (!bookRoot || !currentBookPath || !currentBookName) return { textEncoding: bookTextEncoding };
  const activeRoot = bookRoot;
  const activePath = currentBookPath;
  const activeName = currentBookName;

  const metadata = await readExtractedBook(activeRoot, {
    textEncoding: bookTextEncoding,
    buildSearchIndex: false,
  });
  bookSearchIndex = metadata.searchIndex;
  const result = createBookResult(activeName, activePath, metadata);
  sendToMainWindow('book:opened', result);
  startSearchIndexBuild(activeRoot, metadata.contents, bookTextEncoding);
  return result;
}

async function selectAndImportBooks(collectionId: string | null = null): Promise<LibraryState | null> {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '添加 CHM 到书库',
    buttonLabel: '添加',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Compiled HTML Help', extensions: ['chm'] }],
  });

  if (result.canceled) return null;

  try {
    const library = await importBooks(result.filePaths, collectionId);
    sendToMainWindow('library:updated', library);
    return library;
  } catch (error) {
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: '无法添加到书库',
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

function registerBookProtocol(): void {
  protocol.handle('chm', async (request: { url: string }) => {
    try {
      const requestUrl = new URL(request.url);
      if (!bookRoot || requestUrl.hostname !== 'book') {
        return new Response('No book is open', { status: 404 });
      }

      const filePath = resolveBookResource(bookRoot, requestUrl.pathname);
      const response = await net.fetch(pathToFileURL(filePath).toString());
      const headers = new Headers(response.headers);
      const searchQuery = requestUrl.searchParams.get('search');
      const isHtml = ['.htm', '.html'].includes(path.extname(filePath).toLowerCase());
      if (isHtml) {
        const scriptNonce = randomUUID();
        headers.set(
          'Content-Security-Policy',
          `default-src 'none'; img-src chm: data:; style-src chm: 'unsafe-inline'; script-src 'nonce-${scriptNonce}'; font-src chm: data:; media-src chm:; frame-src chm:`,
        );
        let markup = decodeMarkup(await fs.promises.readFile(filePath), bookTextEncoding);
        if (searchQuery) {
          const selectedIndex = Math.max(0, Number.parseInt(requestUrl.searchParams.get('match') || '', 10) || 0);
          markup = addSearchHighlightStyles(highlightSearchMatches(markup, searchQuery, selectedIndex).markup);
        }
        markup = injectContentNavigationBridge(markup, scriptNonce);
        headers.set('Content-Type', 'text/html; charset=utf-8');
        return new Response(markup, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }
      headers.set(
        'Content-Security-Policy',
        "default-src 'none'; img-src chm: data:; style-src chm: 'unsafe-inline'; font-src chm: data:; media-src chm:; frame-src chm:",
      );
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch {
      return new Response('Resource not found', { status: 404 });
    }
  });
}

ipcMain.handle('library:list', (_event: IpcMainInvokeEvent) => readLibrary());
ipcMain.handle('library:import', (_event: IpcMainInvokeEvent, collectionId: string | null) => selectAndImportBooks(collectionId));
ipcMain.handle('library:open', (_event: IpcMainInvokeEvent, id: string) => openLibraryBook(id));
ipcMain.handle('library:remove', (_event: IpcMainInvokeEvent, id: string) => removeBook(id));
ipcMain.handle('collection:create', (_event: IpcMainInvokeEvent, name: string) => createCollection(name));
ipcMain.handle('collection:rename', (_event: IpcMainInvokeEvent, id: string, name: string) => renameCollection(id, name));
ipcMain.handle('collection:remove', (_event: IpcMainInvokeEvent, id: string) => removeCollection(id));
ipcMain.handle('book:url', (_event: IpcMainInvokeEvent, topicPath: string | null) => createBookUrl(topicPath));
ipcMain.handle('book:search', (_event: IpcMainInvokeEvent, query: string): SearchResult[] => searchBookContents(bookSearchIndex, query));
ipcMain.handle('book:encoding', (_event: IpcMainInvokeEvent, encoding: string) => setBookTextEncoding(encoding));
ipcMain.handle('view:set', (_event: IpcMainInvokeEvent, view: 'library' | 'reader') => {
  currentView = view === 'reader' ? 'reader' : 'library';
});
ipcMain.handle('external:open', (_event: IpcMainInvokeEvent, url: string) => {
  if (/^https?:\/\//i.test(url)) return shell.openExternal(url);
  return undefined;
});

async function importAndOpen(filePath: string): Promise<void> {
  const library = await importBooks([filePath]);
  sendToMainWindow('library:updated', library);
  const added = library.books[library.books.length - 1];
  if (added) await openLibraryBook(added.id);
}

app.on('open-file', (event: Electron.Event, filePath: string) => {
  event.preventDefault();
  if (app.isReady()) {
    importAndOpen(filePath).catch(() => { });
  } else {
    pendingFile = filePath;
  }
});

app.whenReady().then(async () => {
  registerBookProtocol();
  createWindow();
  createMenu();

  if (pendingFile) {
    await importAndOpen(pendingFile).catch(() => { });
    pendingFile = undefined;
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  stopSearchIndexWorker();
  if (bookRoot && !bookRootIsCached) fs.rmSync(bookRoot, { recursive: true, force: true });
});
