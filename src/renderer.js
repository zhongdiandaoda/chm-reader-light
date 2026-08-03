const elements = {
  libraryToolbar: document.querySelector('#library-toolbar'),
  readerToolbar: document.querySelector('#reader-toolbar'),
  libraryView: document.querySelector('#library-view'),
  libraryContent: document.querySelector('#library-content'),
  libraryEmpty: document.querySelector('#library-empty'),
  libraryGrid: document.querySelector('#library-grid'),
  libraryCount: document.querySelector('#library-count'),
  libraryHeading: document.querySelector('#library-heading'),
  collectionList: document.querySelector('#collection-list'),
  addCollection: document.querySelector('#add-collection'),
  collectionDialog: document.querySelector('#collection-dialog'),
  collectionForm: document.querySelector('#collection-form'),
  collectionDialogTitle: document.querySelector('#collection-dialog-title'),
  collectionName: document.querySelector('#collection-name'),
  collectionCancel: document.querySelector('#collection-cancel'),
  collectionCreate: document.querySelector('#collection-create'),
  collectionContextMenu: document.querySelector('#collection-context-menu'),
  collectionRename: document.querySelector('#collection-rename'),
  collectionDelete: document.querySelector('#collection-delete'),
  viewGrid: document.querySelector('#view-grid'),
  viewList: document.querySelector('#view-list'),
  addBook: document.querySelector('#add-book'),
  emptyAddBook: document.querySelector('#empty-add-book'),
  backToLibrary: document.querySelector('#back-to-library'),
  bookTitle: document.querySelector('#book-title'),
  contentFrame: document.querySelector('#content-frame'),
  emptyState: document.querySelector('#empty-state'),
  loadingState: document.querySelector('#loading-state'),
  navigation: document.querySelector('#navigation'),
  readerLayout: document.querySelector('#reader-layout'),
  resizeHandle: document.querySelector('#resize-handle'),
  search: document.querySelector('#search-navigation'),
  searchScopeTrigger: document.querySelector('#search-scope-trigger'),
  searchScopeMenu: document.querySelector('#search-scope-menu'),
  searchScopeLabel: document.querySelector('#search-scope-label'),
  searchBody: document.querySelector('#search-body'),
  searchDirectory: document.querySelector('#search-directory'),
  searchStatus: document.querySelector('#search-status'),
  searchMatchNavigation: document.querySelector('#search-match-navigation'),
  searchToolbarSeparator: document.querySelector('#search-toolbar-separator'),
  searchPrevious: document.querySelector('#search-previous'),
  searchNext: document.querySelector('#search-next'),
  searchMatchPosition: document.querySelector('#search-match-position'),
  back: document.querySelector('#go-back'),
  forward: document.querySelector('#go-forward'),
  previousPage: document.querySelector('#previous-page'),
  nextPage: document.querySelector('#next-page'),
  treeMenuTrigger: document.querySelector('#tree-menu-trigger'),
  treeActionsMenu: document.querySelector('#tree-actions-menu'),
  expandAll: document.querySelector('#expand-all'),
  collapseAll: document.querySelector('#collapse-all'),
  refreshTree: document.querySelector('#refresh-tree'),
  zoomReset: document.querySelector('#zoom-reset'),
  textEncoding: document.querySelector('#text-encoding'),
};

const {
  getNextCollectionName,
  normalizeCollectionName,
} = window.chmLibrary;

let currentBook;
let currentTopicPath;
let history = [];
let historyIndex = -1;
let readingOrder = [];
let zoom = 1;
let searchRequestId = 0;
let pendingTopicPathAfterEncoding = null;
let searchState = {
  scope: 'body',
  query: '',
  resultsByPath: new Map(),
  currentMatchIndex: 0,
};

let library = { collections: [], books: [] };
let selectedCollectionId = null; // null = 全部
let libraryLayout = 'grid';
let collectionDialogRestoreFocus = null;
let collectionDialogMode = { type: 'create', collectionId: null };
let contextCollection = null;
let contextCollectionCount = 0;

function showView(view) {
  document.body.dataset.view = view;
  const isReader = view === 'reader';
  elements.libraryToolbar.hidden = isReader;
  elements.readerToolbar.hidden = !isReader;
  elements.libraryView.hidden = isReader;
  elements.readerLayout.hidden = !isReader;
}

function booksInSelectedCollection() {
  if (selectedCollectionId === null) return library.books;
  return library.books.filter((book) => book.collectionId === selectedCollectionId);
}

function setLibraryLayout(layout) {
  libraryLayout = layout;
  elements.libraryContent.dataset.layout = layout;
  elements.viewGrid.setAttribute('aria-pressed', String(layout === 'grid'));
  elements.viewList.setAttribute('aria-pressed', String(layout === 'list'));
}

