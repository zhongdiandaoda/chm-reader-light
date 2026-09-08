const test = require('node:test');
const assert = require('node:assert/strict');

const {
  isAllowedBookFrameNavigation,
  normalizeExternalWebUrl,
} = require('../src/navigation-security');

export { };

test('isAllowedBookFrameNavigation only permits chm book subframes', () => {
  assert.equal(isAllowedBookFrameNavigation('chm://book/guide/start.htm', false), true);
  assert.equal(isAllowedBookFrameNavigation('chm://BOOK/guide/start.htm#topic', false), true);
  assert.equal(isAllowedBookFrameNavigation('about:blank', false), true);
  assert.equal(isAllowedBookFrameNavigation('https://example.com/', false), false);
  assert.equal(isAllowedBookFrameNavigation('about:srcdoc', false), false);
  assert.equal(isAllowedBookFrameNavigation('chm://other/guide/start.htm', false), false);
  assert.equal(isAllowedBookFrameNavigation('not a url', false), false);
  assert.equal(isAllowedBookFrameNavigation('chm://book/guide/start.htm', true), false);
});

test('normalizeExternalWebUrl returns only parsed HTTP and HTTPS URLs', () => {
  assert.equal(normalizeExternalWebUrl('https://example.com/docs'), 'https://example.com/docs');
  assert.equal(normalizeExternalWebUrl('HTTP://EXAMPLE.COM'), 'http://example.com/');
  assert.equal(normalizeExternalWebUrl('file:///tmp/secret'), null);
  assert.equal(normalizeExternalWebUrl('javascript:alert(1)'), null);
  assert.equal(normalizeExternalWebUrl('https://'), null);
  assert.equal(normalizeExternalWebUrl({}), null);
});
