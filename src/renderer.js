const elements = {
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
  expandAll: document.querySelector('#expand-all'),
  collapseAll: document.querySelector('#collapse-all'),
  zoomReset: document.querySelector('#zoom-reset'),
};

let currentBook;
let history = [];
let historyIndex = -1;
let zoom = 1;

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

  if (addToHistory) {
    history = history.slice(0, historyIndex + 1);
    history.push({ topicPath, row: activeRow });
    historyIndex = history.length - 1;
  }

  if (activeRow) {
    activateNavigationRow(activeRow);
  }

  loadContent(url);
  updateHistoryButtons();
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
  revealTopicInNavigation(topicPath);
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

function moveHistory(offset) {
  const nextIndex = historyIndex + offset;
  if (nextIndex < 0 || nextIndex >= history.length) return;

  historyIndex = nextIndex;
  const entry = history[historyIndex];
  navigateTo(entry.topicPath, false, entry.row);
}

function applyBook(book) {
  if (!book) return;

  currentBook = book;
  history = [];
  historyIndex = -1;
  elements.bookTitle.textContent = book.name;
  elements.search.disabled = book.contents.length === 0;
  elements.expandAll.disabled = book.contents.length === 0;
  elements.collapseAll.disabled = book.contents.length === 0;
  elements.search.value = '';
  renderNavigation(book.contents);
  updateHistoryButtons();

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

async function requestOpenBook() {
  setLoading(true);
  const book = await window.chmReader.openBook();
  if (!book && !currentBook) {
    setLoading(false);
    elements.emptyState.hidden = false;
  } else if (!book) {
    setLoading(false);
    elements.contentFrame.hidden = false;
  }
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

document.querySelector('#open-book').addEventListener('click', requestOpenBook);
document.querySelector('#empty-open-book').addEventListener('click', requestOpenBook);
document.querySelector('#toggle-sidebar').addEventListener('click', () => {
  elements.readerLayout.classList.toggle('sidebar-hidden');
});
elements.back.addEventListener('click', () => moveHistory(-1));
elements.forward.addEventListener('click', () => moveHistory(1));
elements.expandAll.addEventListener('click', () => setAllTreeItemsExpanded(true));
elements.collapseAll.addEventListener('click', () => setAllTreeItemsExpanded(false));
elements.contentFrame.addEventListener('load', syncNavigationWithFrame);
elements.search.addEventListener('input', (event) => filterNavigation(event.target.value));
document.querySelector('#zoom-out').addEventListener('click', () => setZoom(zoom - 0.1));
document.querySelector('#zoom-in').addEventListener('click', () => setZoom(zoom + 0.1));
elements.zoomReset.addEventListener('click', () => setZoom(1));

window.chmReader.onBookOpened(applyBook);
window.chmReader.onFocusSearch(() => {
  if (!elements.search.disabled) {
    elements.readerLayout.classList.remove('sidebar-hidden');
    elements.search.focus();
    elements.search.select();
  }
});
initializeResizing();
setZoom(1);
