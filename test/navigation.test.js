const test = require('node:test');
const assert = require('node:assert/strict');

const {
  findTopicPathByUrl,
  getTopicPathsInReadingOrder,
  normalizeTopicReference,
} = require('../src/navigation');

test('normalizeTopicReference converts chm URLs to comparable book paths', () => {
  assert.equal(
    normalizeTopicReference('chm://book/Guide%20Folder/Page.htm#section-2'),
    'guide folder/page.htm',
  );
});

test('findTopicPathByUrl matches nested topics by the current iframe page', () => {
  const items = [{
    title: 'Root',
    path: 'root.htm',
    children: [{
      title: 'Chapter',
      path: 'guide/chapter.htm',
      children: [{
        title: 'API',
        path: 'guide/API.htm#overview',
        children: [],
      }],
    }],
  }];

  assert.equal(
    findTopicPathByUrl(items, 'chm://book/guide/API.htm?from=content#method'),
    'guide/API.htm#overview',
  );
});

test('findTopicPathByUrl returns null when no topic matches', () => {
  assert.equal(findTopicPathByUrl([], 'chm://book/missing.htm'), null);
});

test('getTopicPathsInReadingOrder traverses nested topics and skips groups without pages', () => {
  const items = [{
    title: 'Introduction',
    path: 'intro.htm',
    children: [],
  }, {
    title: 'Guide',
    children: [{
      title: 'Install',
      path: 'guide/install.htm',
      children: [],
    }, {
      title: 'Configure',
      path: 'guide/configure.htm',
      children: [],
    }],
  }, {
    title: 'Reference',
    path: 'reference.htm',
    children: [{
      title: 'API',
      path: 'reference/api.htm',
      children: [],
    }],
  }];

  assert.deepEqual(getTopicPathsInReadingOrder(items), [
    'intro.htm',
    'guide/install.htm',
    'guide/configure.htm',
    'reference.htm',
    'reference/api.htm',
  ]);
});
