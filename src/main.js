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
const { randomUUID } = require('node:crypto');
const { pathToFileURL } = require('node:url');
const { extractBook, resolveBookResource } = require('./chm');

protocol.registerSchemesAsPrivileged([{
  scheme: 'chm',
  privileges: {
    standard: true,
    secure: true,
    supportFetchAPI: true,
  },
}]);

let mainWindow;
let bookRoot;
let pendingFile;

function getLibraryDir() {
  return path.join(app.getPath('userData'), 'library');
}

function getLibraryIndexPath() {
  return path.join(getLibraryDir(), 'library.json');
}

function normalizeLibrary(parsed) {
  if (Array.isArray(parsed)) {
    return { collections: [], books: parsed.map((book) => ({ collectionId: null, ...book })) };
  }
  return {
    collections: Array.isArray(parsed?.collections) ? parsed.collections : [],
    books: Array.isArray(parsed?.books) ? parsed.books : [],
  };
}

async function readLibrary() {
  try {
    const raw = await fs.promises.readFile(getLibraryIndexPath(), 'utf-8');
    return normalizeLibrary(JSON.parse(raw));
  } catch {
    return { collections: [], books: [] };
  }
}

async function writeLibrary(library) {
  await fs.promises.mkdir(getLibraryDir(), { recursive: true });
  await fs.promises.writeFile(getLibraryIndexPath(), JSON.stringify(library, null, 2));
}

async function importBooks(filePaths, collectionId = null) {
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

async function removeBook(id) {
  const library = await readLibrary();
  library.books = library.books.filter((item) => item.id !== id);
  await writeLibrary(library);
  return library;
}

async function createCollection(name) {
  const library = await readLibrary();
  const collection = { id: randomUUID(), name: name || '新书库', createdAt: Date.now() };
  library.collections.push(collection);
  await writeLibrary(library);
  return library;
}

async function removeCollection(id) {
  const library = await readLibrary();
  library.books = library.books.map((item) => (
    item.collectionId === id ? { ...item, collectionId: null } : item
  ));
  library.collections = library.collections.filter((item) => item.id !== id);
  await writeLibrary(library);
  return library;
}

function createWindow() {
  mainWindow = new BrowserWindow({
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

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
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
      click: () => mainWindow?.webContents.send('library:show'),
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
        click: () => mainWindow?.webContents.send('navigation:focus-search'),
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
  const candidates = [
    '/opt/homebrew/bin/extract_chmLib',
    '/usr/local/bin/extract_chmLib',
    'extract_chmLib',
  ];

  for (const candidate of candidates) {
    if (!path.isAbsolute(candidate) || fs.existsSync(candidate)) return candidate;
  }

  throw new Error('未找到 extract_chmLib，请先运行 brew install chmlib');
}

function createBookUrl(topicPath) {
  if (!topicPath) return null;

  const hashIndex = topicPath.indexOf('#');
  const resource = hashIndex >= 0 ? topicPath.slice(0, hashIndex) : topicPath;
  const hash = hashIndex >= 0 ? topicPath.slice(hashIndex) : '';
  const encodedPath = resource.split('/').map(encodeURIComponent).join('/');
  return `chm://book/${encodedPath}${hash}`;
}

async function openBook(chmPath, displayName) {
  if (!chmPath || path.extname(chmPath).toLowerCase() !== '.chm') {
    throw new Error('请选择有效的 .chm 文件');
  }

  const name = displayName || path.basename(chmPath, path.extname(chmPath));
  const nextRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-'));
  try {
    const metadata = await extractBook(chmPath, nextRoot, await locateExtractor());
    const previousRoot = bookRoot;
    bookRoot = nextRoot;

    if (previousRoot) {
      fs.promises.rm(previousRoot, { recursive: true, force: true }).catch(() => {});
    }

    const result = {
      name,
      filePath: chmPath,
      contents: metadata.contents,
      defaultPage: createBookUrl(metadata.defaultPage),
    };

    mainWindow?.setRepresentedFilename(chmPath);
    mainWindow?.setTitle(`${result.name} - CHM Reader`);
    mainWindow?.webContents.send('book:opened', result);
    return result;
  } catch (error) {
    await fs.promises.rm(nextRoot, { recursive: true, force: true });
    throw error;
  }
}

async function openLibraryBook(id) {
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
      message: error.message,
      detail: '请确认文件仍存在且未损坏，并已通过 Homebrew 安装 chmlib。',
    });
    return null;
  }
}

async function selectAndImportBooks(collectionId = null) {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '添加 CHM 到书库',
    buttonLabel: '添加',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Compiled HTML Help', extensions: ['chm'] }],
  });

  if (result.canceled) return null;

  try {
    const library = await importBooks(result.filePaths, collectionId);
    mainWindow?.webContents.send('library:updated', library);
    return library;
  } catch (error) {
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: '无法添加到书库',
      message: error.message,
    });
    return null;
  }
}

function registerBookProtocol() {
  protocol.handle('chm', async (request) => {
    try {
      const requestUrl = new URL(request.url);
      if (!bookRoot || requestUrl.hostname !== 'book') {
        return new Response('No book is open', { status: 404 });
      }

      const filePath = resolveBookResource(bookRoot, requestUrl.pathname);
      const response = await net.fetch(pathToFileURL(filePath).toString());
      const headers = new Headers(response.headers);
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

ipcMain.handle('library:list', () => readLibrary());
ipcMain.handle('library:import', (_, collectionId) => selectAndImportBooks(collectionId));
ipcMain.handle('library:open', (_, id) => openLibraryBook(id));
ipcMain.handle('library:remove', (_, id) => removeBook(id));
ipcMain.handle('collection:create', (_, name) => createCollection(name));
ipcMain.handle('collection:remove', (_, id) => removeCollection(id));
ipcMain.handle('book:url', (_, topicPath) => createBookUrl(topicPath));
ipcMain.handle('external:open', (_, url) => {
  if (/^https?:\/\//i.test(url)) return shell.openExternal(url);
  return undefined;
});

async function importAndOpen(filePath) {
  const library = await importBooks([filePath]);
  mainWindow?.webContents.send('library:updated', library);
  const added = library.books[library.books.length - 1];
  if (added) await openLibraryBook(added.id);
}

app.on('open-file', (event, filePath) => {
  event.preventDefault();
  if (app.isReady()) {
    importAndOpen(filePath).catch(() => {});
  } else {
    pendingFile = filePath;
  }
});

app.whenReady().then(async () => {
  registerBookProtocol();
  createWindow();
  createMenu();

  if (pendingFile) {
    await importAndOpen(pendingFile).catch(() => {});
    pendingFile = null;
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  if (bookRoot) fs.rmSync(bookRoot, { recursive: true, force: true });
});
