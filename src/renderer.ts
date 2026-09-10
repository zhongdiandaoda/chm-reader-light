export { };

import type { BookContentsItem, SearchResult } from './chm';
import {
  getLocaleDirection,
  localeOptions,
  normalizeLocale,
  normalizeTheme,
  translate,
  type AppLocale,
  type AppTheme,
  type TranslationKey,
} from './i18n.js';
import {
  filterBooksByQuery,
  formatLibraryAddedDate,
  getBookLocationLabel,
  getNextCollectionName,
  normalizeCollectionName,
  sortBooksForDisplay,
} from './library.js';
import {
  findTopicPathByUrl,
  getTopicPathsInReadingOrder,
} from './navigation.js';

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

type CollectionItem = LibraryCollection | { id: null; name: string };

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

interface ChmReaderApi {
  listLibrary: () => Promise<LibraryState>;
  importBooks: (collectionId: string | null) => Promise<LibraryState | null>;
  importDroppedFiles: (files: readonly File[], collectionId: string | null) => Promise<LibraryState>;
  openLibraryBook: (id: string) => Promise<OpenedBook | null>;
  removeLibraryBook: (id: string) => Promise<LibraryState>;
  revealLibraryBook: (id: string) => Promise<unknown>;
  relinkLibraryBook: (id: string) => Promise<LibraryState | null>;
  createCollection: (name: string) => Promise<LibraryState>;
  renameCollection: (id: string, name: string) => Promise<LibraryState>;
  removeCollection: (id: string) => Promise<LibraryState>;
  createBookUrl: (topicPath: string | null) => Promise<string | null>;
  searchBook: (query: string) => Promise<SearchResult[]>;
  setTextEncoding: (encoding: string) => Promise<OpenedBook | { textEncoding: string | null }>;
  setView: (view: AppView) => Promise<unknown>;
  setPreferences: (locale: AppLocale, theme: AppTheme) => Promise<unknown>;
  openExternal: (url: string) => Promise<unknown>;
  onBookOpened: (callback: (book: OpenedBook) => void) => () => void;
  onBookIndexReady: (callback: (result: { searchablePageCount: number }) => void) => () => void;
  onLibraryUpdated: (callback: (entries: LibraryState) => void) => () => void;
  onShowLibrary: (callback: () => void) => () => void;
  onShowSettings: (callback: () => void) => () => void;
  onFocusSearch: (callback: () => void) => () => void;
  onReaderShortcut: (callback: (command: ReaderShortcutCommand) => void) => () => void;
}

type SearchScope = 'body' | 'directory';
type AppView = 'library' | 'reader' | 'settings';
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

const onboardingLinks = {
  readme: 'https://github.com/zhongdiandaoda/chm-reader-light#readme',
  install: 'https://github.com/zhongdiandaoda/chm-reader-light/blob/main/docs/install-macos.md',
  privacy: 'https://github.com/zhongdiandaoda/chm-reader-light/blob/main/docs/privacy.md',
  troubleshooting: 'https://github.com/zhongdiandaoda/chm-reader-light/blob/main/docs/troubleshooting.md',
};

interface SearchState {
  scope: SearchScope;
  query: string;
  resultsByPath: Map<string, SearchResult>;
  currentMatchIndex: number;
}

interface UiElement extends HTMLElement {
  disabled: boolean;
  value: string;
  placeholder: string;
  src: string;
  contentWindow: Window | null;
  select(): void;
  setPointerCapture(pointerId: number): void;
  hasPointerCapture(pointerId: number): boolean;
}

declare global {
  interface Window {
    chmReader: ChmReaderApi;
  }
}

function query(selector: string): UiElement {
  const element = document.querySelector<UiElement>(selector);
  if (!element) throw new Error(`Missing renderer element: ${selector}`);
  return element;
}

const elements = {
  libraryToolbar: query('#library-toolbar'),
  readerToolbar: query('#reader-toolbar'),
  settingsToolbar: query('#settings-toolbar'),
  libraryView: query('#library-view'),
  settingsView: query('#settings-view'),
  libraryContent: query('#library-content'),
  libraryDropTarget: query('#library-drop-target'),
  libraryEmpty: query('#library-empty'),
  libraryEmptyFiltered: query('#library-empty-filtered'),
  libraryLoadError: query('#library-load-error'),
  libraryLoadErrorMessage: query('#library-load-error-message'),
  retryLibraryLoad: query('#retry-library-load'),
  libraryGrid: query('#library-grid'),
  libraryCount: query('#library-count'),
  libraryHeading: query('#library-heading'),
  librarySearch: query('#library-search'),
  collectionList: query('#collection-list'),
  addCollection: query('#add-collection'),
  collectionDialog: query('#collection-dialog'),
  collectionForm: query('#collection-form'),
  collectionDialogTitle: query('#collection-dialog-title'),
  collectionName: query('#collection-name'),
  collectionError: query('#collection-error'),
  collectionCancel: query('#collection-cancel'),
  collectionCreate: query('#collection-create'),
  collectionContextMenu: query('#collection-context-menu'),
  collectionRename: query('#collection-rename'),
  collectionDelete: query('#collection-delete'),
  viewGrid: query('#view-grid'),
  viewList: query('#view-list'),
  addBook: query('#add-book'),
  emptyAddBook: query('#empty-add-book'),
  emptyGettingStarted: query('#empty-getting-started'),
  emptyFeatureTour: query('#empty-feature-tour'),
  emptyPrivacy: query('#empty-privacy'),
  emptyTroubleshooting: query('#empty-troubleshooting'),
  clearLibrarySearch: query('#clear-library-search'),
  emptySearchGuide: query('#empty-search-guide'),
  backToLibrary: query('#back-to-library'),
  bookTitle: query('#book-title'),
  readerProgress: query('#reader-progress'),
  readerTopicTitle: query('#reader-topic-title'),
  contentFrame: query('#content-frame'),
  emptyState: query('#empty-state'),
  loadingState: query('#loading-state'),
  navigation: query('#navigation'),
  readerLayout: query('#reader-layout'),
  resizeHandle: query('#resize-handle'),
  search: query('#search-navigation'),
  searchScopeTrigger: query('#search-scope-trigger'),
  searchScopeMenu: query('#search-scope-menu'),
  searchScopeLabel: query('#search-scope-label'),
  sidebarTopicCount: query('#sidebar-topic-count'),
  searchBody: query('#search-body'),
  searchDirectory: query('#search-directory'),
  searchStatus: query('#search-status'),
  searchMatchNavigation: query('#search-match-navigation'),
  searchToolbarSeparator: query('#search-toolbar-separator'),
  searchPrevious: query('#search-previous'),
  searchNext: query('#search-next'),
  searchMatchPosition: query('#search-match-position'),
  back: query('#go-back'),
  forward: query('#go-forward'),
  previousPage: query('#previous-page'),
  nextPage: query('#next-page'),
  treeMenuTrigger: query('#tree-menu-trigger'),
  treeActionsMenu: query('#tree-actions-menu'),
  expandAll: query('#expand-all'),
  collapseAll: query('#collapse-all'),
  refreshTree: query('#refresh-tree'),
  zoomReset: query('#zoom-reset'),
  textEncoding: query('#text-encoding'),
  textEncodingValue: query('#text-encoding-value'),
  textEncodingMenu: query('#text-encoding-menu'),
  librarySettings: query('#library-settings'),
  readerSettings: query('#reader-settings'),
  settingsBack: query('#settings-back'),
  appLanguage: query('#app-language'),
  themeOptions: query('#theme-options'),
};

const libraryLayoutStorageKey = 'chm-reader-library-layout';
const selectedCollectionStorageKey = 'chm-reader-selected-collection';
const textEncodingStorageKey = 'chm-reader-text-encoding';
const readerSidebarWidthStorageKey = 'chm-reader-sidebar-width';
const readerSidebarVisibleStorageKey = 'chm-reader-sidebar-visible';
const readerZoomStorageKey = 'chm-reader-zoom';
const readerSearchScopeStorageKey = 'chm-reader-search-scope';
const readerLastTopicStorageKey = 'chm-reader-last-topic-by-book';
const appLocaleStorageKey = 'chm-reader-locale';
const appThemeStorageKey = 'chm-reader-theme';

let currentBook: OpenedBook | null = null;
let currentTopicPath: string | null = null;
let history: Array<{ topicPath: string; row: UiElement | null }> = [];
let historyIndex = -1;
let readingOrder: string[] = [];
let zoom = 1;
let searchRequestId = 0;
let pendingTopicPathAfterEncoding: string | null = null;
let searchState: SearchState = {
  scope: 'body',
  query: '',
  resultsByPath: new Map(),
  currentMatchIndex: 0,
};

let library: LibraryState = { collections: [], books: [] };
let selectedCollectionId: string | null = null; // null = 全部
let libraryLayout = 'grid';
let libraryQuery = '';
let collectionDialogRestoreFocus: UiElement | null = null;
let collectionDialogMode: { type: 'create' | 'rename'; collectionId: string | null } = { type: 'create', collectionId: null };
let contextCollection: LibraryCollection | null = null;
let contextCollectionCount = 0;
let libraryDragDepth = 0;
let currentLocale = loadLocalePreference();
let currentTheme = loadThemePreference();
let settingsReturnView: Exclude<AppView, 'settings'> = 'library';

function t(key: TranslationKey, variables: Record<string, string | number> = {}): string {
  return translate(currentLocale, key, variables);
}

function loadLocalePreference(): AppLocale {
  try {
    return normalizeLocale(window.localStorage.getItem(appLocaleStorageKey));
  } catch {
    return 'zh-CN';
  }
}

function loadThemePreference(): AppTheme {
  try {
    return normalizeTheme(window.localStorage.getItem(appThemeStorageKey));
  } catch {
    return 'light';
  }
}

