const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('content iframe allows the injected navigation bridge to run', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'src', 'index.html'), 'utf-8');
  const iframe = html.match(/<iframe\s+[^>]*id="content-frame"[^>]*>/s)?.[0] || '';
  const sandbox = iframe.match(/sandbox="([^"]+)"/)?.[1] || '';

  assert.match(sandbox, /\ballow-same-origin\b/);
  assert.match(sandbox, /\ballow-scripts\b/);
});
