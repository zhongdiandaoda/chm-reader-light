const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getNextCollectionName,
  normalizeCollectionName,
  renameCollectionInLibrary,
} = require('../src/library');

test('normalizeCollectionName trims user input', () => {
  assert.equal(normalizeCollectionName('  运维文档  '), '运维文档');
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