function savePreference(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Keep the active preference in memory when storage is unavailable.
  }
}

function loadLibraryLayoutPreference(): 'grid' | 'list' {
  try {
    const saved = window.localStorage.getItem(libraryLayoutStorageKey);
    return saved === 'list' || saved === 'grid' ? saved : 'grid';
  } catch {
    return 'grid';
  }
}

function loadSelectedCollectionPreference(collections: readonly LibraryCollection[]): string | null {
  try {
    const saved = window.localStorage.getItem(selectedCollectionStorageKey);
    return saved && collections.some((collection) => collection.id === saved) ? saved : null;
  } catch {
    return null;
  }
}

function saveSelectedCollectionPreference(id: string | null): void {
  try {
    if (id) {
      window.localStorage.setItem(selectedCollectionStorageKey, id);
    } else {
      window.localStorage.removeItem(selectedCollectionStorageKey);
    }
  } catch {
    // Ignore storage failures and keep the in-memory selection for this session.
  }
}

function isSupportedTextEncoding(encoding: string | null | undefined): boolean {
  return getEncodingOptions().some((option) => option.dataset.encoding === encoding);
}

function loadTextEncodingPreference(): string {
  try {
    const saved = window.localStorage.getItem(textEncodingStorageKey);
    return isSupportedTextEncoding(saved) ? saved || 'auto' : 'auto';
  } catch {
    return 'auto';
  }
}

function saveTextEncodingPreference(encoding: string): void {
  try {
    if (encoding && encoding !== 'auto') {
      window.localStorage.setItem(textEncodingStorageKey, encoding);
    } else {
      window.localStorage.removeItem(textEncodingStorageKey);
    }
  } catch {
    // Ignore storage failures and keep the in-memory encoding for this session.
  }
}

function loadReaderSearchScopePreference(): SearchScope {
  try {
    const saved = window.localStorage.getItem(readerSearchScopeStorageKey);
    return saved === 'directory' || saved === 'body' ? saved : 'body';
  } catch {
    return 'body';
  }
}

function saveReaderSearchScopePreference(scope: SearchScope): void {
  try {
    window.localStorage.setItem(readerSearchScopeStorageKey, scope);
  } catch {
    // Ignore storage failures and keep the in-memory search scope for this session.
  }
}

function loadReaderLastTopicMap(): Record<string, string> {
  try {
    const saved = window.localStorage.getItem(readerLastTopicStorageKey);
    if (!saved) return {};

    const parsed: unknown = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
    );
  } catch {
    return {};
  }
}

function loadReaderLastTopicPreference(book: OpenedBook, validTopics: readonly string[]): string | null {
  const saved = loadReaderLastTopicMap()[book.filePath];
  return saved && validTopics.includes(saved) ? saved : null;
}

function saveReaderLastTopicPreference(book: OpenedBook, topicPath: string): void {
  try {
    const nextTopics = loadReaderLastTopicMap();
    nextTopics[book.filePath] = topicPath;
    window.localStorage.setItem(readerLastTopicStorageKey, JSON.stringify(nextTopics));
  } catch {
    // Ignore storage failures and keep the current topic for this session.
  }
}

function clampReaderSidebarWidth(width: number): number {
  return Math.min(460, Math.max(210, width));
}

function loadReaderSidebarWidthPreference(): number {
  try {
    const saved = Number.parseInt(window.localStorage.getItem(readerSidebarWidthStorageKey) || '', 10);
    return Number.isFinite(saved) ? clampReaderSidebarWidth(saved) : 292;
  } catch {
    return 292;
  }
}

function setReaderSidebarWidth(width: number, persist = false): void {
  const nextWidth = clampReaderSidebarWidth(width);
  elements.readerLayout.style.setProperty('--sidebar-width', `${nextWidth}px`);
  if (!persist) return;

  try {
    window.localStorage.setItem(readerSidebarWidthStorageKey, String(nextWidth));
  } catch {
    // Ignore storage failures and keep the in-memory width for this session.
  }
}

function loadReaderSidebarVisiblePreference(): boolean {
  try {
    const saved = window.localStorage.getItem(readerSidebarVisibleStorageKey);
    return saved === null ? true : saved === 'true';
  } catch {
    return true;
  }
}

function setReaderSidebarVisible(isVisible: boolean, persist = false): void {
  elements.readerLayout.classList.toggle('sidebar-hidden', !isVisible);
  if (!persist) return;

  try {
    window.localStorage.setItem(readerSidebarVisibleStorageKey, String(isVisible));
  } catch {
    // Ignore storage failures and keep the in-memory sidebar state for this session.
  }
}

function toggleReaderSidebar(): void {
  setReaderSidebarVisible(elements.readerLayout.classList.contains('sidebar-hidden'), true);
}

function getCurrentTopicTitle(): string | null {
  return currentBook && currentTopicPath
    ? findTopicTitleByPath(currentBook.contents, currentTopicPath) || currentTopicPath
    : null;
}

function updateReaderTopicTitle(): void {
  const topicTitle = getCurrentTopicTitle();
  elements.readerTopicTitle.hidden = !topicTitle;
  elements.readerTopicTitle.textContent = topicTitle || '';
  elements.readerTopicTitle.title = topicTitle || '';
}

function updateDocumentTitle(): void {
  const topicTitle = getCurrentTopicTitle();
  document.title = currentBook
    ? `${currentBook.name}${topicTitle ? ` - ${topicTitle}` : ''} - CHMReaderLight`
    : 'CHMReaderLight';
  updateReaderTopicTitle();
}

function syncMainProcessView(view: AppView): void {
  void window.chmReader.setView(view).catch((error: unknown) => {
    showReaderActionError(t('error.syncView'), error);
  });
}

function showView(view: AppView): void {
  document.body.dataset.view = view;
  syncMainProcessView(view);
  const isReader = view === 'reader';
  const isLibrary = view === 'library';
  const isSettings = view === 'settings';
  elements.libraryToolbar.hidden = !isLibrary;
  elements.readerToolbar.hidden = !isReader;
  elements.settingsToolbar.hidden = !isSettings;
  elements.libraryView.hidden = !isLibrary;
  elements.settingsView.hidden = !isSettings;
  elements.readerLayout.hidden = !isReader;
  if (!isReader) document.title = isSettings ? t('settings.title') + ' - CHMReaderLight' : 'CHMReaderLight';
}

function openSettings(): void {
  const activeView = document.body.dataset.view;
  if (activeView === 'reader' || activeView === 'library') settingsReturnView = activeView;
  showView('settings');
  elements.appLanguage.focus();
}

function applyStaticTranslations(): void {
  document.documentElement.lang = currentLocale;
  document.documentElement.dir = getLocaleDirection(currentLocale);
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n as TranslationKey | undefined;
    if (!key) return;
    const value = t(key);
    if (value.includes('\n')) {
      element.replaceChildren(...value.split('\n').flatMap((part, index) => (
        index === 0 ? [document.createTextNode(part)] : [document.createElement('br'), document.createTextNode(part)]
      )));
    } else {
      element.textContent = value;
    }
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-aria-label]').forEach((element) => {
    const key = element.dataset.i18nAriaLabel as TranslationKey | undefined;
    if (key) element.setAttribute('aria-label', t(key));
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((element) => {
    const key = element.dataset.i18nTitle as TranslationKey | undefined;
    if (key) element.setAttribute('title', t(key));
  });
  document.querySelectorAll<UiElement>('[data-i18n-placeholder]').forEach((element) => {
    const key = element.dataset.i18nPlaceholder as TranslationKey | undefined;
    if (key) element.placeholder = t(key);
  });
}

function populateLanguageOptions(): void {
  elements.appLanguage.replaceChildren(...localeOptions.map(({ value, label, direction }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    option.dir = direction;
    return option;
  }));
  elements.appLanguage.value = currentLocale;
}

function updateThemeSelection(): void {
  elements.themeOptions.querySelectorAll<HTMLInputElement>('input[name="app-theme"]').forEach((input) => {
    input.checked = input.value === currentTheme;
  });
}

function applyTheme(theme: AppTheme, persist = false): void {
  currentTheme = theme;
  document.documentElement.dataset.theme = theme;
  updateThemeSelection();
  if (persist) savePreference(appThemeStorageKey, theme);
  void window.chmReader.setPreferences(currentLocale, currentTheme).catch((error: unknown) => {
    showReaderActionError(t('error.syncView'), error);
  });
  if (persist && currentTopicPath) {
    void navigateTo(currentTopicPath, false, findNavigationRow(currentTopicPath), searchState.currentMatchIndex);
  } else if (persist && currentBook?.defaultPage && !currentTopicPath) {
    loadContent(withContentPreferences(currentBook.defaultPage));
  }
}

function applyLocale(locale: AppLocale, persist = false): void {
  currentLocale = locale;
  applyStaticTranslations();
  elements.appLanguage.value = locale;
  if (persist) savePreference(appLocaleStorageKey, locale);
  setSearchScope(searchState.scope, false);
  setTextEncodingControlValue(getTextEncodingControlValue());
  renderLibrary(library);
  renderNavigation(currentBook?.contents || []);
  updateReaderProgress(currentTopicPath ? readingOrder.indexOf(currentTopicPath) : -1);
  updateSidebarTopicCount();
  updateSearchStatus();
  showView((document.body.dataset.view as AppView) || 'library');
  void window.chmReader.setPreferences(currentLocale, currentTheme).catch((error: unknown) => {
    showReaderActionError(t('error.syncView'), error);
  });
}

function booksInSelectedCollection(): LibraryBook[] {
  const books = selectedCollectionId === null
    ? library.books
    : library.books.filter((book) => book.collectionId === selectedCollectionId);
  return sortBooksForDisplay(books);
}

