export { };

import type { BookContentsItem, SearchResult } from './chm';
import {
  getNextCollectionName,
  normalizeCollectionName,
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
  collectionId: string | null;
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
  openLibraryBook: (id: string) => Promise<OpenedBook | null>;
  removeLibraryBook: (id: string) => Promise<LibraryState>;
  createCollection: (name: string) => Promise<LibraryState>;
  renameCollection: (id: string, name: string) => Promise<LibraryState>;
  removeCollection: (id: string) => Promise<LibraryState>;
  createBookUrl: (topicPath: string | null) => Promise<string | null>;
  searchBook: (query: string) => Promise<SearchResult[]>;
  setTextEncoding: (encoding: string) => Promise<OpenedBook | { textEncoding: string | null }>;
  onBookOpened: (callback: (book: OpenedBook) => void) => () => void;
  onBookIndexReady: (callback: (result: { searchablePageCount: number }) => void) => () => void;
  onLibraryUpdated: (callback: (entries: LibraryState) => void) => () => void;
  onShowLibrary: (callback: () => void) => () => void;
  onFocusSearch: (callback: () => void) => () => void;
}

type SearchScope = 'body' | 'directory';
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
  libraryView: query('#library-view'),
  libraryContent: query('#library-content'),
  libraryEmpty: query('#library-empty'),
  libraryGrid: query('#library-grid'),
  libraryCount: query('#library-count'),
  libraryHeading: query('#library-heading'),
  collectionList: query('#collection-list'),
  addCollection: query('#add-collection'),
  collectionDialog: query('#collection-dialog'),
  collectionForm: query('#collection-form'),
  collectionDialogTitle: query('#collection-dialog-title'),
  collectionName: query('#collection-name'),
  collectionCancel: query('#collection-cancel'),
  collectionCreate: query('#collection-create'),
  collectionContextMenu: query('#collection-context-menu'),
  collectionRename: query('#collection-rename'),
  collectionDelete: query('#collection-delete'),
  viewGrid: query('#view-grid'),
  viewList: query('#view-list'),
  addBook: query('#add-book'),
  emptyAddBook: query('#empty-add-book'),
  backToLibrary: query('#back-to-library'),
  bookTitle: query('#book-title'),
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
};

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
let collectionDialogRestoreFocus: UiElement | null = null;
let collectionDialogMode: { type: 'create' | 'rename'; collectionId: string | null } = { type: 'create', collectionId: null };
let contextCollection: LibraryCollection | null = null;
let contextCollectionCount = 0;

function showView(view: 'library' | 'reader'): void {
  document.body.dataset.view = view;
  const isReader = view === 'reader';
  elements.libraryToolbar.hidden = isReader;
  elements.readerToolbar.hidden = !isReader;
  elements.libraryView.hidden = isReader;
  elements.readerLayout.hidden = !isReader;
}

function booksInSelectedCollection(): LibraryBook[] {
  if (selectedCollectionId === null) return library.books;
  return library.books.filter((book) => book.collectionId === selectedCollectionId);
}

function setLibraryLayout(layout: 'grid' | 'list'): void {
  libraryLayout = layout;
  elements.libraryContent.dataset.layout = layout;
  elements.viewGrid.setAttribute('aria-pressed', String(layout === 'grid'));
  elements.viewList.setAttribute('aria-pressed', String(layout === 'list'));
}

function selectCollection(id: string | null): void {
  selectedCollectionId = id;
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
  elements.collectionList.append(
    createCollectionItem({ id: null, name: '全部' }, library.books.length, false),
  );
  library.collections.forEach((collection) => {
    const count = library.books.filter((book) => book.collectionId === collection.id).length;
    elements.collectionList.append(createCollectionItem(collection, count, true));
  });
}

function createCollectionItem(collection: CollectionItem, count: number, removable: boolean): HTMLDivElement {
  const item = document.createElement('div');
  item.className = 'collection-item';
  item.classList.toggle('active', selectedCollectionId === collection.id);

  const select = document.createElement('button');
  select.className = 'collection-select';
  select.type = 'button';
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
    remove.title = '删除书库';
    remove.setAttribute('aria-label', `删除书库 ${collection.name}`);
    remove.addEventListener('click', async (event) => {
      event.stopPropagation();
      await confirmAndRemoveCollection(collection as LibraryCollection, count);
    });
    item.append(remove);
  }

  return item;
}

function renderBooks() {
  const books = booksInSelectedCollection();
  const activeName = selectedCollectionId === null
    ? '全部'
    : library.collections.find((collection) => collection.id === selectedCollectionId)?.name || '书库';

  elements.libraryHeading.textContent = activeName;
  elements.libraryGrid.replaceChildren();
  elements.libraryEmpty.hidden = books.length > 0;
  elements.libraryCount.textContent = books.length ? `${books.length} 本文档` : '';

  books.forEach((entry) => elements.libraryGrid.append(createLibraryCard(entry)));
}

