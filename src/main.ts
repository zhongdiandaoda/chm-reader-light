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
  clipboard,
  dialog,
  ipcMain,
  Menu,
  net,
  powerMonitor,
  protocol,
  shell,
} = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { Worker } = require('node:worker_threads');
const { pathToFileURL } = require('node:url');
const {
  DEFAULT_MARKUP_LIMITS,
  extractBook,
  highlightSearchMatches,
  injectContentNavigationBridge,
  mapWithConcurrency,
  MarkupTooLargeError,
  readMarkupFile,
  readExtractedBook,
  resolveBookResource,
  searchBookContents,
} = require('./chm') as typeof import('./chm');
const {
  addBooksToLibrary,
  findBookByFilePath,
  markBookOpenedInLibrary,
  normalizeLibraryData,
  normalizeLibraryDataForWrite,
  relinkBookInLibrary,
  renameCollectionInLibrary,
} = require('./library') as typeof import('./library');
const {
  createSerializedStateUpdater,
  readLibraryFile,
  writeLibraryFile,
} = require('./library-store') as typeof import('./library-store');
const {
  createBookCacheKey,
  isSameBookCacheIdentity,
} = require('./book-cache') as typeof import('./book-cache');
const { createSerializedTaskQueue } = require('./async-queue') as typeof import('./async-queue');
const { isTrustedIpcSender } = require('./ipc-security') as typeof import('./ipc-security');
const {
  isAllowedBookFrameNavigation,
  normalizeExternalWebUrl,
} = require('./navigation-security') as typeof import('./navigation-security');

const LIBRARY_AVAILABILITY_CONCURRENCY = 16;

const projectLinks = {
  repository: 'https://github.com/zhongdiandaoda/chm-reader-light',
  star: 'https://github.com/zhongdiandaoda/chm-reader-light',
  issues: 'https://github.com/zhongdiandaoda/chm-reader-light/issues',
  discussions: 'https://github.com/zhongdiandaoda/chm-reader-light/discussions',
  releaseFeedback: 'https://github.com/zhongdiandaoda/chm-reader-light/discussions/new?category=release-feedback',
  releases: 'https://github.com/zhongdiandaoda/chm-reader-light/releases',
  downloadAppleSilicon: 'https://github.com/zhongdiandaoda/chm-reader-light/releases/latest/download/CHMReaderLight-mac-arm64.zip',
  securityPolicy: 'https://github.com/zhongdiandaoda/chm-reader-light/security/policy',
  bugIssue: 'https://github.com/zhongdiandaoda/chm-reader-light/issues/new?template=bug_report.yml',
  installIssue: 'https://github.com/zhongdiandaoda/chm-reader-light/issues/new?template=install_help.yml',
  featureIssue: 'https://github.com/zhongdiandaoda/chm-reader-light/issues/new?template=feature_request.yml',
  questionIssue: 'https://github.com/zhongdiandaoda/chm-reader-light/issues/new?template=question.yml',
  documentationIssue: 'https://github.com/zhongdiandaoda/chm-reader-light/issues/new?template=documentation.yml',
  performanceIssue: 'https://github.com/zhongdiandaoda/chm-reader-light/issues/new?template=performance.yml',
  accessibilityIssue: 'https://github.com/zhongdiandaoda/chm-reader-light/issues/new?template=accessibility.yml',
  support: 'https://github.com/zhongdiandaoda/chm-reader-light/blob/main/SUPPORT.md',
  showcaseIssue: 'https://github.com/zhongdiandaoda/chm-reader-light/issues/new?template=showcase.yml',
  installMac: 'https://github.com/zhongdiandaoda/chm-reader-light/blob/main/docs/install-macos.md',
  privacy: 'https://github.com/zhongdiandaoda/chm-reader-light/blob/main/docs/privacy.md',
  compatibility: 'https://github.com/zhongdiandaoda/chm-reader-light/blob/main/docs/compatibility.md',
  compatibilityIssue: 'https://github.com/zhongdiandaoda/chm-reader-light/issues/new?template=chm_compatibility.yml',
  troubleshooting: 'https://github.com/zhongdiandaoda/chm-reader-light/blob/main/docs/troubleshooting.md',
};

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
  lastOpenedAt?: number;
  collectionId: string | null;
  sourceMissing?: boolean;
  [key: string]: unknown;
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
const runBookStateTask = createSerializedTaskQueue();

