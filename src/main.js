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
      label: 'Open CHM...',
      accelerator: 'CmdOrCtrl+O',
      click: () => selectAndOpenBook(),
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

async function openBook(chmPath) {
  if (!chmPath || path.extname(chmPath).toLowerCase() !== '.chm') {
    throw new Error('请选择有效的 .chm 文件');
  }

  const nextRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-'));
  try {
    const metadata = await extractBook(chmPath, nextRoot, await locateExtractor());
    const previousRoot = bookRoot;
    bookRoot = nextRoot;

    if (previousRoot) {
      fs.promises.rm(previousRoot, { recursive: true, force: true }).catch(() => {});
    }

    const result = {
      name: path.basename(chmPath, path.extname(chmPath)),
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

async function selectAndOpenBook() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '打开 CHM 文件',
    buttonLabel: '打开',
    properties: ['openFile'],
    filters: [{ name: 'Compiled HTML Help', extensions: ['chm'] }],
  });

  if (result.canceled) return null;

  try {
    return await openBook(result.filePaths[0]);
  } catch (error) {
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: '无法打开 CHM',
      message: error.message,
      detail: '请确认文件未损坏，并已通过 Homebrew 安装 chmlib。',
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

ipcMain.handle('book:open', () => selectAndOpenBook());
ipcMain.handle('book:url', (_, topicPath) => createBookUrl(topicPath));
ipcMain.handle('external:open', (_, url) => {
  if (/^https?:\/\//i.test(url)) return shell.openExternal(url);
  return undefined;
});

app.on('open-file', (event, filePath) => {
  event.preventDefault();
  if (app.isReady()) {
    openBook(filePath).catch(() => {});
  } else {
    pendingFile = filePath;
  }
});

app.whenReady().then(async () => {
  registerBookProtocol();
  createWindow();
  createMenu();

  if (pendingFile) {
    await openBook(pendingFile).catch(() => {});
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