function createLibraryCard(entry: LibraryBook): HTMLDivElement {
  const card = document.createElement('div');
  card.className = 'library-card';
  card.dataset.id = entry.id;
  card.setAttribute('role', 'listitem');

  const open = document.createElement('button');
  open.className = 'library-card-open';
  open.type = 'button';
  open.title = entry.name;
  open.innerHTML = `
    <span class="library-cover" aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <path d="M13 9h27a7 7 0 0 1 7 7v39H20a7 7 0 0 1-7-7V9Z"></path>
        <path d="M20 55a7 7 0 0 1 7-7h24V16h-4"></path>
        <path d="M23 21h14M23 29h14M23 37h9"></path>
      </svg>
    </span>
    <span class="library-name"></span>`;
  const nameElement = open.querySelector<HTMLElement>('.library-name');
  if (nameElement) nameElement.textContent = entry.name;
  open.addEventListener('click', () => openLibraryBook(entry.id));

  const remove = document.createElement('button');
  remove.className = 'library-card-remove';
  remove.type = 'button';
  remove.setAttribute('aria-label', `从书库移除 ${entry.name}`);
  remove.title = '从书库移除';
  remove.textContent = '×';
  remove.addEventListener('click', async (event) => {
    event.stopPropagation();
    const updated = await window.chmReader.removeLibraryBook(entry.id);
    renderLibrary(updated);
  });

  card.append(open, remove);
  return card;
}

async function openLibraryBook(id: string): Promise<void> {
  showView('reader');
  elements.bookTitle.textContent = '正在打开...';
  setLoading(true);
  const book = await window.chmReader.openLibraryBook(id);
  if (!book) showView('library');
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
    ? `删除书库“${collection.name}”后，其中的 ${count} 个文档会移动到“全部”（不会删除源文件）。`
    : `删除书库“${collection.name}”？`;
  // eslint-disable-next-line no-alert
  if (!window.confirm(message)) return;
  const updated = await window.chmReader.removeCollection(collection.id);
  renderLibrary(updated);
}

function openCollectionDialog(collection: LibraryCollection | null = null): void {
  hideCollectionContextMenu();
  const isRename = Boolean(collection);
  collectionDialogRestoreFocus = document.activeElement as UiElement | null;
  collectionDialogMode = {
    type: isRename ? 'rename' : 'create',
    collectionId: collection?.id || null,
  };
  elements.collectionDialogTitle.textContent = isRename ? '重命名书库' : '新建书库';
  elements.collectionCreate.textContent = isRename ? '保存' : '创建';
  elements.collectionName.value = isRename
    ? collection?.name || ''
    : getNextCollectionName(library.collections);
  elements.collectionDialog.hidden = false;
  requestAnimationFrame(() => {
    elements.collectionName.focus();
    elements.collectionName.select();
  });
}

function closeCollectionDialog() {
  elements.collectionDialog.hidden = true;
  elements.collectionCreate.disabled = false;
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
  const updated = isRename
    ? await window.chmReader.renameCollection(collectionDialogMode.collectionId || '', trimmed)
    : await window.chmReader.createCollection(trimmed);
  const created = isRename
    ? updated.collections.find((collection) => collection.id === collectionDialogMode.collectionId)
    : updated.collections[updated.collections.length - 1];
  renderLibrary(updated);
  if (created) selectCollection(created.id);
  closeCollectionDialog();
}

async function loadLibrary() {
  const nextLibrary = await window.chmReader.listLibrary();
  renderLibrary(nextLibrary);
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
    message.innerHTML = '<p>此文档未提供目录<br>仍可阅读默认页面</p>';
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
  disclosure.setAttribute('aria-label', `${level === 1 ? '折叠' : '展开'} ${item.title}`);

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
      disclosure.setAttribute('aria-label', `${expanded ? '折叠' : '展开'} ${item.title}`);
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
  const title = item.dataset.title || '目录';
  const disclosure = item.querySelector<HTMLElement>(':scope > .tree-row .disclosure');
  disclosure?.setAttribute('aria-label', `${expanded ? '折叠' : '展开'} ${title}`);
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
  searchUrl.hash = 'chm-search-current';
  return searchUrl.toString();
}