function filteredBooksInSelectedCollection(): LibraryBook[] {
  return filterBooksByQuery(booksInSelectedCollection(), libraryQuery);
}

function setLibraryLayout(layout: 'grid' | 'list'): void {
  libraryLayout = layout;
  elements.libraryContent.dataset.layout = layout;
  elements.viewGrid.setAttribute('aria-pressed', String(layout === 'grid'));
  elements.viewList.setAttribute('aria-pressed', String(layout === 'list'));
  try {
    window.localStorage.setItem(libraryLayoutStorageKey, layout);
  } catch {
    // Ignore storage failures and keep the in-memory layout for this session.
  }
}

function selectCollection(id: string | null): void {
  selectedCollectionId = id;
  saveSelectedCollectionPreference(id);
  renderLibrary(library);
}

function renderLibrary(nextLibrary: LibraryState): void {
  hideCollectionContextMenu();
  library = {
    collections: Array.isArray(nextLibrary?.collections) ? nextLibrary.collections : [],
    books: Array.isArray(nextLibrary?.books) ? nextLibrary.books : [],
  };
  if (selectedCollectionId !== null
    && !library.collections.some((collection) => collection.id === selectedCollectionId)) {
    selectedCollectionId = null;
  }

  renderCollectionList();
  renderBooks();
}

function renderCollectionList() {
  elements.collectionList.replaceChildren();
  elements.collectionList.append(createCollectionItem(
    { id: null, name: t('library.all') },
    library.books.length,
    false,
  ));
  library.collections.forEach((collection) => {
    const count = library.books.filter((book) => book.collectionId === collection.id).length;
    elements.collectionList.append(createCollectionItem(collection, count, true));
  });
}

function createCollectionItem(collection: CollectionItem, count: number, removable: boolean): HTMLDivElement {
  const isSelected = selectedCollectionId === collection.id;
  const item = document.createElement('div');
  item.className = 'collection-item';
  item.classList.toggle('active', isSelected);

  const select = document.createElement('button');
  select.className = 'collection-select';
  select.type = 'button';
  select.setAttribute('aria-current', isSelected ? 'true' : 'false');
  select.addEventListener('click', () => selectCollection(collection.id));

  const label = document.createElement('span');
  label.className = 'collection-label';
  label.textContent = collection.name;

  const badge = document.createElement('span');
  badge.className = 'collection-count';
  badge.textContent = String(count);

  select.append(label, badge);
  item.append(select);

  if (removable) {
    item.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      openCollectionContextMenu(event, collection as LibraryCollection, count);
    });

    const remove = document.createElement('button');
    remove.className = 'collection-remove';
    remove.type = 'button';
    remove.textContent = '×';
    remove.title = t('collection.delete');
    remove.setAttribute('aria-label', t('collection.deleteNamed', { name: collection.name }));
    remove.addEventListener('click', async (event) => {
      event.stopPropagation();
      await confirmAndRemoveCollection(collection as LibraryCollection, count);
    });
    item.append(remove);
  }

  return item;
}

function renderBooks() {
  const allBooks = booksInSelectedCollection();
  const books = filteredBooksInSelectedCollection();
  const lastTopicsByBook = loadReaderLastTopicMap();
  const activeName = selectedCollectionId === null
    ? t('library.all')
    : library.collections.find((collection) => collection.id === selectedCollectionId)?.name || t('library.title');
  const hasQuery = Boolean(libraryQuery.trim());

  elements.libraryHeading.textContent = activeName;
  elements.libraryGrid.replaceChildren();
  elements.libraryEmpty.hidden = hasQuery || allBooks.length > 0;
  elements.libraryEmptyFiltered.hidden = !hasQuery || books.length > 0;
  elements.libraryCount.textContent = hasQuery
    ? t('library.filteredCount', { count: books.length, total: allBooks.length })
    : (allBooks.length ? t('library.documentCount', { count: allBooks.length }) : '');

  books.forEach((entry) => elements.libraryGrid.append(createLibraryCard(entry, lastTopicsByBook)));
}