function configureAboutPanel(): void {
  app.setAboutPanelOptions({
    applicationName: 'CHMReaderLight',
    applicationVersion: app.getVersion(),
    version: `Electron ${process.versions.electron}`,
    website: projectLinks.repository,
    copyright: 'MIT License - liuqi.9867',
  });
}

function getLaunchChmPath(argv: readonly string[]): string | undefined {
  for (const argument of argv) {
    if (!argument || argument.startsWith('-')) continue;
    const resolved = path.resolve(argument);
    if (path.extname(resolved).toLowerCase() === '.chm') return resolved;
  }
  return undefined;
}

function getLiveMainWindow(): BrowserWindowType | null {
  if (!mainWindow) return null;
  if (mainWindow.isDestroyed()) {
    mainWindow = undefined;
    return null;
  }
  return mainWindow;
}

function restoreMainWindow(focus: boolean): boolean {
  const targetWindow = getLiveMainWindow();
  if (!targetWindow) return false;

  // Waking macOS must not reveal a window the user intentionally hid.
  if (!focus && (!targetWindow.isVisible() || targetWindow.isMinimized())) return true;
  if (targetWindow.isMinimized()) targetWindow.restore();
  if (!targetWindow.isVisible()) targetWindow.show();
  if (!targetWindow.webContents.isDestroyed()) targetWindow.webContents.invalidate();
  if (focus) targetWindow.focus();
  return true;
}

function sendToMainWindow(channel: string, ...args: unknown[]): void {
  const targetWindow = getLiveMainWindow();
  if (!targetWindow || targetWindow.webContents.isDestroyed()) return;
  targetWindow.webContents.send(channel, ...args);
}

function reportMainProcessError(title: string, error: unknown, showDialog = true): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(title + ': ' + message);
  if (!showDialog) return;
  const targetWindow = getLiveMainWindow();
  const options: Electron.MessageBoxOptions = {
    type: 'error',
    title,
    message,
  };
  void Promise.resolve()
    .then(() => targetWindow
      ? dialog.showMessageBox(targetWindow, options)
      : dialog.showMessageBox(options))
    .catch(() => { });
}

type TrustedIpcHandler<Args extends unknown[], Result> = (
  event: IpcMainInvokeEvent,
  ...args: Args
) => Result;

