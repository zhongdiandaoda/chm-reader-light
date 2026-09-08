const test = require('node:test');
const assert = require('node:assert/strict');

const {
  findTopicPathByUrl,
  getTopicPathsInReadingOrder,
  normalizeTopicReference,
} = require('../src/navigation');

export { };

test('normalizeTopicReference converts chm URLs to comparable book paths', () => {
  assert.equal(
    normalizeTopicReference('chm://book/Guide%20Folder/Page.htm#section-2'),
    'guide folder/page.htm',
  );
});

test('normalizeTopicReference rejects malformed percent encoding without throwing', () => {
  assert.equal(normalizeTopicReference('chm://book/guide/%broken.htm'), null);
  assert.equal(normalizeTopicReference('guide/%E0%A4%A.htm'), null);
});

test('findTopicPathByUrl ignores malformed CHM topic paths without throwing', () => {
  const items = [{
    title: 'Malformed topic',
    path: 'guide/%broken.htm',
    children: [],
  }];

  assert.equal(findTopicPathByUrl(items, 'chm://book/guide/start.htm'), null);
  assert.equal(findTopicPathByUrl(items, 'chm://book/guide/%broken.htm'), null);
  assert.equal(findTopicPathByUrl([{
    title: 'Valid topic',
    path: 'guide/start.htm#%broken',
    children: [],
  }], 'chm://book/guide/start.htm#valid'), 'guide/start.htm#%broken');
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

test('findTopicPathByUrl prefers exact hash matches before page-only matches', () => {
  const items = [{
    title: 'Root',
    path: 'root.htm',
    children: [{
      title: 'Overview',
      path: 'guide/api.htm#overview',
      children: [],
    }, {
      title: 'Methods',
      path: 'guide/api.htm#methods',
      children: [],
    }],
  }];

  assert.equal(
    findTopicPathByUrl(items, 'chm://book/guide/api.htm#methods'),
    'guide/api.htm#methods',
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

test('navigation helpers traverse the maximum supported contents depth', () => {
  type TestNavigationItem = {
    title: string;
    path: string;
    children: TestNavigationItem[];
  };
  let items: TestNavigationItem[] = [];
  for (let level = 256; level >= 1; level -= 1) {
    items = [{
      title: `Level ${level}`,
      path: `level-${level}.htm`,
      children: items,
    }];
  }

  const paths = getTopicPathsInReadingOrder(items);
  assert.equal(paths.length, 256);
  assert.equal(paths[0], 'level-1.htm');
  assert.equal(paths[255], 'level-256.htm');
  assert.equal(
    findTopicPathByUrl(items, 'chm://book/level-256.htm'),
    'level-256.htm',
  );
});
