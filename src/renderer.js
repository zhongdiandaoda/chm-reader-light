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
  back: document.querySelector('#go-back'),
  forward: document.querySelector('#go-forward'),
  previousPage: document.querySelector('#previous-page'),
  nextPage: document.querySelector('#next-page'),
  expandAll: document.querySelector('#expand-all'),
  collapseAll: document.querySelector('#collapse-all'),
  zoomReset: document.querySelector('#zoom-reset'),
};

let currentBook;
let currentTopicPath;
let history = [];
let historyIndex = -1;
let readingOrder = [];
let zoom = 1;

let library = { collections: [], books: [] };
let selectedCollectionId = null; // null = 全部
let libraryLayout = 'grid';

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
    const remove = document.createElement('button');
    remove.className = 'collection-remove';
    remove.type = 'button';
    remove.textContent = '×';
    remove.title = '删除书库';
    remove.setAttribute('aria-label', `删除书库 ${collection.name}`);
    remove.addEventListener('click', async (event) => {
      event.stopPropagation();
      const message = count > 0
        ? `删除书库“${collection.name}”后，其中的 ${count} 个文档会移动到“全部”（不会删除源文件）。`
        : `删除书库“${collection.name}”？`;
      // eslint-disable-next-line no-alert
      if (!window.confirm(message)) return;
      const updated = await window.chmReader.removeCollection(collection.id);
      renderLibrary(updated);
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

async function requestCreateCollection() {
  // eslint-disable-next-line no-alert
  const name = window.prompt('新书库名称', '新书库');
  if (name === null) return;
  const trimmed = name.trim();
  if (!trimmed) return;
  const updated = await window.chmReader.createCollection(trimmed);
  const created = updated.collections[updated.collections.length - 1];
  renderLibrary(updated);
  if (created) selectCollection(created.id);
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
}

function createTreeItem(item, level) {
  const listItem = document.createElement('li');
  const row = document.createElement('div');
  const disclosure = document.createElement('button');
  const link = document.createElement('button');
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

  row.append(disclosure, link);
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

async function navigateTo(topicPath, addToHistory = true, activeRow = null) {
  const url = await window.chmReader.createBookUrl(topicPath);
  if (!url) return;

  const navigationRow = activeRow || findNavigationRow(topicPath);
  if (addToHistory) {
    history = history.slice(0, historyIndex + 1);
    history.push({ topicPath, row: navigationRow });
    historyIndex = history.length - 1;
  }

  currentTopicPath = topicPath;
  if (navigationRow) {
    activateNavigationRow(navigationRow);
  }

  loadContent(url);
  updateHistoryButtons();
  updatePageButtons();
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

function syncNavigationWithFrame() {
  if (!currentBook || !elements.contentFrame.src.startsWith('chm://book/')) return;

  const topicPath = window.chmNavigation.findTopicPathByUrl(
    currentBook.contents,
    elements.contentFrame.src,
  );
  currentTopicPath = topicPath || currentTopicPath;
  revealTopicInNavigation(topicPath);
  updatePageButtons();
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
  readingOrder = window.chmNavigation.getTopicPathsInReadingOrder(book.contents);
  elements.bookTitle.textContent = book.name;
  elements.search.disabled = book.contents.length === 0;
  elements.expandAll.disabled = book.contents.length === 0;
  elements.collapseAll.disabled = book.contents.length === 0;
  elements.search.value = '';
  renderNavigation(book.contents);
  updateHistoryButtons();
  updatePageButtons();

  const firstTopic = findFirstTopic(book.contents);
  if (firstTopic) {
    const firstRow = elements.navigation.querySelector('.tree-row');
    navigateTo(firstTopic, true, firstRow);
  } else if (book.defaultPage) {
    loadContent(book.defaultPage);
  } else {
    setLoading(false);
    elements.emptyState.hidden = false;
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

function filterNavigation(query) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const topLevelItems = [...elements.navigation.querySelectorAll('.tree > .tree-item')];

  function filterItem(item) {
    const childItems = [...item.querySelectorAll(':scope > ul > .tree-item')];
    const childMatches = childItems.map(filterItem).some(Boolean);
    const ownMatch = !normalizedQuery || item.dataset.title.includes(normalizedQuery);
    const matches = ownMatch || childMatches;

    item.classList.toggle('filtered-out', !matches);
    if (normalizedQuery && childMatches) {
      item.classList.add('expanded');
      item.setAttribute('aria-expanded', 'true');
    }
    return matches;
  }

  topLevelItems.forEach(filterItem);
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
elements.addCollection.addEventListener('click', requestCreateCollection);
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
elements.expandAll.addEventListener('click', () => setAllTreeItemsExpanded(true));
elements.collapseAll.addEventListener('click', () => setAllTreeItemsExpanded(false));
elements.contentFrame.addEventListener('load', syncNavigationWithFrame);
elements.search.addEventListener('input', (event) => filterNavigation(event.target.value));
document.querySelector('#zoom-out').addEventListener('click', () => setZoom(zoom - 0.1));
document.querySelector('#zoom-in').addEventListener('click', () => setZoom(zoom + 0.1));
elements.zoomReset.addEventListener('click', () => setZoom(1));

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