async function navigateTo(
  topicPath: string,
  addToHistory = true,
  activeRow: UiElement | null = null,
  matchIndex = 0,
): Promise<void> {
  const url = await window.chmReader.createBookUrl(topicPath);
  if (!url) return;

  const navigationRow = activeRow || findNavigationRow(topicPath);
  if (addToHistory) {
    history = history.slice(0, historyIndex + 1);
    history.push({ topicPath, row: navigationRow });
    historyIndex = history.length - 1;
  }

  currentTopicPath = topicPath;
  const searchResult = getTopicSearchResult(topicPath);
  searchState.currentMatchIndex = searchResult
    ? Math.min(Math.max(0, matchIndex), searchResult.count - 1)
    : 0;
  if (navigationRow) {
    activateNavigationRow(navigationRow);
  }

  loadContent(createSearchUrl(url, topicPath, searchState.currentMatchIndex));
  updateHistoryButtons();
  updatePageButtons();
  updateSearchMatchNavigation();
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

  currentBook = book;
  currentTopicPath = null;
  history = [];
  historyIndex = -1;
  searchState = {
    scope: 'body',
    query: '',
    resultsByPath: new Map(),
    currentMatchIndex: 0,
  };
  readingOrder = getTopicPathsInReadingOrder(book.contents);
  elements.bookTitle.textContent = book.name;
  elements.textEncoding.value = book.textEncoding || 'auto';
  elements.search.disabled = book.contents.length === 0 && book.searchablePageCount === 0;
  elements.expandAll.disabled = book.contents.length === 0;
  elements.collapseAll.disabled = book.contents.length === 0;
  elements.refreshTree.disabled = book.contents.length === 0;
  elements.search.value = '';
  elements.searchBody.setAttribute('aria-checked', 'true');
  elements.searchDirectory.setAttribute('aria-checked', 'false');
  elements.searchScopeLabel.textContent = '正文';
  elements.search.placeholder = '搜索正文';
  elements.searchScopeMenu.hidden = true;
  elements.searchScopeTrigger.setAttribute('aria-expanded', 'false');
  updateSearchStatus();
  updateSearchMatchNavigation();
  renderNavigation(book.contents);
  updateHistoryButtons();
  updatePageButtons();

  const restoreTopic = pendingTopicPathAfterEncoding && readingOrder.includes(pendingTopicPathAfterEncoding)
    ? pendingTopicPathAfterEncoding
    : null;
  pendingTopicPathAfterEncoding = null;

  const initialTopic = restoreTopic || findFirstTopic(book.contents);
  if (initialTopic) {
    navigateTo(initialTopic, true, findNavigationRow(initialTopic));
  } else if (book.defaultPage) {
    loadContent(book.defaultPage);
  } else {
    setLoading(false);
    elements.emptyState.hidden = false;
  }
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
    elements.searchStatus.textContent = `目录中找到 ${matches} 项`;
    return;
  }

  const results = [...searchState.resultsByPath.values()];
  const count = results.reduce((total, result) => total + result.count, 0);
  elements.searchStatus.textContent = `正文中找到 ${count} 处，涉及 ${results.length} 个章节`;
}

function moveSearchMatch(offset: number): void {
  const result = getTopicSearchResult(currentTopicPath);
  if (!result || result.count < 2) return;
  const nextMatch = (searchState.currentMatchIndex + offset + result.count) % result.count;
  if (!currentTopicPath) return;
  navigateTo(currentTopicPath, false, findNavigationRow(currentTopicPath), nextMatch);
}

function setSearchScope(scope: SearchScope): void {
  searchState.scope = scope;
  elements.searchBody.setAttribute('aria-checked', String(scope === 'body'));
  elements.searchDirectory.setAttribute('aria-checked', String(scope === 'directory'));
  elements.searchScopeLabel.textContent = scope === 'body' ? '正文' : '目录';
  elements.search.placeholder = scope === 'body' ? '搜索正文' : '搜索目录';
  elements.searchScopeMenu.hidden = true;
  elements.searchScopeTrigger.setAttribute('aria-expanded', 'false');
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

  const results = await window.chmReader.searchBook(normalizedQuery);
  if (requestId !== searchRequestId) return;
  searchState.resultsByPath = new Map(results.map((result) => [result.path.toLocaleLowerCase(), result]));
  renderNavigation(currentBook?.contents || []);
  updateSearchStatus();
  updateSearchMatchNavigation();
  if (currentTopicPath && getTopicSearchResult(currentTopicPath)) {
    navigateTo(currentTopicPath, false, findNavigationRow(currentTopicPath));
  }
}

function setZoom(nextZoom: number): void {
  zoom = Math.min(1.6, Math.max(0.7, nextZoom));
  elements.contentFrame.style.width = `${100 / zoom}%`;
  elements.contentFrame.style.height = `${100 / zoom}%`;
  elements.contentFrame.style.transform = `scale(${zoom})`;
  elements.contentFrame.style.transformOrigin = 'top left';
  elements.zoomReset.textContent = `${Math.round(zoom * 100)}%`;
}