function handleTrustedIpc<Args extends unknown[], Result>(
  channel: string,
  handler: TrustedIpcHandler<Args, Result>,
): void {
  ipcMain.handle(channel, (event: IpcMainInvokeEvent, ...args: unknown[]) => {
    const targetWindow = getLiveMainWindow();
    if (!isTrustedIpcSender(event, targetWindow?.webContents || null)) {
      throw new Error('Unauthorized IPC sender');
    }
    return handler(event, ...args as Args);
  });
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

async function getExtractCacheTarget(chmPath: string): Promise<{
  root: string;
  sourceIdentity: import('./book-cache').BookCacheFileIdentity;
}> {
  const stats = await fs.promises.stat(chmPath, { bigint: true });
  const cacheKey = createBookCacheKey(chmPath, stats);
  return {
    root: path.join(getExtractCacheDir(), cacheKey),
    sourceIdentity: stats,
  };
}

async function assertBookSourceUnchanged(
  chmPath: string,
  expectedIdentity: import('./book-cache').BookCacheFileIdentity,
): Promise<void> {
  const currentIdentity = await fs.promises.stat(chmPath, { bigint: true });
  if (!isSameBookCacheIdentity(expectedIdentity, currentIdentity)) {
    throw new Error('CHM source changed while it was being opened');
  }
}

async function readLibrary(): Promise<LibraryState> {
  const parsed = await readLibraryFile(getLibraryIndexPath());
  return parsed === null ? { collections: [], books: [] } : normalizeLibraryData(parsed);
}

async function writeLibrary(library: LibraryState): Promise<void> {
  await writeLibraryFile(getLibraryIndexPath(), normalizeLibraryDataForWrite(library));
}

function getLibraryBookPath(entry: LibraryBook): string {
  return entry.filePath || (entry.storedName ? path.join(getLibraryDir(), entry.storedName) : '');
}

async function withBookAvailability(library: LibraryState): Promise<LibraryState> {
  return {
    ...library,
    books: await mapWithConcurrency(
      library.books,
      LIBRARY_AVAILABILITY_CONCURRENCY,
      async (book) => {
        const bookPath = getLibraryBookPath(book);
        if (!bookPath) return { ...book, sourceMissing: true };

        try {
          await fs.promises.access(bookPath, fs.constants.F_OK);
          return { ...book, sourceMissing: false };
        } catch {
          return { ...book, sourceMissing: true };
        }
      },
    ),
  };
}

const updateLibrary = createSerializedStateUpdater(readLibrary, writeLibrary, withBookAvailability);

function buildDiagnosticInfo(): string {
  return [
    `CHMReaderLight: ${app.getVersion()}`,
    `Electron: ${process.versions.electron}`,
    `Node: ${process.versions.node}`,
    `Platform: ${process.platform}`,
    `Architecture: ${process.arch}`,
    `macOS: ${os.release()}`,
  ].join('\n');
}

function buildShareText(): string {
  return [
    'CHMReaderLight helps macOS users keep offline CHM manuals searchable and organized.',
    'CHMReaderLight 帮助 macOS 用户整理并搜索离线 CHM 手册。',
    '',
    'Library-first workflow, searchable table of contents, body search, reader preferences, and local-only document handling.',
    '书库优先工作流、可搜索目录、正文搜索、阅读偏好，以及本地优先的文档处理方式。',
    '',
    `GitHub repository: ${projectLinks.repository}`,
    `Star the project: ${projectLinks.star}`,
    `Share a success story: ${projectLinks.showcaseIssue}`,
    `项目说明: ${projectLinks.repository}#readme`,
    '',
    `Try it from GitHub Releases: ${projectLinks.releases}`,
    `Apple Silicon download: ${projectLinks.downloadAppleSilicon}`,
    `Watch releases: ${projectLinks.releases}`,
    `Release feedback: ${projectLinks.releaseFeedback}`,
    '',
    'If release details would make CHMReaderLight easier to trust, star, watch, or share, tell maintainers what is missing.',
    '如果 release 说明会影响你是否信任、star、watch 或分享 CHMReaderLight，请告诉维护者还缺什么信息。',
    '',
    'If it solves your offline CHM workflow, a GitHub star helps other users find it.',
    'If a real CHMReaderLight workflow is safe to quote, share it so future users can evaluate the app faster.',
    '如果它解决了你的离线 CHM 工作流，一个 GitHub star 可以帮助更多用户发现它。',
    '如果真实使用场景可以公开引用，分享成功案例可以帮助后续用户更快判断是否适合。',
  ].join('\n');
}

async function copyDiagnosticInfo(): Promise<void> {
  clipboard.writeText(buildDiagnosticInfo());
  await dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Diagnostic Info Copied',
    message: 'Diagnostic information has been copied.',
    detail: 'Paste it into a GitHub issue when reporting a problem.',
  });
}

async function copyShareText(): Promise<void> {
  clipboard.writeText(buildShareText());
  await dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Share Text Copied',
    message: 'Project share text has been copied.',
    detail: 'Paste it into a release note, social post, or message when sharing CHMReaderLight.',
  });
}

async function revealAppDataFolder(): Promise<void> {
  try {
    await fs.promises.mkdir(app.getPath('userData'), { recursive: true });
    const errorMessage = await shell.openPath(app.getPath('userData'));
    if (!errorMessage) return;
    throw new Error(errorMessage);
  } catch (error) {
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: 'Unable to Open App Data Folder',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function clearExtractedBookCache(): Promise<void> {
  const confirmation = await dialog.showMessageBox(mainWindow, {
    type: 'warning',
    buttons: ['Clear Cache', 'Cancel'],
    defaultId: 1,
    cancelId: 1,
    title: 'Clear Extracted Cache?',
    message: 'Remove cached extracted CHM contents?',
    detail: 'Source CHM files and library entries will not be removed.',
  });

  if (confirmation.response !== 0) return;

  try {
    await runBookStateTask(async () => {
      stopSearchIndexWorker();
      await fs.promises.rm(getExtractCacheDir(), { recursive: true, force: true });
      if (bookRoot && bookRootIsCached) {
        bookRoot = undefined;
        currentBookPath = null;
        currentBookName = null;
        currentView = 'library';
        const targetWindow = getLiveMainWindow();
        targetWindow?.setRepresentedFilename('');
        targetWindow?.setTitle('CHMReaderLight');
        sendToMainWindow('library:show');
      }
      bookRootIsCached = false;
      bookSearchIndex = [];
    });
    await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Extracted Cache Cleared',
      message: 'Cached extracted CHM contents have been removed.',
      detail: 'The next time you open a CHM file, CHMReaderLight will extract it again.',
    });
  } catch (error) {
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: 'Unable to Clear Extracted Cache',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function importBooks(
  filePaths: readonly string[],
  collectionId: string | null = null,
): Promise<LibraryState> {
  const library = await updateLibrary((current) => addBooksToLibrary(
    current,
    filePaths,
    collectionId,
    randomUUID,
    Date.now,
    process.platform === 'darwin',
  ) as LibraryState);
  return library;
}

async function removeBook(id: string): Promise<LibraryState> {
  const library = await updateLibrary((current) => ({
    ...current,
    books: current.books.filter((item) => item.id !== id),
  }));
  return library;
}

async function revealLibraryBook(id: string): Promise<boolean> {
  const library = await readLibrary();
  const entry = library.books.find((item) => item.id === id);
  const bookPath = entry ? getLibraryBookPath(entry) : '';
  if (!bookPath) return false;

  try {
    await fs.promises.access(bookPath, fs.constants.F_OK);
    shell.showItemInFolder(bookPath);
    return true;
  } catch (error) {
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: '无法定位 CHM',
      message: error instanceof Error ? error.message : String(error),
      detail: '请确认源文件仍存在，或重新添加该 CHM 文档。',
    });
    return false;
  }
}