function createLibraryCard(entry: LibraryBook, lastTopicsByBook: Record<string, string>): HTMLDivElement {
  const hasLastTopic = Boolean(entry.filePath && lastTopicsByBook[entry.filePath] && !entry.sourceMissing);
  const card = document.createElement('div');
  card.className = 'library-card';
  card.classList.toggle('source-missing', Boolean(entry.sourceMissing));
  card.classList.toggle('has-last-topic', hasLastTopic);
  card.dataset.id = entry.id;
  card.setAttribute('role', 'listitem');

  const open = document.createElement('button');
  open.className = 'library-card-open';
  open.type = 'button';
  open.title = entry.filePath || entry.name;
  open.setAttribute('aria-label', hasLastTopic
    ? t('library.continue', { name: entry.name })
    : t('library.open', { name: entry.name }));
  const cardDescriptionIdPrefix = `library-book-${entry.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const describedBy: string[] = [];
  open.innerHTML = `
    <span class="library-cover" aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <path d="M13 9h27a7 7 0 0 1 7 7v39H20a7 7 0 0 1-7-7V9Z"></path>
        <path d="M20 55a7 7 0 0 1 7-7h24V16h-4"></path>
        <path d="M23 21h14M23 29h14M23 37h9"></path>
      </svg>
    </span>
    <span class="library-card-text">
      <span class="library-name"></span>
      <span class="library-location"></span>
      <span class="library-last-opened"></span>
      <span class="library-added-date"></span>
      <span class="library-source-status" hidden></span>
      <span class="library-continue-reading" hidden></span>
    </span>`;
  const nameElement = open.querySelector<HTMLElement>('.library-name');
  if (nameElement) nameElement.textContent = entry.name;
  const location = getBookLocationLabel(entry.filePath);
  const locationElement = open.querySelector<HTMLElement>('.library-location');
  if (locationElement) {
    locationElement.id = `${cardDescriptionIdPrefix}-location`;
    locationElement.textContent = location;
    locationElement.hidden = !location;
    if (location) describedBy.push(locationElement.id);
  }
  const lastOpenedDate = formatLibraryAddedDate(entry.lastOpenedAt);
  const lastOpenedElement = open.querySelector<HTMLElement>('.library-last-opened');
  if (lastOpenedElement) {
    lastOpenedElement.id = `${cardDescriptionIdPrefix}-last-opened`;
    lastOpenedElement.textContent = lastOpenedDate ? t('library.lastOpened', { date: lastOpenedDate }) : '';
    lastOpenedElement.hidden = !lastOpenedDate;
    if (lastOpenedDate) describedBy.push(lastOpenedElement.id);
  }
  const addedDate = formatLibraryAddedDate(entry.addedAt);
  const addedDateElement = open.querySelector<HTMLElement>('.library-added-date');
  if (addedDateElement) {
    addedDateElement.id = `${cardDescriptionIdPrefix}-added`;
    addedDateElement.textContent = addedDate ? t('library.addedAt', { date: addedDate }) : '';
    addedDateElement.hidden = !addedDate;
    if (addedDate) describedBy.push(addedDateElement.id);
  }
  const sourceStatus = open.querySelector<HTMLElement>('.library-source-status');
  if (sourceStatus) {
    sourceStatus.id = `${cardDescriptionIdPrefix}-source-status`;
    sourceStatus.textContent = t('library.sourceMissing');
    sourceStatus.hidden = !entry.sourceMissing;
    if (entry.sourceMissing) describedBy.push(sourceStatus.id);
  }
  const continueReading = open.querySelector<HTMLElement>('.library-continue-reading');
  if (continueReading) {
    continueReading.id = `${cardDescriptionIdPrefix}-continue-reading`;
    continueReading.textContent = t('library.continueLabel');
    continueReading.hidden = !hasLastTopic;
    if (hasLastTopic) describedBy.push(continueReading.id);
  }
  if (describedBy.length > 0) open.setAttribute('aria-describedby', describedBy.join(' '));
  open.addEventListener('click', () => void openLibraryBook(entry.id));

  const remove = document.createElement('button');
  remove.className = 'library-card-remove';
  remove.type = 'button';
  remove.setAttribute('aria-label', t('library.removeNamed', { name: entry.name }));
  remove.title = t('library.remove');
  remove.textContent = '×';
  remove.addEventListener('click', async (event) => {
    event.stopPropagation();
    await confirmAndRemoveLibraryBook(entry);
  });

  const reveal = document.createElement('button');
  reveal.className = 'library-card-reveal';
  reveal.type = 'button';
  reveal.disabled = Boolean(entry.sourceMissing);
  reveal.setAttribute('aria-label', t('library.revealNamed', { name: entry.name }));
  reveal.title = entry.sourceMissing ? t('library.sourceMissing') : t('library.reveal');
  reveal.innerHTML = `
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 5.5h5.3l1.4 1.8H17v8.2H3z"></path>
      <path d="M3 7.3h14"></path>
    </svg>`;
  reveal.addEventListener('click', (event) => {
    event.stopPropagation();
    void revealLibraryBook(entry);
  });

  const relink = document.createElement('button');
  relink.className = 'library-card-relink';
  relink.type = 'button';
  relink.hidden = !entry.sourceMissing;
  relink.setAttribute('aria-label', t('library.relinkNamed', { name: entry.name }));
  relink.title = t('library.relink');
  relink.innerHTML = `
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10.5V7.8A3.8 3.8 0 0 1 7.8 4h2.7"></path>
      <path d="m8 2.5 2.8 1.5L8 5.5"></path>
      <path d="M16 9.5v2.7a3.8 3.8 0 0 1-3.8 3.8H9.5"></path>
      <path d="m12 17.5-2.8-1.5 2.8-1.5"></path>
    </svg>`;
  relink.addEventListener('click', (event) => {
    event.stopPropagation();
    void relinkLibraryBook(entry, relink);
  });

  const actions = document.createElement('div');
  actions.className = 'library-card-actions';
  actions.append(relink, reveal, remove);

  card.append(open, actions);
  return card;
}

function showLibraryActionError(action: string, error: unknown): void {
  // eslint-disable-next-line no-alert
  window.alert(`${action}：${error instanceof Error ? error.message : String(error)}`);
}

async function revealLibraryBook(entry: LibraryBook): Promise<void> {
  try {
    await window.chmReader.revealLibraryBook(entry.id);
  } catch (error: unknown) {
    showLibraryActionError(t('error.reveal'), error);
  }
}

async function relinkLibraryBook(entry: LibraryBook, trigger: HTMLButtonElement): Promise<void> {
  trigger.disabled = true;
  try {
    const updated = await window.chmReader.relinkLibraryBook(entry.id);
    if (updated) renderLibrary(updated);
  } catch (error: unknown) {
    showLibraryActionError(t('error.relink'), error);
  } finally {
    trigger.disabled = false;
  }
}

async function confirmAndRemoveLibraryBook(entry: LibraryBook): Promise<void> {
  const message = t('library.removeConfirm', { name: entry.name });
  // eslint-disable-next-line no-alert
  if (!window.confirm(message)) return;
  try {
    const updated = await window.chmReader.removeLibraryBook(entry.id);
    renderLibrary(updated);
  } catch (error: unknown) {
    showLibraryActionError(t('error.remove'), error);
  }
}

async function openLibraryBook(id: string): Promise<void> {
  showView('reader');
  elements.bookTitle.textContent = t('library.opening');
  document.title = 'Opening - CHMReaderLight';
  setLoading(true);
  try {
    const book = await window.chmReader.openLibraryBook(id);
    if (book) return;
  } catch (error: unknown) {
    window.alert(t('library.openFailed', { error: error instanceof Error ? error.message : String(error) }));
  }
  setLoading(false);
  showView('library');
}

function hideCollectionContextMenu() {
  elements.collectionContextMenu.hidden = true;
  contextCollection = null;
  contextCollectionCount = 0;
}

function openCollectionContextMenu(event: MouseEvent, collection: LibraryCollection, count: number): void {
  contextCollection = collection;
  contextCollectionCount = count;
  elements.collectionContextMenu.hidden = false;

  const { offsetWidth, offsetHeight } = elements.collectionContextMenu;
  const left = Math.min(event.clientX, window.innerWidth - offsetWidth - 8);
  const top = Math.min(event.clientY, window.innerHeight - offsetHeight - 8);
  elements.collectionContextMenu.style.left = `${Math.max(8, left)}px`;
  elements.collectionContextMenu.style.top = `${Math.max(8, top)}px`;
  elements.collectionRename.focus();
}

async function confirmAndRemoveCollection(collection: LibraryCollection, count: number): Promise<void> {
  const message = count > 0
    ? t('collection.deleteMoveConfirm', { name: collection.name, count })
    : t('collection.deleteConfirm', { name: collection.name });
  // eslint-disable-next-line no-alert
  if (!window.confirm(message)) return;
  try {
    const updated = await window.chmReader.removeCollection(collection.id);
    renderLibrary(updated);
  } catch (error: unknown) {
    showLibraryActionError(t('collection.deleteFailed'), error);
  }
}

function openCollectionDialog(collection: LibraryCollection | null = null): void {
  hideCollectionContextMenu();
  clearCollectionDialogError();
  const isRename = Boolean(collection);
  collectionDialogRestoreFocus = document.activeElement as UiElement | null;
  collectionDialogMode = {
    type: isRename ? 'rename' : 'create',
    collectionId: collection?.id || null,
  };
  elements.collectionDialogTitle.textContent = isRename ? t('collection.rename') : t('collection.create');
  elements.collectionCreate.textContent = isRename ? t('common.save') : t('common.create');
  elements.collectionName.value = isRename
    ? collection?.name || ''
    : getNextCollectionName(library.collections);
  elements.collectionDialog.hidden = false;
  requestAnimationFrame(() => {
    elements.collectionName.focus();
    elements.collectionName.select();
  });
}

function clearCollectionDialogError(): void {
  elements.collectionError.textContent = '';
  elements.collectionError.hidden = true;
  elements.collectionName.removeAttribute('aria-invalid');
}

function closeCollectionDialog() {
  elements.collectionDialog.hidden = true;
  elements.collectionCreate.disabled = false;
  clearCollectionDialogError();
  collectionDialogMode = { type: 'create', collectionId: null };
  if (collectionDialogRestoreFocus?.focus) collectionDialogRestoreFocus.focus();
  collectionDialogRestoreFocus = null;
}

async function submitCreateCollection(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const trimmed = normalizeCollectionName(elements.collectionName.value);
  if (!trimmed) {
    elements.collectionName.focus();
    return;
  }

  elements.collectionCreate.disabled = true;
  const isRename = collectionDialogMode.type === 'rename';
  clearCollectionDialogError();
  try {
    const updated = isRename
      ? await window.chmReader.renameCollection(collectionDialogMode.collectionId || '', trimmed)
      : await window.chmReader.createCollection(trimmed);
    const created = isRename
      ? updated.collections.find((collection) => collection.id === collectionDialogMode.collectionId)
      : updated.collections[updated.collections.length - 1];
    renderLibrary(updated);
    if (created) selectCollection(created.id);
    closeCollectionDialog();
  } catch (error: unknown) {
    elements.collectionError.textContent = t('collection.submitFailed', {
      action: t(isRename ? 'collection.actionRename' : 'collection.actionCreate'),
      error: error instanceof Error ? error.message : String(error),
    });
    elements.collectionError.hidden = false;
    elements.collectionName.setAttribute('aria-invalid', 'true');
    elements.collectionName.focus();
  } finally {
    elements.collectionCreate.disabled = false;
  }
}

async function loadLibrary(): Promise<void> {
  elements.libraryLoadError.hidden = true;
  elements.retryLibraryLoad.disabled = true;
  try {
    const nextLibrary = await window.chmReader.listLibrary();
    selectedCollectionId = loadSelectedCollectionPreference(
      Array.isArray(nextLibrary?.collections) ? nextLibrary.collections : [],
    );
    elements.libraryGrid.hidden = false;
    renderLibrary(nextLibrary);
  } catch (error: unknown) {
    elements.libraryGrid.replaceChildren();
    elements.libraryGrid.hidden = true;
    elements.libraryEmpty.hidden = true;
    elements.libraryEmptyFiltered.hidden = true;
    elements.libraryCount.textContent = '';
    elements.libraryLoadErrorMessage.textContent = t('library.loadError', {
      error: error instanceof Error ? error.message : String(error),
    });
    elements.libraryLoadError.hidden = false;
    elements.retryLibraryLoad.disabled = false;
  }
}

function setLoading(isLoading: boolean): void {
  elements.loadingState.hidden = !isLoading;
  if (isLoading) {
    elements.emptyState.hidden = true;
    elements.contentFrame.hidden = true;
  }
}

function renderNavigation(items: readonly BookContentsItem[]): void {
  elements.navigation.replaceChildren();

  if (!items.length) {
    const message = document.createElement('div');
    message.className = 'sidebar-placeholder';
    const paragraph = document.createElement('p');
    paragraph.append(...t('reader.noDirectory').split('\n').flatMap((part, index) => (
      index === 0 ? [document.createTextNode(part)] : [document.createElement('br'), document.createTextNode(part)]
    )));
    message.append(paragraph);
    elements.navigation.append(message);
    return;
  }

  const tree = document.createElement('ul');
  tree.className = 'tree';
  tree.setAttribute('role', 'tree');
  tree.append(...items.map((item) => createTreeItem(item, 1)));
  elements.navigation.append(tree);
  applySearchStateToNavigation();
}

function createTreeItem(item: BookContentsItem, level: number): HTMLLIElement {
  const listItem = document.createElement('li');
  const row = document.createElement('div') as unknown as UiElement;
  const disclosure = document.createElement('button');
  const link = document.createElement('button');
  const count = document.createElement('span');
  const hasChildren = item.children.length > 0;

  listItem.className = `tree-item${level === 1 ? ' expanded' : ''}`;
  listItem.dataset.title = item.title.toLocaleLowerCase();
  if (item.path) listItem.dataset.topicPath = item.path;
  listItem.setAttribute('role', 'treeitem');
  listItem.setAttribute('aria-level', String(level));
  if (hasChildren) listItem.setAttribute('aria-expanded', String(level === 1));

  row.className = 'tree-row';
  disclosure.className = `disclosure${hasChildren ? '' : ' placeholder'}`;
  disclosure.type = 'button';
  disclosure.tabIndex = hasChildren ? 0 : -1;
  disclosure.setAttribute('aria-label', t(level === 1 ? 'reader.collapseNamed' : 'reader.expandNamed', { name: item.title }));

  link.className = 'tree-link';
  link.type = 'button';
  link.textContent = item.title;
  link.title = item.title;
  count.className = 'tree-search-count';
  count.hidden = true;

  if (hasChildren) {
    disclosure.addEventListener('click', () => {
      const expanded = listItem.classList.toggle('expanded');
      listItem.setAttribute('aria-expanded', String(expanded));
      disclosure.setAttribute('aria-label', t(expanded ? 'reader.collapseNamed' : 'reader.expandNamed', { name: item.title }));
    });
  }

  if (item.path) {
    const topicPath = item.path;
    link.addEventListener('click', () => navigateTo(topicPath, true, row));
  } else if (hasChildren) {
    link.addEventListener('click', () => disclosure.click());
  } else {
    link.disabled = true;
  }

  row.append(disclosure, link, count);
  listItem.append(row);

  if (hasChildren) {
    const childList = document.createElement('ul');
    childList.setAttribute('role', 'group');
    childList.append(...item.children.map((child) => createTreeItem(child, level + 1)));
    listItem.append(childList);
  }

  return listItem;
}

function setTreeItemExpanded(item: HTMLElement, expanded: boolean): void {
  const hasChildren = item.querySelector(':scope > ul');
  if (!hasChildren) return;

  item.classList.toggle('expanded', expanded);
  item.setAttribute('aria-expanded', String(expanded));
  const title = item.dataset.title || t('reader.directoryScope');
  const disclosure = item.querySelector<HTMLElement>(':scope > .tree-row .disclosure');
  disclosure?.setAttribute('aria-label', t(expanded ? 'reader.collapseNamed' : 'reader.expandNamed', { name: title }));
}

function setAllTreeItemsExpanded(expanded: boolean): void {
  elements.navigation
    .querySelectorAll<HTMLElement>('.tree-item')
    .forEach((item) => setTreeItemExpanded(item, expanded));
}

function getTopicSearchResult(topicPath: string | null): SearchResult | null {
  if (!topicPath) return null;
  const pagePath = topicPath.split('#', 1)[0].toLocaleLowerCase();
  return searchState.resultsByPath.get(pagePath) || null;
}

function createSearchUrl(url: string, topicPath: string | null, matchIndex: number): string {
  const result = getTopicSearchResult(topicPath);
  if (searchState.scope !== 'body' || !searchState.query || !result) return url;

  const searchUrl = new URL(url);
  searchUrl.searchParams.set('search', searchState.query);
  searchUrl.searchParams.set('match', String(matchIndex));
  searchUrl.searchParams.set('theme', currentTheme);
  searchUrl.hash = 'chm-search-current';
  return searchUrl.toString();
}

function withContentPreferences(url: string): string {
  const contentUrl = new URL(url);
  contentUrl.searchParams.set('theme', currentTheme);
  return contentUrl.toString();
}

function showReaderActionError(action: string, error: unknown): void {
  // eslint-disable-next-line no-alert
  window.alert(`${action}：${error instanceof Error ? error.message : String(error)}`);
}

function openExternalLink(url: string): void {
  void window.chmReader.openExternal(url).catch((error: unknown) => {
    showReaderActionError(t('reader.openExternalFailed'), error);
  });
}

async function navigateTo(
  topicPath: string,
  addToHistory = true,
  activeRow: UiElement | null = null,
  matchIndex = 0,
): Promise<void> {
  try {
    const url = await window.chmReader.createBookUrl(topicPath);
    if (!url) return;

    const navigationRow = activeRow || findNavigationRow(topicPath);
    if (addToHistory) {
      history = history.slice(0, historyIndex + 1);
      history.push({ topicPath, row: navigationRow });
      historyIndex = history.length - 1;
    }

    currentTopicPath = topicPath;
    if (currentBook) saveReaderLastTopicPreference(currentBook, topicPath);
    updateDocumentTitle();
    const searchResult = getTopicSearchResult(topicPath);
    searchState.currentMatchIndex = searchResult
      ? Math.min(Math.max(0, matchIndex), searchResult.count - 1)
      : 0;
    if (navigationRow) {
      activateNavigationRow(navigationRow);
    }

    loadContent(createSearchUrl(withContentPreferences(url), topicPath, searchState.currentMatchIndex));
    updateHistoryButtons();
    updatePageButtons();
    updateSearchMatchNavigation();
  } catch (error: unknown) {
    showReaderActionError(t('reader.openTopicFailed'), error);
  }
}

function findNavigationRow(topicPath: string): UiElement | null {
  const item = [...elements.navigation.querySelectorAll<HTMLElement>('.tree-item')]
    .find((candidate) => candidate.dataset.topicPath === topicPath);
  return item?.querySelector<UiElement>(':scope > .tree-row') || null;
}

function activateNavigationRow(
  row: UiElement,
  options: { block?: ScrollLogicalPosition } = {},
): void {
  document.querySelector('.tree-row.active')?.classList.remove('active');
  row.classList.add('active');
  row.scrollIntoView({ block: options.block || 'nearest' });
}

function revealTopicInNavigation(topicPath: string | null): void {
  if (!topicPath) return;

  const item = [...elements.navigation.querySelectorAll<HTMLElement>('.tree-item')]
    .find((candidate) => candidate.dataset.topicPath === topicPath);
  if (!item) return;

  let parent = item.parentElement?.closest<HTMLElement>('.tree-item') || null;
  while (parent) {
    setTreeItemExpanded(parent, true);
    parent = parent.parentElement?.closest<HTMLElement>('.tree-item') || null;
  }

  const row = item.querySelector<UiElement>(':scope > .tree-row');
  if (row) activateNavigationRow(row, { block: 'center' });
}

function syncNavigationWithUrl(url: string): void {
  if (!currentBook || typeof url !== 'string' || !url.startsWith('chm://book/')) return;

  const topicPath = findTopicPathByUrl(
    currentBook.contents,
    url,
  );
  currentTopicPath = topicPath || currentTopicPath;
  updateDocumentTitle();
  if (topicPath) saveReaderLastTopicPreference(currentBook, topicPath);
  revealTopicInNavigation(topicPath);
  updatePageButtons();
}

function getContentFrameUrl(): string {
  try {
    return elements.contentFrame.contentWindow?.location.href || elements.contentFrame.src;
  } catch {
    return elements.contentFrame.src;
  }
}

function syncNavigationWithFrame(): void {
  syncNavigationWithUrl(getContentFrameUrl());
}

function loadContent(url: string): void {
  elements.contentFrame.hidden = false;
  elements.emptyState.hidden = true;
  setLoading(false);
  elements.contentFrame.src = 'about:blank';
  requestAnimationFrame(() => {
    elements.contentFrame.src = url;
  });
}

function updateHistoryButtons(): void {
  elements.back.disabled = historyIndex <= 0;
  elements.forward.disabled = historyIndex >= history.length - 1;
}

function updatePageButtons(): void {
  const currentIndex = currentTopicPath ? readingOrder.indexOf(currentTopicPath) : -1;
  elements.previousPage.disabled = currentIndex <= 0;
  elements.nextPage.disabled = currentIndex < 0 || currentIndex >= readingOrder.length - 1;
  updateReaderProgress(currentIndex);
}

function updateReaderProgress(currentIndex: number): void {
  elements.readerProgress.hidden = currentIndex < 0 || readingOrder.length === 0;
  elements.readerProgress.textContent = currentIndex >= 0
    ? t('reader.progress', { current: currentIndex + 1, total: readingOrder.length })
    : '';
}

function findTopicTitleByPath(items: readonly BookContentsItem[], topicPath: string): string | null {
  for (const item of items) {
    if (item.path === topicPath) return item.title;
    const childTitle = findTopicTitleByPath(item.children, topicPath);
    if (childTitle) return childTitle;
  }
  return null;
}

function updateSidebarTopicCount(): void {
  elements.sidebarTopicCount.hidden = readingOrder.length === 0;
  elements.sidebarTopicCount.textContent = readingOrder.length > 0
    ? t('reader.topicCount', { count: readingOrder.length })
    : '';
}

function moveHistory(offset: number): void {
  const nextIndex = historyIndex + offset;
  if (nextIndex < 0 || nextIndex >= history.length) return;

  historyIndex = nextIndex;
  const entry = history[historyIndex];
  navigateTo(entry.topicPath, false, entry.row);
}

function movePage(offset: number): void {
  const currentIndex = currentTopicPath ? readingOrder.indexOf(currentTopicPath) : -1;
  const nextTopicPath = readingOrder[currentIndex + offset];
  if (!nextTopicPath) return;

  navigateTo(nextTopicPath, true);
}

function applyBook(book: OpenedBook): void {
  if (!book) return;

  const preferredSearchScope = loadReaderSearchScopePreference();
  currentBook = book;
  currentTopicPath = null;
  history = [];
  historyIndex = -1;
  searchState = {
    scope: preferredSearchScope,
    query: '',
    resultsByPath: new Map(),
    currentMatchIndex: 0,
  };
  readingOrder = getTopicPathsInReadingOrder(book.contents);
  elements.bookTitle.textContent = book.name;
  updateDocumentTitle();
  updateSidebarTopicCount();
  setTextEncodingControlValue(book.textEncoding || 'auto');
  elements.search.disabled = book.contents.length === 0 && book.searchablePageCount === 0;
  elements.expandAll.disabled = book.contents.length === 0;
  elements.collapseAll.disabled = book.contents.length === 0;
  elements.refreshTree.disabled = book.contents.length === 0;
  elements.search.value = '';
  setSearchScope(preferredSearchScope, false);
  updateSearchStatus();
  updateSearchMatchNavigation();
  renderNavigation(book.contents);
  updateHistoryButtons();
  updatePageButtons();

  const restoreTopic = pendingTopicPathAfterEncoding && readingOrder.includes(pendingTopicPathAfterEncoding)
    ? pendingTopicPathAfterEncoding
    : null;
  const lastReadTopic = loadReaderLastTopicPreference(book, readingOrder);
  pendingTopicPathAfterEncoding = null;

  const initialTopic = restoreTopic || lastReadTopic || findFirstTopic(book.contents);
  if (initialTopic) {
    navigateTo(initialTopic, true, findNavigationRow(initialTopic));
  } else if (book.defaultPage) {
    loadContent(withContentPreferences(book.defaultPage));
  } else {
    setLoading(false);
    elements.emptyState.hidden = false;
  }
}

function getEncodingOptions(): UiElement[] {
  return [...elements.textEncodingMenu.querySelectorAll<UiElement>('.encoding-option')];
}

function getTextEncodingControlValue(): string {
  return elements.textEncoding.dataset.encoding || 'auto';
}

function setTextEncodingControlValue(encoding: string | null): void {
  const nextEncoding = encoding || 'auto';
  const options = getEncodingOptions();
  const selectedOption = options.find((option) => option.dataset.encoding === nextEncoding) || options[0];

  elements.textEncoding.dataset.encoding = selectedOption?.dataset.encoding || 'auto';
  elements.textEncodingValue.textContent = selectedOption?.textContent?.trim() || t('reader.defaultEncoding');
  options.forEach((option) => {
    option.setAttribute('aria-selected', String(option === selectedOption));
  });
}

function setEncodingMenuOpen(isOpen: boolean): void {
  if (isOpen && elements.textEncoding.disabled) return;

  elements.textEncodingMenu.hidden = !isOpen;
  elements.textEncoding.setAttribute('aria-expanded', String(isOpen));
  if (!isOpen) return;

  const selectedOption = getEncodingOptions()
    .find((option) => option.getAttribute('aria-selected') === 'true');
  selectedOption?.focus();
}

async function selectTextEncoding(nextEncoding: string): Promise<void> {
  const previousEncoding = getTextEncodingControlValue();
  setEncodingMenuOpen(false);
  if (nextEncoding === previousEncoding) return;

  pendingTopicPathAfterEncoding = currentTopicPath;
  elements.textEncoding.disabled = true;
  setTextEncodingControlValue(nextEncoding);
  try {
    await window.chmReader.setTextEncoding(nextEncoding);
    saveTextEncodingPreference(nextEncoding);
  } catch (error: unknown) {
    pendingTopicPathAfterEncoding = null;
    setTextEncodingControlValue(previousEncoding);
    window.alert(t('reader.encodingFailed', { error: error instanceof Error ? error.message : String(error) }));
  } finally {
    elements.textEncoding.disabled = false;
  }
}

function focusEncodingOption(offset: number): void {
  const options = getEncodingOptions();
  if (!options.length) return;

  const activeIndex = options.indexOf(document.activeElement as UiElement);
  const selectedIndex = options.findIndex((option) => option.getAttribute('aria-selected') === 'true');
  const currentIndex = activeIndex >= 0 ? activeIndex : Math.max(0, selectedIndex);
  const nextIndex = (currentIndex + offset + options.length) % options.length;
  options[nextIndex].focus();
}

function focusFirstEncodingOption(): void {
  getEncodingOptions()[0]?.focus();
}

function focusLastEncodingOption(): void {
  const options = getEncodingOptions();
  options[options.length - 1]?.focus();
}

function setTreeActionsMenuOpen(isOpen: boolean): void {
  elements.treeActionsMenu.hidden = !isOpen;
  elements.treeMenuTrigger.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) elements.expandAll.focus();
}

function refreshNavigationTree(): void {
  if (!currentBook) return;

  renderNavigation(currentBook.contents);
  if (currentTopicPath) {
    const activeRow = findNavigationRow(currentTopicPath);
    if (activeRow) activateNavigationRow(activeRow);
  }
}

function findFirstTopic(items: readonly BookContentsItem[]): string | null {
  for (const item of items) {
    if (item.path) return item.path;
    const childTopic = findFirstTopic(item.children);
    if (childTopic) return childTopic;
  }
  return null;
}

function updateSearchMatchNavigation() {
  const result = getTopicSearchResult(currentTopicPath);
  const matchCount = result?.count || 0;
  const hasCurrentPageMatches = searchState.scope === 'body'
    && Boolean(searchState.query)
    && Boolean(result);
  elements.searchMatchNavigation.hidden = !hasCurrentPageMatches;
  elements.searchToolbarSeparator.hidden = !hasCurrentPageMatches;
  elements.searchPrevious.disabled = !hasCurrentPageMatches || matchCount < 2;
  elements.searchNext.disabled = !hasCurrentPageMatches || matchCount < 2;
  elements.searchMatchPosition.value = hasCurrentPageMatches
    ? `${searchState.currentMatchIndex + 1} / ${matchCount}`
    : '0 / 0';
}

function applySearchStateToNavigation() {
  const topLevelItems = [...elements.navigation.querySelectorAll<HTMLElement>('.tree > .tree-item')];
  const hasQuery = Boolean(searchState.query);

  function applyBodySearch(item: HTMLElement): number {
    const childCount = [...item.querySelectorAll<HTMLElement>(':scope > ul > .tree-item')]
      .map((child) => applyBodySearch(child))
      .reduce((total, count) => total + count, 0);
    const ownCount = getTopicSearchResult(item.dataset.topicPath || null)?.count || 0;
    const total = ownCount + childCount;
    const count = item.querySelector<UiElement>(':scope > .tree-row .tree-search-count');
    if (!count) return total;
    count.hidden = total === 0;
    count.textContent = total ? `(${total})` : '';
    item.classList.toggle('search-match', ownCount > 0);
    item.classList.toggle('filtered-out', total === 0);
    if (total && childCount) setTreeItemExpanded(item, true);
    return total;
  }

  function applyDirectorySearch(item: HTMLElement): boolean {
    const childMatches = [...item.querySelectorAll<HTMLElement>(':scope > ul > .tree-item')]
      .map((child) => applyDirectorySearch(child))
      .some(Boolean);
    const ownMatch = (item.dataset.title || '').includes(searchState.query.toLocaleLowerCase());
    const matches = ownMatch || childMatches;
    item.classList.toggle('search-match', ownMatch);
    item.classList.toggle('filtered-out', !matches);
    const count = item.querySelector<UiElement>(':scope > .tree-row .tree-search-count');
    if (count) count.hidden = true;
    if (childMatches) setTreeItemExpanded(item, true);
    return matches;
  }

  topLevelItems.forEach((item) => {
    if (!hasQuery) {
      item.classList.remove('search-match', 'filtered-out');
      const count = item.querySelector<UiElement>(':scope > .tree-row .tree-search-count');
      if (count) count.hidden = true;
      return;
    }
    if (searchState.scope === 'body') applyBodySearch(item);
    else applyDirectorySearch(item);
  });

  if (hasQuery) {
    elements.navigation.querySelector('.tree-item.search-match > .tree-row')
      ?.scrollIntoView({ block: 'center' });
  }
}

function updateSearchStatus() {
  if (!searchState.query) {
    elements.searchStatus.textContent = '';
    return;
  }

  if (searchState.scope === 'directory') {
    const matches = elements.navigation.querySelectorAll('.tree-item.search-match').length;
    elements.searchStatus.textContent = t('reader.directoryResults', { count: matches });
    return;
  }

  const results = [...searchState.resultsByPath.values()];
  const count = results.reduce((total, result) => total + result.count, 0);
  elements.searchStatus.textContent = t('reader.bodyResults', { count, chapters: results.length });
}

function moveSearchMatch(offset: number): void {
  const result = getTopicSearchResult(currentTopicPath);
  if (!result || result.count < 2) return;
  const nextMatch = (searchState.currentMatchIndex + offset + result.count) % result.count;
  if (!currentTopicPath) return;
  navigateTo(currentTopicPath, false, findNavigationRow(currentTopicPath), nextMatch);
}

function getSearchScopeOptions(): UiElement[] {
  return [elements.searchBody, elements.searchDirectory];
}

function getSearchScopeFromOption(option: UiElement): SearchScope | null {
  if (option === elements.searchBody) return 'body';
  if (option === elements.searchDirectory) return 'directory';
  return null;
}

function setSearchScopeMenuOpen(isOpen: boolean): void {
  elements.searchScopeMenu.hidden = !isOpen;
  elements.searchScopeTrigger.setAttribute('aria-expanded', String(isOpen));
  if (!isOpen) return;

  const selectedOption = getSearchScopeOptions()
    .find((option) => option.getAttribute('aria-checked') === 'true');
  selectedOption?.focus();
}

function focusSearchScopeOption(offset: number): void {
  const options = getSearchScopeOptions();
  const activeIndex = options.indexOf(document.activeElement as UiElement);
  const selectedIndex = options.findIndex((option) => option.getAttribute('aria-checked') === 'true');
  const currentIndex = activeIndex >= 0 ? activeIndex : Math.max(0, selectedIndex);
  const nextIndex = (currentIndex + offset + options.length) % options.length;
  options[nextIndex].focus();
}

function focusFirstSearchScopeOption(): void {
  getSearchScopeOptions()[0]?.focus();
}

function focusLastSearchScopeOption(): void {
  const options = getSearchScopeOptions();
  options[options.length - 1]?.focus();
}

function setSearchScope(scope: SearchScope, persist = true): void {
  searchState.scope = scope;
  elements.searchBody.setAttribute('aria-checked', String(scope === 'body'));
  elements.searchDirectory.setAttribute('aria-checked', String(scope === 'directory'));
  elements.searchScopeLabel.textContent = t(scope === 'body' ? 'reader.body' : 'reader.directoryScope');
  elements.search.placeholder = t(scope === 'body' ? 'reader.searchBody' : 'reader.searchDirectory');
  setSearchScopeMenuOpen(false);
  if (persist) saveReaderSearchScopePreference(scope);
  searchNavigation(elements.search.value);
}

async function searchNavigation(query: string): Promise<void> {
  const normalizedQuery = query.trim();
  const requestId = ++searchRequestId;
  searchState.query = normalizedQuery;
  searchState.currentMatchIndex = 0;

  if (!normalizedQuery) {
    searchState.resultsByPath = new Map();
    renderNavigation(currentBook?.contents || []);
    updateSearchStatus();
    updateSearchMatchNavigation();
    if (currentTopicPath) navigateTo(currentTopicPath, false, findNavigationRow(currentTopicPath));
    return;
  }

  if (searchState.scope === 'directory') {
    searchState.resultsByPath = new Map();
    renderNavigation(currentBook?.contents || []);
    updateSearchStatus();
    updateSearchMatchNavigation();
    return;
  }

  try {
    const results = await window.chmReader.searchBook(normalizedQuery);
    if (requestId !== searchRequestId) return;
    searchState.resultsByPath = new Map(results.map((result) => [result.path.toLocaleLowerCase(), result]));
    renderNavigation(currentBook?.contents || []);
    updateSearchStatus();
    updateSearchMatchNavigation();
    if (currentTopicPath && getTopicSearchResult(currentTopicPath)) {
      navigateTo(currentTopicPath, false, findNavigationRow(currentTopicPath));
    }
  } catch (error: unknown) {
    if (requestId !== searchRequestId) return;
    searchState.resultsByPath = new Map();
    renderNavigation(currentBook?.contents || []);
    elements.searchStatus.textContent = t('reader.searchFailed', {
      error: error instanceof Error ? error.message : String(error),
    });
    updateSearchMatchNavigation();
  }
}

function clampReaderZoom(value: number): number {
  return Math.min(1.6, Math.max(0.7, value));
}

function loadReaderZoomPreference(): number {
  try {
    const saved = Number.parseFloat(window.localStorage.getItem(readerZoomStorageKey) || '');
    return Number.isFinite(saved) ? clampReaderZoom(saved) : 1;
  } catch {
    return 1;
  }
}

function saveReaderZoomPreference(): void {
  try {
    if (zoom === 1) {
      window.localStorage.removeItem(readerZoomStorageKey);
    } else {
      window.localStorage.setItem(readerZoomStorageKey, String(zoom));
    }
  } catch {
    // Ignore storage failures and keep the in-memory zoom for this session.
  }
}

function setZoom(nextZoom: number, persist = false): void {
  zoom = clampReaderZoom(nextZoom);
  elements.contentFrame.style.width = `${100 / zoom}%`;
  elements.contentFrame.style.height = `${100 / zoom}%`;
  elements.contentFrame.style.transform = `scale(${zoom})`;
  elements.contentFrame.style.transformOrigin = 'top left';
  elements.zoomReset.textContent = `${Math.round(zoom * 100)}%`;
  if (persist) saveReaderZoomPreference();
}

function isEditableShortcutTarget(target: EventTarget | null): boolean {
  const element = target instanceof Element ? target : null;
  if (!element) return false;
  const editable = element.closest<HTMLElement>('input, textarea, select, [contenteditable]');
  return Boolean(editable && editable.getAttribute('contenteditable') !== 'false');
}

function runReaderShortcut(command: ReaderShortcutCommand): void {
  if (document.body.dataset.view !== 'reader') return;

  switch (command) {
    case 'history-back':
      moveHistory(-1);
      return;
    case 'history-forward':
      moveHistory(1);
      return;
    case 'previous-topic':
      movePage(-1);
      return;
    case 'next-topic':
      movePage(1);
      return;
    case 'find-next':
      moveSearchMatch(1);
      return;
    case 'find-previous':
      moveSearchMatch(-1);
      return;
    case 'toggle-sidebar':
      toggleReaderSidebar();
      return;
    case 'zoom-out':
      setZoom(zoom - 0.1, true);
      return;
    case 'zoom-in':
      setZoom(zoom + 0.1, true);
      return;
    case 'zoom-reset':
      setZoom(1, true);
      return;
  }
}

function handleReaderKeyboardShortcut(event: KeyboardEvent): void {
  if (document.body.dataset.view !== 'reader') return;
  if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
  if (isEditableShortcutTarget(event.target)) return;

  if (event.key === '[' && !event.shiftKey) {
    event.preventDefault();
    runReaderShortcut('history-back');
    return;
  }

  if (event.key === ']' && !event.shiftKey) {
    event.preventDefault();
    runReaderShortcut('history-forward');
    return;
  }

  if (event.key === 'ArrowUp' && !event.shiftKey) {
    event.preventDefault();
    runReaderShortcut('previous-topic');
    return;
  }

  if (event.key === 'ArrowDown' && !event.shiftKey) {
    event.preventDefault();
    runReaderShortcut('next-topic');
    return;
  }

  if (event.key.toLocaleLowerCase() === 'b' && !event.shiftKey) {
    event.preventDefault();
    runReaderShortcut('toggle-sidebar');
    return;
  }

  if (event.key === '-' && !event.shiftKey) {
    event.preventDefault();
    runReaderShortcut('zoom-out');
    return;
  }

  if (event.key === '=' || event.key === '+') {
    event.preventDefault();
    runReaderShortcut('zoom-in');
    return;
  }

  if (event.key === '0' && !event.shiftKey) {
    event.preventDefault();
    runReaderShortcut('zoom-reset');
  }
}

async function requestImportBooks(): Promise<void> {
  elements.addBook.disabled = true;
  elements.emptyAddBook.disabled = true;
  try {
    const updated = await window.chmReader.importBooks(selectedCollectionId);
    if (updated) renderLibrary(updated);
  } catch (error: unknown) {
    showLibraryActionError(t('library.importFailed'), error);
  } finally {
    elements.addBook.disabled = false;
    elements.emptyAddBook.disabled = false;
  }
}

function getDroppedFiles(event: DragEvent): File[] {
  return [...(event.dataTransfer?.files || [])];
}

function hasFileTransfer(event: DragEvent): boolean {
  return [...(event.dataTransfer?.types || [])].includes('Files') || getDroppedFiles(event).length > 0;
}

function hasChmFile(files: readonly File[]): boolean {
  return files.some((file) => file.name.toLocaleLowerCase().endsWith('.chm'));
}

function setLibraryDropState(state: 'idle' | 'ready' | 'invalid'): void {
  elements.libraryContent.dataset.dragState = state;
  const isActive = state !== 'idle';
  elements.libraryDropTarget.setAttribute('aria-hidden', String(!isActive));
  if (state === 'invalid') {
    elements.libraryDropTarget.querySelector('strong')!.textContent = t('library.dropInvalidTitle');
    elements.libraryDropTarget.querySelector('span')!.textContent = t('library.dropInvalidSubtitle');
    return;
  }

  elements.libraryDropTarget.querySelector('strong')!.textContent = t('library.dropTitle');
  elements.libraryDropTarget.querySelector('span')!.textContent = t('library.dropSubtitle');
}

function resetLibraryDropState(): void {
  libraryDragDepth = 0;
  setLibraryDropState('idle');
}

async function importDroppedBooks(files: readonly File[]): Promise<void> {
  if (!hasChmFile(files)) return;

  try {
    const updated = await window.chmReader.importDroppedFiles(files, selectedCollectionId);
    renderLibrary(updated);
  } catch (error: unknown) {
    showLibraryActionError(t('library.dropImportFailed'), error);
  }
}

function initializeLibraryDropImport(): void {
  elements.libraryContent.addEventListener('dragenter', (event: DragEvent) => {
    const files = getDroppedFiles(event);
    if (!hasFileTransfer(event)) return;

    event.preventDefault();
    libraryDragDepth += 1;
    setLibraryDropState(files.length === 0 || hasChmFile(files) ? 'ready' : 'invalid');
  });

  elements.libraryContent.addEventListener('dragover', (event: DragEvent) => {
    const files = getDroppedFiles(event);
    if (!hasFileTransfer(event)) return;

    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = files.length === 0 || hasChmFile(files) ? 'copy' : 'none';
    }
  });

  elements.libraryContent.addEventListener('dragleave', (event: DragEvent) => {
    if (!hasFileTransfer(event)) return;

    libraryDragDepth = Math.max(0, libraryDragDepth - 1);
    if (libraryDragDepth === 0) setLibraryDropState('idle');
  });

  elements.libraryContent.addEventListener('drop', (event: DragEvent) => {
    const files = getDroppedFiles(event);
    if (!hasFileTransfer(event)) return;

    event.preventDefault();
    resetLibraryDropState();
    void importDroppedBooks(files);
  });
}

function initializeResizing() {
  let startX = 0;
  let startWidth = 0;

  elements.resizeHandle.addEventListener('pointerdown', (event: PointerEvent) => {
    startX = event.clientX;
    startWidth = query('#sidebar').getBoundingClientRect().width;
    elements.resizeHandle.setPointerCapture(event.pointerId);
  });

  elements.resizeHandle.addEventListener('pointermove', (event: PointerEvent) => {
    if (!elements.resizeHandle.hasPointerCapture(event.pointerId)) return;
    setReaderSidebarWidth(startWidth + event.clientX - startX, true);
  });

  elements.resizeHandle.addEventListener('keydown', (event: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const sidebar = query('#sidebar');
    const delta = event.key === 'ArrowLeft' ? -12 : 12;
    setReaderSidebarWidth(sidebar.getBoundingClientRect().width + delta, true);
  });
}

elements.addBook.addEventListener('click', requestImportBooks);
elements.emptyAddBook.addEventListener('click', requestImportBooks);
elements.retryLibraryLoad.addEventListener('click', () => void loadLibrary());
elements.emptyGettingStarted.addEventListener('click', () => {
  openExternalLink(onboardingLinks.readme);
});
elements.emptyFeatureTour.addEventListener('click', () => {
  openExternalLink(onboardingLinks.install);
});
elements.emptyPrivacy.addEventListener('click', () => {
  openExternalLink(onboardingLinks.privacy);
});
elements.emptyTroubleshooting.addEventListener('click', () => {
  openExternalLink(onboardingLinks.troubleshooting);
});
elements.addCollection.addEventListener('click', () => openCollectionDialog());
elements.collectionForm.addEventListener('submit', submitCreateCollection);
elements.collectionName.addEventListener('input', clearCollectionDialogError);
elements.collectionCancel.addEventListener('click', closeCollectionDialog);
elements.collectionDialog.addEventListener('pointerdown', (event) => {
  if (event.target === elements.collectionDialog) closeCollectionDialog();
});
elements.collectionRename.addEventListener('click', () => {
  if (contextCollection) openCollectionDialog(contextCollection);
});
elements.collectionDelete.addEventListener('click', () => {
  if (!contextCollection) return;
  const collection = contextCollection;
  const count = contextCollectionCount;
  hideCollectionContextMenu();
  void confirmAndRemoveCollection(collection, count);
});
elements.viewGrid.addEventListener('click', () => setLibraryLayout('grid'));
elements.viewList.addEventListener('click', () => setLibraryLayout('list'));
elements.librarySearch.addEventListener('input', (event: Event) => {
  libraryQuery = (event.currentTarget as UiElement).value;
  renderBooks();
});
elements.clearLibrarySearch.addEventListener('click', () => {
  libraryQuery = '';
  elements.librarySearch.value = '';
  renderBooks();
  elements.librarySearch.focus();
});
elements.emptySearchGuide.addEventListener('click', () => {
  openExternalLink(onboardingLinks.readme);
});
elements.backToLibrary.addEventListener('click', () => showView('library'));
elements.librarySettings.addEventListener('click', openSettings);
elements.readerSettings.addEventListener('click', openSettings);
elements.settingsBack.addEventListener('click', () => showView(settingsReturnView));
elements.appLanguage.addEventListener('change', () => {
  applyLocale(normalizeLocale(elements.appLanguage.value), true);
});
elements.themeOptions.addEventListener('change', (event: Event) => {
  const input = (event.target as Element | null)?.closest<HTMLInputElement>('input[name="app-theme"]');
  if (input) applyTheme(normalizeTheme(input.value), true);
});
query('#toggle-sidebar').addEventListener('click', toggleReaderSidebar);
elements.back.addEventListener('click', () => moveHistory(-1));
elements.forward.addEventListener('click', () => moveHistory(1));
elements.previousPage.addEventListener('click', () => movePage(-1));
elements.nextPage.addEventListener('click', () => movePage(1));
elements.treeMenuTrigger.addEventListener('click', () => {
  setTreeActionsMenuOpen(Boolean(elements.treeActionsMenu.hidden));
});
elements.expandAll.addEventListener('click', () => {
  setAllTreeItemsExpanded(true);
  setTreeActionsMenuOpen(false);
});
elements.collapseAll.addEventListener('click', () => {
  setAllTreeItemsExpanded(false);
  setTreeActionsMenuOpen(false);
});
elements.refreshTree.addEventListener('click', () => {
  refreshNavigationTree();
  setTreeActionsMenuOpen(false);
});
elements.contentFrame.addEventListener('load', syncNavigationWithFrame);
window.addEventListener('message', (event) => {
  if (event.source !== elements.contentFrame.contentWindow) return;
  if (event.data?.type === 'chm-reader:open-external') {
    openExternalLink(event.data.href);
    return;
  }
  if (event.data?.type === 'chm-reader:navigated') {
    syncNavigationWithUrl(event.data.href);
  }
});
elements.search.addEventListener('input', (event: Event) => {
  searchNavigation((event.currentTarget as UiElement).value);
});
elements.search.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  moveSearchMatch(event.shiftKey ? -1 : 1);
});
elements.searchScopeTrigger.addEventListener('click', () => {
  setSearchScopeMenuOpen(Boolean(elements.searchScopeMenu.hidden));
});
elements.searchScopeTrigger.addEventListener('keydown', (event: KeyboardEvent) => {
  if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) return;
  event.preventDefault();
  setSearchScopeMenuOpen(true);
  if (event.key === 'ArrowUp') focusLastSearchScopeOption();
});
elements.searchBody.addEventListener('click', () => setSearchScope('body'));
elements.searchDirectory.addEventListener('click', () => setSearchScope('directory'));
elements.searchScopeMenu.addEventListener('keydown', (event: KeyboardEvent) => {
  const option = (event.target as Element | null)?.closest<UiElement>('button');
  if (!option) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    focusSearchScopeOption(1);
    return;
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    focusSearchScopeOption(-1);
    return;
  }
  if (event.key === 'Home') {
    event.preventDefault();
    focusFirstSearchScopeOption();
    return;
  }
  if (event.key === 'End') {
    event.preventDefault();
    focusLastSearchScopeOption();
    return;
  }
  if (event.key === 'Escape') {
    event.preventDefault();
    setSearchScopeMenuOpen(false);
    elements.searchScopeTrigger.focus();
    return;
  }
  if (!['Enter', ' '].includes(event.key)) return;
  event.preventDefault();
  const scope = getSearchScopeFromOption(option);
  if (scope) setSearchScope(scope);
});
elements.searchPrevious.addEventListener('click', () => moveSearchMatch(-1));
elements.searchNext.addEventListener('click', () => moveSearchMatch(1));
elements.textEncoding.addEventListener('click', () => {
  setEncodingMenuOpen(Boolean(elements.textEncodingMenu.hidden));
});
elements.textEncoding.addEventListener('keydown', (event: KeyboardEvent) => {
  if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) return;
  event.preventDefault();
  setEncodingMenuOpen(true);
  if (event.key === 'ArrowUp') focusLastEncodingOption();
});
elements.textEncodingMenu.addEventListener('click', (event: MouseEvent) => {
  const option = (event.target as Element | null)?.closest<UiElement>('.encoding-option');
  const encoding = option?.dataset.encoding;
  if (encoding) selectTextEncoding(encoding);
});
elements.textEncodingMenu.addEventListener('keydown', (event: KeyboardEvent) => {
  const option = (event.target as Element | null)?.closest<UiElement>('.encoding-option');
  if (!option) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    focusEncodingOption(1);
    return;
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    focusEncodingOption(-1);
    return;
  }
  if (event.key === 'Home') {
    event.preventDefault();
    focusFirstEncodingOption();
    return;
  }
  if (event.key === 'End') {
    event.preventDefault();
    focusLastEncodingOption();
    return;
  }
  if (event.key === 'Escape') {
    event.preventDefault();
    setEncodingMenuOpen(false);
    elements.textEncoding.focus();
    return;
  }
  if (!['Enter', ' '].includes(event.key)) return;
  event.preventDefault();
  const encoding = option.dataset.encoding;
  if (encoding) selectTextEncoding(encoding);
});
document.addEventListener('pointerdown', (event: PointerEvent) => {
  const target = event.target as Element | null;
  if (!elements.collectionContextMenu.hidden && !target?.closest('.context-menu')) {
    hideCollectionContextMenu();
  }
  if (!elements.treeActionsMenu.hidden
    && !target?.closest('#tree-menu-trigger')
    && !target?.closest('#tree-actions-menu')) {
    setTreeActionsMenuOpen(false);
  }
  if (!elements.textEncodingMenu.hidden && !target?.closest('.encoding-picker')) {
    setEncodingMenuOpen(false);
  }
  if (elements.searchScopeMenu.hidden || target?.closest('.search-box')) return;
  setSearchScopeMenuOpen(false);
});
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key === ',') {
    event.preventDefault();
    openSettings();
    return;
  }
  handleReaderKeyboardShortcut(event);
  if (event.defaultPrevented) return;

  if (event.key === 'Escape' && !elements.textEncodingMenu.hidden) {
    setEncodingMenuOpen(false);
    elements.textEncoding.focus();
    return;
  }
  if (event.key === 'Escape' && !elements.treeActionsMenu.hidden) {
    setTreeActionsMenuOpen(false);
    elements.treeMenuTrigger.focus();
    return;
  }
  if (event.key === 'Escape' && !elements.collectionContextMenu.hidden) {
    hideCollectionContextMenu();
    return;
  }
  if (event.key === 'Escape' && !elements.collectionDialog.hidden) {
    closeCollectionDialog();
    return;
  }
  if (event.key !== 'Escape' || elements.searchScopeMenu.hidden) return;
  setSearchScopeMenuOpen(false);
  elements.searchScopeTrigger.focus();
});
query('#zoom-out').addEventListener('click', () => setZoom(zoom - 0.1, true));
query('#zoom-in').addEventListener('click', () => setZoom(zoom + 0.1, true));
elements.zoomReset.addEventListener('click', () => setZoom(1, true));
window.chmReader.onBookOpened(applyBook);
window.chmReader.onBookIndexReady(({ searchablePageCount }) => {
  if (!currentBook) return;
  currentBook.searchablePageCount = searchablePageCount;
  elements.search.disabled = currentBook.contents.length === 0 && searchablePageCount === 0;
});
window.chmReader.onLibraryUpdated(renderLibrary);
window.chmReader.onShowLibrary(() => showView('library'));
window.chmReader.onShowSettings(openSettings);
window.chmReader.onReaderShortcut(runReaderShortcut);
window.chmReader.onFocusSearch(() => {
  if (document.body.dataset.view === 'library') {
    elements.librarySearch.focus();
    elements.librarySearch.select();
    return;
  }
  if (document.body.dataset.view !== 'reader' || elements.search.disabled) return;
  elements.readerLayout.classList.remove('sidebar-hidden');
  elements.search.focus();
  elements.search.select();
});
initializeResizing();
initializeLibraryDropImport();
populateLanguageOptions();
applyStaticTranslations();
applyTheme(currentTheme);
setZoom(loadReaderZoomPreference());
setLibraryLayout(loadLibraryLayoutPreference());
setReaderSidebarWidth(loadReaderSidebarWidthPreference());
setReaderSidebarVisible(loadReaderSidebarVisiblePreference());
const preferredTextEncoding = loadTextEncodingPreference();
setTextEncodingControlValue(preferredTextEncoding);
window.chmReader.setTextEncoding(preferredTextEncoding).catch(() => {
  setTextEncodingControlValue('auto');
});
void loadLibrary();