async function requestImportBooks() {
  const updated = await window.chmReader.importBooks(selectedCollectionId);
  if (updated) renderLibrary(updated);
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
    const width = Math.min(460, Math.max(210, startWidth + event.clientX - startX));
    elements.readerLayout.style.setProperty('--sidebar-width', `${width}px`);
  });

  elements.resizeHandle.addEventListener('keydown', (event: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const sidebar = query('#sidebar');
    const delta = event.key === 'ArrowLeft' ? -12 : 12;
    const width = Math.min(460, Math.max(210, sidebar.getBoundingClientRect().width + delta));
    elements.readerLayout.style.setProperty('--sidebar-width', `${width}px`);
  });
}

elements.addBook.addEventListener('click', requestImportBooks);
elements.emptyAddBook.addEventListener('click', requestImportBooks);
elements.addCollection.addEventListener('click', () => openCollectionDialog());
elements.collectionForm.addEventListener('submit', submitCreateCollection);
elements.collectionCancel.addEventListener('click', closeCollectionDialog);
elements.collectionDialog.addEventListener('pointerdown', (event) => {
  if (event.target === elements.collectionDialog) closeCollectionDialog();
});
elements.collectionRename.addEventListener('click', () => {
  if (contextCollection) openCollectionDialog(contextCollection);
});
elements.collectionDelete.addEventListener('click', async () => {
  if (!contextCollection) return;
  const collection = contextCollection;
  const count = contextCollectionCount;
  hideCollectionContextMenu();
  await confirmAndRemoveCollection(collection, count);
});
elements.viewGrid.addEventListener('click', () => setLibraryLayout('grid'));
elements.viewList.addEventListener('click', () => setLibraryLayout('list'));
elements.backToLibrary.addEventListener('click', () => showView('library'));
query('#toggle-sidebar').addEventListener('click', () => {
  elements.readerLayout.classList.toggle('sidebar-hidden');
});
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
  if (event.data?.type !== 'chm-reader:navigated') return;
  syncNavigationWithUrl(event.data.href);
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
  const isOpen = !elements.searchScopeMenu.hidden;
  elements.searchScopeMenu.hidden = isOpen;
  elements.searchScopeTrigger.setAttribute('aria-expanded', String(!isOpen));
});
elements.searchBody.addEventListener('click', () => setSearchScope('body'));
elements.searchDirectory.addEventListener('click', () => setSearchScope('directory'));
elements.searchPrevious.addEventListener('click', () => moveSearchMatch(-1));
elements.searchNext.addEventListener('click', () => moveSearchMatch(1));
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
  if (elements.searchScopeMenu.hidden || target?.closest('.search-box')) return;
  elements.searchScopeMenu.hidden = true;
  elements.searchScopeTrigger.setAttribute('aria-expanded', 'false');
});
document.addEventListener('keydown', (event) => {
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
  elements.searchScopeMenu.hidden = true;
  elements.searchScopeTrigger.setAttribute('aria-expanded', 'false');
  elements.searchScopeTrigger.focus();
});
query('#zoom-out').addEventListener('click', () => setZoom(zoom - 0.1));
query('#zoom-in').addEventListener('click', () => setZoom(zoom + 0.1));
elements.zoomReset.addEventListener('click', () => setZoom(1));
elements.textEncoding.addEventListener('change', async () => {
  const previousEncoding = currentBook?.textEncoding || 'auto';
  pendingTopicPathAfterEncoding = currentTopicPath;
  elements.textEncoding.disabled = true;
  try {
    await window.chmReader.setTextEncoding(elements.textEncoding.value);
  } catch (error: unknown) {
    pendingTopicPathAfterEncoding = null;
    elements.textEncoding.value = previousEncoding;
    window.alert(`无法切换文本编码：${error instanceof Error ? error.message : String(error)}`);
  } finally {
    elements.textEncoding.disabled = false;
  }
});

window.chmReader.onBookOpened(applyBook);
window.chmReader.onBookIndexReady(({ searchablePageCount }) => {
  if (!currentBook) return;
  currentBook.searchablePageCount = searchablePageCount;
  elements.search.disabled = currentBook.contents.length === 0 && searchablePageCount === 0;
});
window.chmReader.onLibraryUpdated(renderLibrary);
window.chmReader.onShowLibrary(() => showView('library'));
window.chmReader.onFocusSearch(() => {
  if (document.body.dataset.view !== 'reader' || elements.search.disabled) return;
  elements.readerLayout.classList.remove('sidebar-hidden');
  elements.search.focus();
  elements.search.select();
});
initializeResizing();
setZoom(1);
setLibraryLayout('grid');
loadLibrary();
