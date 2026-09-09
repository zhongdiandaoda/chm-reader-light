const test = require('node:test');
const assert = require('node:assert/strict');

const {
  addBooksToLibrary,
  DEFAULT_LIBRARY_LIMITS,
  filterBooksByQuery,
  formatLibraryAddedDate,
  findBookByFilePath,
  getBookLocationLabel,
  getNextCollectionName,
  markBookOpenedInLibrary,
  normalizeCollectionName,
  normalizeLibraryData,
  normalizeLibraryDataForWrite,
  relinkBookInLibrary,
  renameCollectionInLibrary,
  sortBooksForDisplay,
} = require('../src/library');

export { };

test('normalizeLibraryData filters malformed entries and preserves legacy arrays', () => {
  assert.deepEqual(normalizeLibraryData({
    collections: [
      { id: 'docs', name: 'Docs', createdAt: 1, ignored: 'drop me' },
      { id: 2, name: 'Invalid' },
      null,
    ],
    books: [
      {
        id: 'guide',
        name: 'Guide',
        filePath: '/docs/Guide.chm',
        collectionId: 'docs',
        addedAt: 1,
        lastOpenedAt: 2,
        ignored: 'drop me',
      },
      { id: 'bad-path', name: 'Bad path', filePath: 42, storedName: true, collectionId: false },
      { id: 'missing-name', collectionId: null },
      'invalid',
    ],
  }), {
    collections: [{ id: 'docs', name: 'Docs', createdAt: 1 }],
    books: [{
      id: 'guide',
      name: 'Guide',
      filePath: '/docs/Guide.chm',
      addedAt: 1,
      lastOpenedAt: 2,
      collectionId: 'docs',
    }, {
      id: 'bad-path',
      name: 'Bad path',
      collectionId: null,
    }],
  });

  assert.deepEqual(normalizeLibraryData([{
    id: 'legacy',
    name: 'Legacy',
    storedName: 'legacy.chm',
  }]), {
    collections: [],
    books: [{ id: 'legacy', name: 'Legacy', storedName: 'legacy.chm', collectionId: null }],
  });
});

test('normalizeLibraryData bounds collection and book counts', () => {
  assert.deepEqual(DEFAULT_LIBRARY_LIMITS, {
    maxCollections: 1_000,
    maxBooks: 10_000,
    maxIdChars: 256,
    maxNameChars: 512,
    maxPathChars: 32_768,
  });
  assert.throws(
    () => normalizeLibraryData({ collections: [{ id: 'one', name: 'One' }], books: [] }, { maxCollections: 0 }),
    /collection count safety limit.*0/i,
  );
  assert.throws(
    () => normalizeLibraryData({ collections: [], books: [{ id: 'one', name: 'One' }] }, { maxBooks: 0 }),
    /book count safety limit.*0/i,
  );
  assert.throws(
    () => normalizeLibraryData({}, { maxBooks: -1 }),
    /maxBooks must be a non-negative safe integer/i,
  );
  assert.deepEqual(
    normalizeLibraryData({
      collections: [{ id: 'x'.repeat(257), name: 'Too long' }],
      books: [{ id: 'book', name: 'x'.repeat(513) }],
    }),
    { collections: [], books: [] },
  );
});

test('normalizeLibraryDataForWrite rejects state that would become unreadable after persistence', () => {
  const oversizedLibrary = {
    collections: [],
    books: Array.from({ length: DEFAULT_LIBRARY_LIMITS.maxBooks + 1 }, (_, index) => ({
      id: `book-${index}`,
      name: `Book ${index}`,
      collectionId: null,
    })),
  };

  assert.throws(
    () => normalizeLibraryDataForWrite(oversizedLibrary),
    /book count safety limit.*10000/i,
  );
  assert.throws(
    () => normalizeLibraryDataForWrite({
      collections: [],
      books: [{
        id: 'book',
        name: 'Book',
        filePath: 'x'.repeat(DEFAULT_LIBRARY_LIMITS.maxPathChars + 1),
        collectionId: null,
      }],
    }),
    /invalid book metadata/i,
  );
});

test('normalizeLibraryDataForWrite strips transient fields from valid state', () => {
  assert.deepEqual(normalizeLibraryDataForWrite({
    collections: [{ id: 'docs', name: 'Docs', createdAt: 1 }],
    books: [{
      id: 'guide',
      name: 'Guide',
      filePath: '/docs/Guide.chm',
      collectionId: 'docs',
      sourceMissing: false,
    }],
  }), {
    collections: [{ id: 'docs', name: 'Docs', createdAt: 1 }],
    books: [{
      id: 'guide',
      name: 'Guide',
      filePath: '/docs/Guide.chm',
      collectionId: 'docs',
    }],
  });
});