async function relinkLibraryBook(id: string): Promise<LibraryState | null> {
  const library = await readLibrary();
  const entry = library.books.find((item) => item.id === id);
  if (!entry) throw new Error('该文档已不在书库中');

  const result = await dialog.showOpenDialog(mainWindow, {
    title: '重新定位 CHM',
    buttonLabel: '选择',
    properties: ['openFile'],
    filters: [{ name: 'Compiled HTML Help', extensions: ['chm'] }],
  });

  if (result.canceled) return null;

  const selectedPath = result.filePaths[0];
  if (!selectedPath) return null;

  try {
    const updatedLibrary = await updateLibrary((current) => {
      if (!current.books.some((item) => item.id === id)) {
        throw new Error('该文档已不在书库中');
      }
      return relinkBookInLibrary(current, id, selectedPath, process.platform === 'darwin') as LibraryState;
    });
    return updatedLibrary;
  } catch (error) {
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: '无法重新定位 CHM',
      message: error instanceof Error ? error.message : String(error),
    });
    return withBookAvailability(await readLibrary());
  }
}

async function createCollection(name: string): Promise<LibraryState> {
  const library = await updateLibrary((current) => ({
    ...current,
    collections: [
      ...current.collections,
      { id: randomUUID(), name: name || '新书库', createdAt: Date.now() },
    ],
  }));
  return library;
}

async function renameCollection(id: string, name: string): Promise<LibraryState> {
  const library = await updateLibrary((current) => (
    normalizeLibraryData(renameCollectionInLibrary(current, id, name)) as LibraryState
  ));
  return library;
}

async function removeCollection(id: string): Promise<LibraryState> {
  const library = await updateLibrary((current) => ({
    ...current,
    books: current.books.map((item) => (
      item.collectionId === id ? { ...item, collectionId: null } : item
    )),
    collections: current.collections.filter((item) => item.id !== id),
  }));
  return library;
}

