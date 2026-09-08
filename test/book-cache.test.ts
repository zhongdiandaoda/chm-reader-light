const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createBookCacheKey,
  isSameBookCacheIdentity,
} = require('../src/book-cache');

export { };

test('createBookCacheKey changes when a same-size source is replaced within one millisecond', () => {
  const initial = createBookCacheKey('/docs/Guide.chm', {
    dev: 1n,
    ino: 2n,
    size: 1024n,
    mtimeNs: 1_000_100n,
    ctimeNs: 1_000_200n,
  });
  const replaced = createBookCacheKey('/docs/Guide.chm', {
    dev: 1n,
    ino: 3n,
    size: 1024n,
    mtimeNs: 1_000_900n,
    ctimeNs: 1_000_950n,
  });

  assert.notEqual(initial, replaced);
});

test('createBookCacheKey is stable for the same resolved source identity', () => {
  const identity = {
    dev: 1n,
    ino: 2n,
    size: 1024n,
    mtimeNs: 1_000_100n,
    ctimeNs: 1_000_200n,
  };

  assert.equal(
    createBookCacheKey('/docs/../docs/Guide.chm', identity),
    createBookCacheKey('/docs/Guide.chm', identity),
  );
});

test('isSameBookCacheIdentity rejects a source replaced during extraction', () => {
  const before = {
    dev: 1n,
    ino: 2n,
    size: 1024n,
    mtimeNs: 1_000_100n,
    ctimeNs: 1_000_200n,
  };

  assert.equal(isSameBookCacheIdentity(before, { ...before }), true);
  assert.equal(isSameBookCacheIdentity(before, { ...before, ino: 3n }), false);
  assert.equal(isSameBookCacheIdentity(before, { ...before, mtimeNs: 1_000_101n }), false);
  assert.equal(isSameBookCacheIdentity(before, { ...before, ctimeNs: 1_000_201n }), false);
});