test('normalizeCollectionName trims user input', () => {
  assert.equal(normalizeCollectionName('  运维文档  '), '运维文档');
  assert.equal(normalizeCollectionName('x'.repeat(600)).length, 512);
});

test('getNextCollectionName suggests an unused default collection name', () => {
  assert.equal(getNextCollectionName([]), '新书库');
  assert.equal(getNextCollectionName([{ name: '新书库' }]), '新书库 2');
  assert.equal(
    getNextCollectionName([{ name: '新书库' }, { name: '新书库 2' }]),
    '新书库 3',
  );
});

test('renameCollectionInLibrary updates only the matching collection name', () => {
  const library = {
    collections: [
      { id: 'a', name: '旧书库', createdAt: 1 },
      { id: 'b', name: '其它书库', createdAt: 2 },
    ],
    books: [{ id: 'book-1', collectionId: 'a' }],
  };

  assert.deepEqual(renameCollectionInLibrary(library, 'a', '  新书库  '), {
    collections: [
      { id: 'a', name: '新书库', createdAt: 1 },
      { id: 'b', name: '其它书库', createdAt: 2 },
    ],
    books: [{ id: 'book-1', collectionId: 'a' }],
  });
});

test('addBooksToLibrary skips duplicate CHM file paths', () => {
  const library = {
    collections: [{ id: 'docs', name: '文档', createdAt: 1 }],
    books: [{
      id: 'existing',
      name: 'Guide',
      filePath: '/docs/Guide.chm',
      addedAt: 1,
      collectionId: null,
    }],
  };

  const nextLibrary = addBooksToLibrary(
    library,
    ['/docs/Guide.chm', '/docs/Guide.chm', '/docs/API.CHM', '/docs/readme.txt'],
    'docs',
    () => 'new-id',
    () => 2,
  );

  assert.deepEqual(nextLibrary, {
    collections: [{ id: 'docs', name: '文档', createdAt: 1 }],
    books: [
      {
        id: 'existing',
        name: 'Guide',
        filePath: '/docs/Guide.chm',
        addedAt: 1,
        collectionId: null,
      },
      {
        id: 'new-id',
        name: 'API',
        filePath: '/docs/API.CHM',
        addedAt: 2,
        collectionId: 'docs',
      },
    ],
  });
});

test('addBooksToLibrary treats macOS path aliases as the same CHM file', () => {
  const library = {
    collections: [],
    books: [{
      id: 'existing',
      name: 'Guide',
      filePath: '/Docs/Guides/Guide.chm',
      addedAt: 1,
      collectionId: null,
    }],
  };

  const nextLibrary = addBooksToLibrary(
    library,
    ['/docs/guides/../guides/GUIDE.CHM'],
    null,
    () => 'duplicate',
    () => 2,
    true,
  );

  assert.deepEqual(nextLibrary.books, library.books);
});

test('findBookByFilePath locates the requested existing book instead of the last library item', () => {
  const books = [
    { id: 'requested', name: 'Guide', filePath: '/docs/Guide.chm', collectionId: null },
    { id: 'last', name: 'Other', filePath: '/docs/Other.chm', collectionId: null },
  ];

  assert.equal(findBookByFilePath(books, '/docs/Guide.chm', false)?.id, 'requested');
  assert.equal(findBookByFilePath(books, '/DOCS/GUIDE.CHM', true)?.id, 'requested');
  assert.equal(findBookByFilePath(books, '/docs/Missing.chm', false), undefined);
});

test('getBookLocationLabel returns a compact parent folder label', () => {
  assert.equal(getBookLocationLabel('/Users/me/Documents/Guide.chm'), 'Documents');
  assert.equal(getBookLocationLabel('C:\\Docs\\Help\\Guide.chm'), 'Help');
  assert.equal(getBookLocationLabel('/Guide.chm'), '');
  assert.equal(getBookLocationLabel(undefined), '');
});

test('formatLibraryAddedDate returns a compact ISO date label', () => {
  assert.equal(formatLibraryAddedDate(new Date(2026, 8, 2, 9).getTime()), '2026-09-02');
  assert.equal(formatLibraryAddedDate(undefined), '');
  assert.equal(formatLibraryAddedDate(Number.NaN), '');
});

