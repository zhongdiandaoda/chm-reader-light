const test = require('node:test');
const assert = require('node:assert/strict');

const {
  findTopicPathByUrl,
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