function selectCollection(id) {
  selectedCollectionId = id;
  renderLibrary(library);
}

function renderLibrary(nextLibrary) {
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

function createCollectionItem(collection, count, removable) {
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
      openCollectionContextMenu(event, collection, count);
    });

    const remove = document.createElement('button');
    remove.className = 'collection-remove';
    remove.type = 'button';
    remove.textContent = '×';
    remove.title = '删除书库';
    remove.setAttribute('aria-label', `删除书库 ${collection.name}`);
    remove.addEventListener('click', async (event) => {
      event.stopPropagation();
      await confirmAndRemoveCollection(collection, count);
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

function createLibraryCard(entry) {
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
  open.querySelector('.library-name').textContent = entry.name;
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

async function openLibraryBook(id) {
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

function openCollectionContextMenu(event, collection, count) {
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

async function confirmAndRemoveCollection(collection, count) {
  const message = count > 0
    ? `删除书库“${collection.name}”后，其中的 ${count} 个文档会移动到“全部”（不会删除源文件）。`
    : `删除书库“${collection.name}”？`;
  // eslint-disable-next-line no-alert
  if (!window.confirm(message)) return;
  const updated = await window.chmReader.removeCollection(collection.id);
  renderLibrary(updated);
}

function openCollectionDialog(collection = null) {
  hideCollectionContextMenu();
  const isRename = Boolean(collection);
  collectionDialogRestoreFocus = document.activeElement;
  collectionDialogMode = {
    type: isRename ? 'rename' : 'create',
    collectionId: collection?.id || null,
  };
  elements.collectionDialogTitle.textContent = isRename ? '重命名书库' : '新建书库';
  elements.collectionCreate.textContent = isRename ? '保存' : '创建';
  elements.collectionName.value = isRename
    ? collection.name
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

async function submitCreateCollection(event) {
  event.preventDefault();
  const trimmed = normalizeCollectionName(elements.collectionName.value);
  if (!trimmed) {
    elements.collectionName.focus();
    return;
  }

  elements.collectionCreate.disabled = true;
  const isRename = collectionDialogMode.type === 'rename';
  const updated = isRename
    ? await window.chmReader.renameCollection(collectionDialogMode.collectionId, trimmed)
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

function setLoading(isLoading) {
  elements.loadingState.hidden = !isLoading;
  if (isLoading) {
    elements.emptyState.hidden = true;
    elements.contentFrame.hidden = true;
  }
}

function renderNavigation(items) {
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

function createTreeItem(item, level) {
  const listItem = document.createElement('li');
  const row = document.createElement('div');
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
    link.addEventListener('click', () => navigateTo(item.path, true, row));
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

function setTreeItemExpanded(item, expanded) {
  const hasChildren = item.querySelector(':scope > ul');
  if (!hasChildren) return;

  item.classList.toggle('expanded', expanded);
  item.setAttribute('aria-expanded', String(expanded));
  const title = item.dataset.title || '目录';
  const disclosure = item.querySelector(':scope > .tree-row .disclosure');
  disclosure?.setAttribute('aria-label', `${expanded ? '折叠' : '展开'} ${title}`);
}

function setAllTreeItemsExpanded(expanded) {
  elements.navigation
    .querySelectorAll('.tree-item')
    .forEach((item) => setTreeItemExpanded(item, expanded));
}

function getTopicSearchResult(topicPath) {
  const pagePath = topicPath?.split('#', 1)[0]?.toLocaleLowerCase();
  return searchState.resultsByPath.get(pagePath) || null;
}

function createSearchUrl(url, topicPath, matchIndex) {
  const result = getTopicSearchResult(topicPath);
  if (searchState.scope !== 'body' || !searchState.query || !result) return url;

  const searchUrl = new URL(url);
  searchUrl.searchParams.set('search', searchState.query);
  searchUrl.searchParams.set('match', String(matchIndex));
  searchUrl.hash = 'chm-search-current';
  return searchUrl.toString();
}

async function navigateTo(topicPath, addToHistory = true, activeRow = null, matchIndex = 0) {
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

function findNavigationRow(topicPath) {
  const item = [...elements.navigation.querySelectorAll('.tree-item')]
    .find((candidate) => candidate.dataset.topicPath === topicPath);
  return item?.querySelector(':scope > .tree-row') || null;
}

function activateNavigationRow(row, options = {}) {
  document.querySelector('.tree-row.active')?.classList.remove('active');
  row.classList.add('active');
  row.scrollIntoView({ block: options.block || 'nearest' });
}

function revealTopicInNavigation(topicPath) {
  if (!topicPath) return;

  const item = [...elements.navigation.querySelectorAll('.tree-item')]
    .find((candidate) => candidate.dataset.topicPath === topicPath);
  if (!item) return;

  let parent = item.parentElement?.closest('.tree-item');
  while (parent) {
    setTreeItemExpanded(parent, true);
    parent = parent.parentElement?.closest('.tree-item');
  }

  const row = item.querySelector(':scope > .tree-row');
  if (row) activateNavigationRow(row, { block: 'center' });
}

function syncNavigationWithUrl(url) {
  if (!currentBook || typeof url !== 'string' || !url.startsWith('chm://book/')) return;

  const topicPath = window.chmNavigation.findTopicPathByUrl(
    currentBook.contents,
    url,
  );
  currentTopicPath = topicPath || currentTopicPath;
  revealTopicInNavigation(topicPath);
  updatePageButtons();
}

function getContentFrameUrl() {
  try {
    return elements.contentFrame.contentWindow?.location.href || elements.contentFrame.src;
  } catch {
    return elements.contentFrame.src;
  }
}

function syncNavigationWithFrame() {
  syncNavigationWithUrl(getContentFrameUrl());
}

function loadContent(url) {
  elements.contentFrame.hidden = false;
  elements.emptyState.hidden = true;
  setLoading(false);
  elements.contentFrame.src = 'about:blank';
  requestAnimationFrame(() => {
    elements.contentFrame.src = url;
  });
}

function updateHistoryButtons() {
  elements.back.disabled = historyIndex <= 0;
  elements.forward.disabled = historyIndex >= history.length - 1;
}

function updatePageButtons() {
  const currentIndex = readingOrder.indexOf(currentTopicPath);
  elements.previousPage.disabled = currentIndex <= 0;
  elements.nextPage.disabled = currentIndex < 0 || currentIndex >= readingOrder.length - 1;
}

function moveHistory(offset) {
  const nextIndex = historyIndex + offset;
  if (nextIndex < 0 || nextIndex >= history.length) return;

  historyIndex = nextIndex;
  const entry = history[historyIndex];
  navigateTo(entry.topicPath, false, entry.row);
}

function movePage(offset) {
  const currentIndex = readingOrder.indexOf(currentTopicPath);
  const nextTopicPath = readingOrder[currentIndex + offset];
  if (!nextTopicPath) return;

  navigateTo(nextTopicPath, true);
}

function applyBook(book) {
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
  readingOrder = window.chmNavigation.getTopicPathsInReadingOrder(book.contents);
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

function setTreeActionsMenuOpen(isOpen) {
  elements.treeActionsMenu.hidden = !isOpen;
  elements.treeMenuTrigger.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) elements.expandAll.focus();
}

function refreshNavigationTree() {
  if (!currentBook) return;

  renderNavigation(currentBook.contents);
  if (currentTopicPath) {
    const activeRow = findNavigationRow(currentTopicPath);
    if (activeRow) activateNavigationRow(activeRow);
  }
}

function findFirstTopic(items) {
  for (const item of items) {
    if (item.path) return item.path;
    const childTopic = findFirstTopic(item.children);
    if (childTopic) return childTopic;
  }
  return null;
}

function updateSearchMatchNavigation() {
  const result = getTopicSearchResult(currentTopicPath);
  const hasCurrentPageMatches = searchState.scope === 'body'
    && Boolean(searchState.query)
    && Boolean(result);
  elements.searchMatchNavigation.hidden = !hasCurrentPageMatches;
  elements.searchToolbarSeparator.hidden = !hasCurrentPageMatches;
  elements.searchPrevious.disabled = !hasCurrentPageMatches || result.count < 2;
  elements.searchNext.disabled = !hasCurrentPageMatches || result.count < 2;
  elements.searchMatchPosition.value = hasCurrentPageMatches
    ? `${searchState.currentMatchIndex + 1} / ${result.count}`
    : '0 / 0';
}

function applySearchStateToNavigation() {
  const topLevelItems = [...elements.navigation.querySelectorAll('.tree > .tree-item')];
  const hasQuery = Boolean(searchState.query);

  function applyBodySearch(item) {
    const childCount = [...item.querySelectorAll(':scope > ul > .tree-item')]
      .map(applyBodySearch)
      .reduce((total, count) => total + count, 0);
    const ownCount = getTopicSearchResult(item.dataset.topicPath)?.count || 0;
    const total = ownCount + childCount;
    const count = item.querySelector(':scope > .tree-row .tree-search-count');
    count.hidden = total === 0;
    count.textContent = total ? `(${total})` : '';
    item.classList.toggle('search-match', ownCount > 0);
    item.classList.toggle('filtered-out', total === 0);
    if (total && childCount) setTreeItemExpanded(item, true);
    return total;
  }

  function applyDirectorySearch(item) {
    const childMatches = [...item.querySelectorAll(':scope > ul > .tree-item')]
      .map(applyDirectorySearch)
      .some(Boolean);
    const ownMatch = item.dataset.title.includes(searchState.query.toLocaleLowerCase());
    const matches = ownMatch || childMatches;
    item.classList.toggle('search-match', ownMatch);
    item.classList.toggle('filtered-out', !matches);
    item.querySelector(':scope > .tree-row .tree-search-count').hidden = true;
    if (childMatches) setTreeItemExpanded(item, true);
    return matches;
  }

  topLevelItems.forEach((item) => {
    if (!hasQuery) {
      item.classList.remove('search-match', 'filtered-out');
      item.querySelector(':scope > .tree-row .tree-search-count').hidden = true;
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

function moveSearchMatch(offset) {
  const result = getTopicSearchResult(currentTopicPath);
  if (!result || result.count < 2) return;
  const nextMatch = (searchState.currentMatchIndex + offset + result.count) % result.count;
  navigateTo(currentTopicPath, false, findNavigationRow(currentTopicPath), nextMatch);
}

function setSearchScope(scope) {
  searchState.scope = scope;
  elements.searchBody.setAttribute('aria-checked', String(scope === 'body'));
  elements.searchDirectory.setAttribute('aria-checked', String(scope === 'directory'));
  elements.searchScopeLabel.textContent = scope === 'body' ? '正文' : '目录';
  elements.search.placeholder = scope === 'body' ? '搜索正文' : '搜索目录';
  elements.searchScopeMenu.hidden = true;
  elements.searchScopeTrigger.setAttribute('aria-expanded', 'false');
  searchNavigation(elements.search.value);
}

async function searchNavigation(query) {
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
  if (getTopicSearchResult(currentTopicPath)) {
    navigateTo(currentTopicPath, false, findNavigationRow(currentTopicPath));
  }
}

function setZoom(nextZoom) {
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
  let startX;
  let startWidth;

  elements.resizeHandle.addEventListener('pointerdown', (event) => {
    startX = event.clientX;
    startWidth = document.querySelector('#sidebar').getBoundingClientRect().width;
    elements.resizeHandle.setPointerCapture(event.pointerId);
  });

  elements.resizeHandle.addEventListener('pointermove', (event) => {
    if (!elements.resizeHandle.hasPointerCapture(event.pointerId)) return;
    const width = Math.min(460, Math.max(210, startWidth + event.clientX - startX));
    elements.readerLayout.style.setProperty('--sidebar-width', `${width}px`);
  });

  elements.resizeHandle.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const sidebar = document.querySelector('#sidebar');
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
document.querySelector('#toggle-sidebar').addEventListener('click', () => {
  elements.readerLayout.classList.toggle('sidebar-hidden');
});
elements.back.addEventListener('click', () => moveHistory(-1));
elements.forward.addEventListener('click', () => moveHistory(1));
elements.previousPage.addEventListener('click', () => movePage(-1));
elements.nextPage.addEventListener('click', () => movePage(1));
elements.treeMenuTrigger.addEventListener('click', () => {
  setTreeActionsMenuOpen(elements.treeActionsMenu.hidden);
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
elements.search.addEventListener('input', (event) => {
  searchNavigation(event.target.value);
});
elements.search.addEventListener('keydown', (event) => {
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
document.addEventListener('pointerdown', (event) => {
  if (!elements.collectionContextMenu.hidden && !event.target.closest('.context-menu')) {
    hideCollectionContextMenu();
  }
  if (!elements.treeActionsMenu.hidden
    && !event.target.closest('#tree-menu-trigger')
    && !event.target.closest('#tree-actions-menu')) {
    setTreeActionsMenuOpen(false);
  }
  if (elements.searchScopeMenu.hidden || event.target.closest('.search-box')) return;
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
document.querySelector('#zoom-out').addEventListener('click', () => setZoom(zoom - 0.1));
document.querySelector('#zoom-in').addEventListener('click', () => setZoom(zoom + 0.1));
elements.zoomReset.addEventListener('click', () => setZoom(1));
elements.textEncoding.addEventListener('change', async () => {
  const previousEncoding = currentBook?.textEncoding || 'auto';
  pendingTopicPathAfterEncoding = currentTopicPath;
  elements.textEncoding.disabled = true;
  try {
    await window.chmReader.setTextEncoding(elements.textEncoding.value);
  } catch (error) {
    pendingTopicPathAfterEncoding = null;
    elements.textEncoding.value = previousEncoding;
    window.alert(`无法切换文本编码：${error.message || error}`);
  } finally {
    elements.textEncoding.disabled = false;
  }
});

window.chmReader.onBookOpened(applyBook);
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