test('markBookOpenedInLibrary records last-opened metadata for one book', () => {
  const library = {
    collections: [{ id: 'docs', name: '文档' }],
    books: [
      { id: 'book-1', name: 'Guide', addedAt: 1, collectionId: 'docs' },
      { id: 'book-2', name: 'API', addedAt: 2, lastOpenedAt: 10, collectionId: 'docs' },
    ],
  };

  assert.deepEqual(markBookOpenedInLibrary(library, 'book-1', 30), {
    collections: [{ id: 'docs', name: '文档' }],
    books: [
      { id: 'book-1', name: 'Guide', addedAt: 1, lastOpenedAt: 30, collectionId: 'docs' },
      { id: 'book-2', name: 'API', addedAt: 2, lastOpenedAt: 10, collectionId: 'docs' },
    ],
  });
});

test('filterBooksByQuery matches book names and source paths case-insensitively', () => {
  const books = [
    { id: 'a', name: 'Node API', filePath: '/docs/node/API.chm', collectionId: null },
    { id: 'b', name: 'Electron Guide', filePath: '/manuals/electron/guide.chm', collectionId: null },
    { id: 'c', name: 'Legacy Help', filePath: '/archives/winhelp/legacy.chm', collectionId: null },
  ];

  assert.deepEqual(filterBooksByQuery(books, 'api'), [books[0]]);
  assert.deepEqual(filterBooksByQuery(books, 'ELECTRON'), [books[1]]);
  assert.deepEqual(filterBooksByQuery(books, 'winhelp'), [books[2]]);
  assert.deepEqual(filterBooksByQuery(books, '   '), books);
}
);

test('sortBooksForDisplay shows recently opened books first with added date and title fallbacks', () => {
  const books = [
    { id: 'old', name: 'Zoo Manual', addedAt: 10, collectionId: null },
    { id: 'untimed-b', name: 'Beta Guide', collectionId: null },
    { id: 'new', name: 'API Reference', addedAt: 30, collectionId: null },
    { id: 'same-time-b', name: 'Cookbook', addedAt: 20, collectionId: null },
    { id: 'same-time-a', name: 'Basics', addedAt: 20, collectionId: null },
    { id: 'untimed-a', name: 'Alpha Guide', collectionId: null },
    { id: 'opened-old-add', name: 'Old Added Opened', addedAt: 5, lastOpenedAt: 90, collectionId: null },
    { id: 'opened-new-add', name: 'New Added Opened', addedAt: 200, lastOpenedAt: 80, collectionId: null },
  ];

  assert.deepEqual(
    sortBooksForDisplay(books).map((book: { id: string }) => book.id),
    [
      'opened-old-add',
      'opened-new-add',
      'new',
      'same-time-a',
      'same-time-b',
      'old',
      'untimed-a',
      'untimed-b',
    ],
  );
});

test('relinkBookInLibrary updates a saved CHM path without persisting transient status', () => {
  const library = {
    collections: [{ id: 'docs', name: '文档' }],
    books: [{
      id: 'book-1',
      name: 'Old Guide',
      filePath: '/missing/Old Guide.chm',
      collectionId: 'docs',
      sourceMissing: true,
    }],
  };

  assert.deepEqual(relinkBookInLibrary(library, 'book-1', '/docs/New Guide.chm'), {
    collections: [{ id: 'docs', name: '文档' }],
    books: [{
      id: 'book-1',
      name: 'New Guide',
      filePath: '/docs/New Guide.chm',
      collectionId: 'docs',
    }],
  });
});

test('relinkBookInLibrary rejects paths already used by another library entry', () => {
  const library = {
    collections: [],
    books: [
      { id: 'book-1', name: 'Missing', filePath: '/missing/Missing.chm', collectionId: null },
      { id: 'book-2', name: 'Existing', filePath: '/docs/Existing.chm', collectionId: null },
    ],
  };

  assert.throws(
    () => relinkBookInLibrary(library, 'book-1', '/docs/Existing.chm'),
    /already exists/,
  );
}
);

test('relinkBookInLibrary rejects a macOS case-variant duplicate path', () => {
  const library = {
    collections: [],
    books: [
      { id: 'book-1', name: 'Missing', filePath: '/missing/Missing.chm', collectionId: null },
      { id: 'book-2', name: 'Existing', filePath: '/Docs/Existing.chm', collectionId: null },
    ],
  };

  assert.throws(
    () => relinkBookInLibrary(library, 'book-1', '/docs/EXISTING.CHM', true),
    /already exists/,
  );
});