function createWindow() {
  const browserWindow = new BrowserWindow({
    width: 1240,
    height: 800,
    minWidth: 760,
    minHeight: 520,
    show: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#f5f5f7',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow = browserWindow;
  browserWindow.webContents.session.setPermissionCheckHandler(() => false);
  browserWindow.webContents.session.setPermissionRequestHandler((
    _webContents: unknown,
    _permission: string,
    callback: (granted: boolean) => void,
  ) => {
    callback(false);
  });
  browserWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  browserWindow.webContents.on(
    'will-frame-navigate',
    (event: Electron.Event<Electron.WebContentsWillFrameNavigateEventParams>) => {
      if (!isAllowedBookFrameNavigation(event.url, event.isMainFrame)) {
        event.preventDefault();
      }
    },
  );
  browserWindow.webContents.on('will-navigate', (event: Electron.Event) => {
    event.preventDefault();
  });
  browserWindow.once('ready-to-show', () => {
    if (browserWindow.isDestroyed()) return;
    browserWindow.show();
  });
  browserWindow.on('close', (event: { preventDefault: () => void }) => {
    if (isQuitting) return;
    if (currentView !== 'reader') {
      if (process.platform === 'darwin') {
        event.preventDefault();
        browserWindow.hide();
      }
      return;
    }
    event.preventDefault();
    currentView = 'library';
    sendToMainWindow('library:show');
  });
  browserWindow.on('closed', () => {
    if (mainWindow !== browserWindow) return;
    stopSearchIndexWorker();
    mainWindow = undefined;
  });
  void browserWindow.loadFile(path.join(__dirname, 'index.html')).catch((error: unknown) => {
    reportMainProcessError('Unable to Load Application Window', error);
  });
}

function guardMenuActionFailures(
  template: Electron.MenuItemConstructorOptions[],
): Electron.MenuItemConstructorOptions[] {
  return template.map((item) => {
    const guardedItem = { ...item };
    if (item.click) {
      const click = item.click;
      guardedItem.click = (menuItem, browserWindow, event) => {
        void Promise.resolve()
          .then(() => click(menuItem, browserWindow, event))
          .catch((error: unknown) => {
            reportMainProcessError('Unable to Complete Menu Action', error);
          });
      };
    }
    if (Array.isArray(item.submenu)) {
      guardedItem.submenu = guardMenuActionFailures(item.submenu);
    }
    return guardedItem;
  });
}

function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [{
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
      role: 'recentDocuments',
      submenu: [
        { role: 'clearRecentDocuments' },
      ],
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
        label: 'Find',
        accelerator: 'CmdOrCtrl+F',
        click: () => sendToMainWindow('navigation:focus-search'),
      },
      {
        label: 'Find Next',
        accelerator: 'CmdOrCtrl+G',
        click: () => sendToMainWindow('reader:shortcut', 'find-next'),
      },
      {
        label: 'Find Previous',
        accelerator: 'Shift+CmdOrCtrl+G',
        click: () => sendToMainWindow('reader:shortcut', 'find-previous'),
      },
    ],
  }, {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { type: 'separator' },
      {
        label: 'Back',
        accelerator: 'CmdOrCtrl+[',
        click: () => sendToMainWindow('reader:shortcut', 'history-back'),
      },
      {
        label: 'Forward',
        accelerator: 'CmdOrCtrl+]',
        click: () => sendToMainWindow('reader:shortcut', 'history-forward'),
      },
      { type: 'separator' },
      {
        label: 'Previous Topic',
        accelerator: 'CmdOrCtrl+Up',
        click: () => sendToMainWindow('reader:shortcut', 'previous-topic'),
      },
      {
        label: 'Next Topic',
        accelerator: 'CmdOrCtrl+Down',
        click: () => sendToMainWindow('reader:shortcut', 'next-topic'),
      },
      {
        label: 'Toggle Sidebar',
        accelerator: 'CmdOrCtrl+B',
        click: () => sendToMainWindow('reader:shortcut', 'toggle-sidebar'),
      },
      { type: 'separator' },
      {
        label: 'Actual Size',
        accelerator: 'CmdOrCtrl+0',
        click: () => sendToMainWindow('reader:shortcut', 'zoom-reset'),
      },
      {
        label: 'Zoom In',
        accelerator: 'CmdOrCtrl+Plus',
        click: () => sendToMainWindow('reader:shortcut', 'zoom-in'),
      },
      {
        label: 'Zoom Out',
        accelerator: 'CmdOrCtrl+-',
        click: () => sendToMainWindow('reader:shortcut', 'zoom-out'),
      },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  }, {
    role: 'windowMenu',
  }, {
    label: 'Help',
    submenu: [{
      label: 'GitHub Repository',
      click: () => shell.openExternal(projectLinks.repository),
    }, {
      label: 'Star on GitHub',
      click: () => shell.openExternal(projectLinks.star),
    }, {
      label: 'Watch Releases',
      click: () => shell.openExternal(projectLinks.releases),
    }, {
      label: 'GitHub Discussions',
      click: () => shell.openExternal(projectLinks.discussions),
    }, {
      label: 'Release Feedback',
      click: () => shell.openExternal(projectLinks.releaseFeedback),
    }, {
      label: 'Report or Request',
      submenu: [{
        label: 'Report a Bug',
        click: () => shell.openExternal(projectLinks.bugIssue),
      }, {
        label: 'Get Install Help',
        click: () => shell.openExternal(projectLinks.installIssue),
      }, {
        label: 'Request a Feature',
        click: () => shell.openExternal(projectLinks.featureIssue),
      }, {
        label: 'Ask a Usage Question',
        click: () => shell.openExternal(projectLinks.questionIssue),
      }, {
        label: 'Report Documentation',
        click: () => shell.openExternal(projectLinks.documentationIssue),
      }, {
        label: 'Share Release Feedback',
        click: () => shell.openExternal(projectLinks.releaseFeedback),
      }, {
        label: 'Report CHM Compatibility',
        click: () => shell.openExternal(projectLinks.compatibilityIssue),
      }, {
        label: 'Share a Success Story',
        click: () => shell.openExternal(projectLinks.showcaseIssue),
      }, {
        label: 'Security Policy',
        click: () => shell.openExternal(projectLinks.securityPolicy),
      }, {
        label: 'Report Performance',
        click: () => shell.openExternal(projectLinks.performanceIssue),
      }, {
        label: 'Report Accessibility',
        click: () => shell.openExternal(projectLinks.accessibilityIssue),
      }],
    }, {
      label: 'Report an Issue',
      click: () => shell.openExternal(projectLinks.issues),
    }, {
      label: 'Support Guide',
      click: () => shell.openExternal(projectLinks.support),
    }, {
      label: 'Project README',
      click: () => shell.openExternal(projectLinks.repository),
    }, {
      label: 'macOS Install Guide',
      click: () => shell.openExternal(projectLinks.installMac),
    }, {
      label: 'Privacy and Local Data',
      click: () => shell.openExternal(projectLinks.privacy),
    }, {
      label: 'Compatibility Notes',
      click: () => shell.openExternal(projectLinks.compatibility),
    }, {
      label: 'Troubleshooting Guide',
      click: () => shell.openExternal(projectLinks.troubleshooting),
    }, {
      label: 'Download Releases',
      click: () => shell.openExternal(projectLinks.releases),
    }, {
      type: 'separator',
    }, {
      label: 'Copy Share Text',
      accelerator: 'Shift+CmdOrCtrl+C',
      click: () => copyShareText(),
    }, {
      label: 'Copy Diagnostic Info',
      click: () => copyDiagnosticInfo(),
    }, {
      label: 'Reveal App Data Folder',
      click: () => revealAppDataFolder(),
    }, {
      label: 'Clear Extracted Cache',
      click: () => clearExtractedBookCache(),
    }],
  }];

  Menu.setApplicationMenu(Menu.buildFromTemplate(guardMenuActionFailures(template)));
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
    void searchIndexWorker.terminate().catch((error: unknown) => {
      reportMainProcessError('Unable to Stop Search Index Worker', error, false);
    });
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
  let worker: WorkerType;
  try {
    worker = new Worker(path.join(__dirname, 'search-index-worker.js'), {
      workerData: {
        root,
        contents,
        textEncoding: textEncoding || null,
        concurrency: 4,
        maxMarkupBytes: DEFAULT_MARKUP_LIMITS.maxMarkupBytes,
        maxSearchIndexSourceBytes: DEFAULT_MARKUP_LIMITS.maxSearchIndexSourceBytes,
      },
    });
  } catch (error) {
    console.error(`CHM search index worker could not start: ${
      error instanceof Error ? error.message : String(error)
    }`);
    return;
  }
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

async function removeBookCacheAfterFailure(cacheRoot: string): Promise<void> {
  try {
    await fs.promises.rm(cacheRoot, { recursive: true, force: true });
  } catch (cleanupError) {
    reportMainProcessError('Unable to Clean Up Extracted Cache', cleanupError, false);
  }
}

async function openBookTransaction(chmPath: string, displayName?: string): Promise<OpenedBook> {
  if (!chmPath || path.extname(chmPath).toLowerCase() !== '.chm') {
    throw new Error('请选择有效的 .chm 文件');
  }

  const name = displayName || path.basename(chmPath, path.extname(chmPath));
  const { root: nextRoot, sourceIdentity } = await getExtractCacheTarget(chmPath);
  let stagingRoot: string | null = null;
  let publishedCacheNeedsCleanup = false;
  try {
    let metadata: BookMetadata;
    try {
      metadata = await readExtractedBook(nextRoot, {
        textEncoding: bookTextEncoding,
        buildSearchIndex: false,
      });
    } catch {
      await fs.promises.mkdir(path.dirname(nextRoot), { recursive: true });
      const activeStagingRoot = await fs.promises.mkdtemp(
        path.join(path.dirname(nextRoot), '.chm-reader-cache-'),
      );
      stagingRoot = activeStagingRoot;
      metadata = await extractBook(chmPath, activeStagingRoot, await locateExtractor(), {
        textEncoding: bookTextEncoding,
        buildSearchIndex: false,
      });
      await assertBookSourceUnchanged(chmPath, sourceIdentity);
      await fs.promises.rm(nextRoot, { recursive: true, force: true });
      await fs.promises.rename(activeStagingRoot, nextRoot);
      stagingRoot = null;
      publishedCacheNeedsCleanup = true;
    }

    await assertBookSourceUnchanged(chmPath, sourceIdentity);
    publishedCacheNeedsCleanup = false;

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
    app.addRecentDocument(chmPath);
    sendToMainWindow('book:opened', result);
    startSearchIndexBuild(nextRoot, metadata.contents, bookTextEncoding);
    return result;
  } catch (error) {
    if (stagingRoot) {
      await removeBookCacheAfterFailure(stagingRoot);
    }
    if (publishedCacheNeedsCleanup) {
      await removeBookCacheAfterFailure(nextRoot);
    }
    throw error;
  }
}

async function openLibraryBookTransaction(id: string): Promise<OpenedBook | null> {
  const library = await readLibrary();
  const entry = library.books.find((item) => item.id === id);
  if (!entry) throw new Error('该文档已不在书库中');

  const chmPath = getLibraryBookPath(entry);
  let openedBook: OpenedBook;
  try {
    openedBook = await openBookTransaction(chmPath, entry.name);
  } catch (error) {
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: '无法打开 CHM',
      message: error instanceof Error ? error.message : String(error),
      detail: '请确认文件仍存在且未损坏。若问题持续存在，请重新安装应用以恢复内置 CHM 解包器。',
    });
    return null;
  }

  try {
    const openedLibrary = await updateLibrary((current) => (
      markBookOpenedInLibrary(current, id, Date.now()) as LibraryState
    ));
    sendToMainWindow('library:updated', openedLibrary);
  } catch (error) {
    console.error(`Unable to update last-opened metadata: ${
      error instanceof Error ? error.message : String(error)
    }`);
  }
  return openedBook;
}

const openLibraryBook = (id: string) => (
  runBookStateTask(() => openLibraryBookTransaction(id))
);

async function setBookTextEncodingTransaction(
  encoding: string,
): Promise<OpenedBook | { textEncoding: string | null }> {
  const nextEncoding = normalizeTextEncoding(encoding);
  if (!bookRoot || !currentBookPath || !currentBookName) {
    bookTextEncoding = nextEncoding;
    return { textEncoding: bookTextEncoding };
  }
  const activeRoot = bookRoot;
  const activePath = currentBookPath;
  const activeName = currentBookName;

  const metadata = await readExtractedBook(activeRoot, {
    textEncoding: nextEncoding,
    buildSearchIndex: false,
  });
  bookTextEncoding = nextEncoding;
  bookSearchIndex = metadata.searchIndex;
  const result = createBookResult(activeName, activePath, metadata);
  sendToMainWindow('book:opened', result);
  startSearchIndexBuild(activeRoot, metadata.contents, bookTextEncoding);
  return result;
}

const setBookTextEncoding = (encoding: string) => (
  runBookStateTask(() => setBookTextEncodingTransaction(encoding))
);

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

async function importDroppedBookPaths(
  filePaths: readonly string[],
  collectionId: string | null = null,
): Promise<LibraryState> {
  try {
    const chmPaths = filePaths.filter((filePath) => (
      typeof filePath === 'string' && path.extname(filePath).toLowerCase() === '.chm'
    ));
    if (!chmPaths.length) return withBookAvailability(await readLibrary());

    const library = await importBooks(chmPaths, collectionId);
    sendToMainWindow('library:updated', library);
    return library;
  } catch (error) {
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: '无法添加到书库',
      message: error instanceof Error ? error.message : String(error),
    });
    return withBookAvailability(await readLibrary());
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
      const searchQuery = requestUrl.searchParams.get('search');
      const isHtml = ['.htm', '.html'].includes(path.extname(filePath).toLowerCase());
      if (isHtml) {
        let markup: string;
        try {
          markup = await readMarkupFile(filePath, bookTextEncoding);
        } catch (error) {
          if (error instanceof MarkupTooLargeError) {
            return new Response('HTML page exceeds the reader safety limit', { status: 413 });
          }
          throw error;
        }
        const headers = new Headers();
        const scriptNonce = randomUUID();
        headers.set(
          'Content-Security-Policy',
          `default-src 'none'; base-uri 'none'; object-src 'none'; connect-src 'none'; form-action 'none'; frame-src 'none'; child-src 'none'; img-src chm: data:; style-src chm: 'unsafe-inline'; script-src 'nonce-${scriptNonce}'; script-src-attr 'none'; font-src chm: data:; media-src chm:`,
        );
        if (searchQuery) {
          const selectedIndex = Math.max(0, Number.parseInt(requestUrl.searchParams.get('match') || '', 10) || 0);
          markup = addSearchHighlightStyles(highlightSearchMatches(markup, searchQuery, selectedIndex).markup);
        }
        markup = injectContentNavigationBridge(markup, scriptNonce);
        headers.set('Content-Type', 'text/html; charset=utf-8');
        return new Response(markup, {
          status: 200,
          headers,
        });
      }
      const response = await net.fetch(pathToFileURL(filePath).toString());
      const headers = new Headers(response.headers);
      headers.set(
        'Content-Security-Policy',
        "default-src 'none'; base-uri 'none'; object-src 'none'; connect-src 'none'; form-action 'none'; frame-src 'none'; child-src 'none'; img-src chm: data:; style-src chm: 'unsafe-inline'; script-src 'none'; script-src-attr 'none'; font-src chm: data:; media-src chm:",
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

handleTrustedIpc('library:list', async (_event: IpcMainInvokeEvent) => withBookAvailability(await readLibrary()));
handleTrustedIpc('library:import', (_event: IpcMainInvokeEvent, collectionId: string | null) => selectAndImportBooks(collectionId));
handleTrustedIpc('library:import-paths', (_event: IpcMainInvokeEvent, filePaths: readonly string[], collectionId: string | null) => (
  importDroppedBookPaths(Array.isArray(filePaths) ? filePaths : [], collectionId)
));
handleTrustedIpc('library:open', (_event: IpcMainInvokeEvent, id: string) => openLibraryBook(id));
handleTrustedIpc('library:remove', (_event: IpcMainInvokeEvent, id: string) => removeBook(id));
handleTrustedIpc('library:reveal', (_event: IpcMainInvokeEvent, id: string) => revealLibraryBook(id));
handleTrustedIpc('library:relink', (_event: IpcMainInvokeEvent, id: string) => relinkLibraryBook(id));
handleTrustedIpc('collection:create', (_event: IpcMainInvokeEvent, name: string) => createCollection(name));
handleTrustedIpc('collection:rename', (_event: IpcMainInvokeEvent, id: string, name: string) => renameCollection(id, name));
handleTrustedIpc('collection:remove', (_event: IpcMainInvokeEvent, id: string) => removeCollection(id));
handleTrustedIpc('book:url', (_event: IpcMainInvokeEvent, topicPath: string | null) => createBookUrl(topicPath));
handleTrustedIpc('book:search', (_event: IpcMainInvokeEvent, query: string): SearchResult[] => searchBookContents(bookSearchIndex, query));
handleTrustedIpc('book:encoding', (_event: IpcMainInvokeEvent, encoding: string) => setBookTextEncoding(encoding));
handleTrustedIpc('view:set', (_event: IpcMainInvokeEvent, view: 'library' | 'reader') => {
  currentView = view === 'reader' ? 'reader' : 'library';
});
handleTrustedIpc('external:open', (_event: IpcMainInvokeEvent, url: string) => {
  const externalUrl = normalizeExternalWebUrl(url);
  if (externalUrl) return shell.openExternal(externalUrl);
  return undefined;
});

async function importAndOpen(filePath: string): Promise<void> {
  const library = await importBooks([filePath]);
  sendToMainWindow('library:updated', library);
  const target = findBookByFilePath(library.books, filePath, process.platform === 'darwin');
  if (target) await openLibraryBook(target.id);
}

function importAndOpenFromSystem(filePath: string): void {
  void importAndOpen(filePath).catch((error: unknown) => {
    reportMainProcessError('Unable to Open CHM', error);
  });
}

app.on('open-file', (event: Electron.Event, filePath: string) => {
  event.preventDefault();
  if (app.isReady()) {
    importAndOpenFromSystem(filePath);
  } else {
    pendingFile = filePath;
  }
});

const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.quit();
} else {
  pendingFile = pendingFile || getLaunchChmPath(process.argv);

  app.on('second-instance', (_event: Electron.Event, argv: string[]) => {
    const launchedFile = getLaunchChmPath(argv);
    restoreMainWindow(true);
    if (launchedFile) {
      importAndOpenFromSystem(launchedFile);
    }
  });

  void app.whenReady().then(async () => {
    registerBookProtocol();
    configureAboutPanel();
    createWindow();
    createMenu();

    if (pendingFile) {
      importAndOpenFromSystem(pendingFile);
      pendingFile = undefined;
    }

    app.on('activate', () => {
      if (!restoreMainWindow(true)) createWindow();
    });

    powerMonitor.on('resume', () => {
      restoreMainWindow(false);
    });
  }).catch((error: unknown) => {
    reportMainProcessError('Unable to Start CHMReaderLight', error);
    app.quit();
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
}
