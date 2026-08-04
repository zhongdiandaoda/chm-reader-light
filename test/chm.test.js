const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  decodeMarkup,
  extractSearchableText,
  findBookMetadata,
  getSearchMatchCount,
  highlightSearchMatches,
  injectContentNavigationBridge,
  mapWithConcurrency,
  parseContents,
  readExtractedBook,
  resolveBookResource,
  searchBookContents,
} = require('../src/chm');

test('parseContents builds a nested navigation tree from HHC markup', () => {
  const markup = `
    <ul>
      <li><object type="text/sitemap">
        <param name="Name" value="Getting started">
        <param name="Local" value="guide/start.htm">
      </object>
      <ul>
        <li><object type="text/sitemap">
          <param name="Name" value="Installation">
          <param name="Local" value="guide/install.htm#mac">
        </object></li>
      </ul></li>
    </ul>`;

  assert.deepEqual(parseContents(markup), [{
    title: 'Getting started',
    path: 'guide/start.htm',
    children: [{
      title: 'Installation',
      path: 'guide/install.htm#mac',
      children: [],
    }],
  }]);
});

test('parseContents attaches sibling UL blocks to the preceding topic', () => {
  const markup = `
    <ul>
      <li><object type="text/sitemap">
        <param name="Name" value="Root">
        <param name="Local" value="root.htm">
      </object></li>
      <ul>
        <li><object type="text/sitemap">
          <param name="Name" value="Child">
          <param name="Local" value="child.htm">
        </object></li>
        <ul>
          <li><object type="text/sitemap">
            <param name="Name" value="Grandchild">
            <param name="Local" value="grandchild.htm">
          </object></li>
        </ul>
      </ul>
    </ul>`;

  assert.deepEqual(parseContents(markup), [{
    title: 'Root',
    path: 'root.htm',
    children: [{
      title: 'Child',
      path: 'child.htm',
      children: [{
        title: 'Grandchild',
        path: 'grandchild.htm',
        children: [],
      }],
    }],
  }]);
});

test('parseContents keeps headings that have no target page', () => {
  const markup = `
    <ul><li><object type="text/sitemap">
      <param name="Name" value="API reference">
    </object></li></ul>`;

  assert.deepEqual(parseContents(markup), [{
    title: 'API reference',
    path: null,
    children: [],
  }]);
});

test('findBookMetadata chooses HHC and default page case-insensitively', () => {
  const files = [
    '/tmp/book/assets/logo.png',
    '/tmp/book/Manual.HHC',
    '/tmp/book/INDEX.HTM',
  ];

  assert.deepEqual(findBookMetadata('/tmp/book', files), {
    contentsFile: '/tmp/book/Manual.HHC',
    defaultPage: 'INDEX.HTM',
  });
});

test('resolveBookResource decodes safe paths inside the extracted book', () => {
  const root = path.resolve('/tmp/book');

  assert.equal(
    resolveBookResource(root, 'guide%2Fstart.htm'),
    path.join(root, 'guide/start.htm'),
  );
});

test('resolveBookResource rejects traversal outside the extracted book', () => {
  const root = path.resolve('/tmp/book');

  assert.throws(
    () => resolveBookResource(root, '..%2Fsecret.txt'),
    /outside the opened book/,
  );
});

test('decodeMarkup falls back to GB18030 for legacy Chinese contents', () => {
  const prefix = Buffer.from('<param name="Name" value="', 'ascii');
  const chineseTitle = Buffer.from([0xc5, 0xe4, 0xd6, 0xc3]);
  const suffix = Buffer.from('">', 'ascii');

  assert.equal(
    decodeMarkup(Buffer.concat([prefix, chineseTitle, suffix])),
    '<param name="Name" value="配置">',
  );
});

test('decodeMarkup uses the selected text encoding before declared charset', () => {
  const buffer = Buffer.concat([
    Buffer.from('<meta charset="utf-8"><p>', 'ascii'),
    Buffer.from([0xc5, 0xe4, 0xd6, 0xc3]),
    Buffer.from('</p>', 'ascii'),
  ]);

  assert.equal(decodeMarkup(buffer, 'gbk'), '<meta charset="utf-8"><p>配置</p>');
  assert.notEqual(decodeMarkup(buffer), '<meta charset="utf-8"><p>配置</p>');
});

test('readExtractedBook parses contents and search index with selected encoding', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  try {
    await fs.promises.writeFile(
      path.join(root, 'index.hhc'),
      Buffer.concat([
        Buffer.from('<ul><li><object type="text/sitemap"><param name="Name" value="', 'ascii'),
        Buffer.from([0xc5, 0xe4, 0xd6, 0xc3]),
        Buffer.from('"><param name="Local" value="index.htm"></object></li></ul>', 'ascii'),
      ]),
    );
    await fs.promises.writeFile(
      path.join(root, 'index.htm'),
      Buffer.concat([
        Buffer.from('<html><head><title>', 'ascii'),
        Buffer.from([0xc5, 0xe4, 0xd6, 0xc3]),
        Buffer.from('</title></head><body>', 'ascii'),
        Buffer.from([0xc5, 0xe4, 0xd6, 0xc3, 0xd5, 0xfd, 0xce, 0xc4]),
        Buffer.from('</body></html>', 'ascii'),
      ]),
    );

    const metadata = await readExtractedBook(root, 'gbk');

    assert.equal(metadata.contents[0].title, '配置');
    assert.equal(metadata.searchIndex[0].title, '配置');
    assert.equal(metadata.searchIndex[0].text, '配置 配置正文');
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('readExtractedBook can skip search index construction', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  try {
    await fs.promises.writeFile(
      path.join(root, 'index.hhc'),
      '<ul><li><object type="text/sitemap"><param name="Name" value="Index"><param name="Local" value="index.htm"></object></li></ul>',
    );
    await fs.promises.writeFile(
      path.join(root, 'index.htm'),
      '<html><body>Index body</body></html>',
    );

    const metadata = await readExtractedBook(root, {
      buildSearchIndex: false,
    });

    assert.equal(metadata.contents[0].title, 'Index');
    assert.deepEqual(metadata.searchIndex, []);
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('mapWithConcurrency never exceeds the configured worker limit', async () => {
  let active = 0;
  let maxActive = 0;

  const result = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (value) => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    await new Promise((resolve) => setTimeout(resolve, 5));
    active -= 1;
    return value * 2;
  });

  assert.deepEqual(result, [2, 4, 6, 8, 10]);
  assert.equal(maxActive, 2);
});

test('searchBookContents finds normalized body text without case sensitivity', () => {
  const index = [{
    path: 'guide/install.htm',
    title: 'Installation Guide',
    text: extractSearchableText(`
      <html><head><title>Install</title><style>.hidden { display: none; }</style></head>
      <body><h1>Install CHM Reader</h1><p>Use Homebrew to install the reader.</p>
      <script>window.unrelated = true;</script></body></html>
    `),
  }];

  const results = searchBookContents(index, 'hOmEbReW');

  assert.equal(results.length, 1);
  assert.equal(results[0].path, 'guide/install.htm');
  assert.equal(results[0].title, 'Installation Guide');
  assert.match(results[0].excerpt, /Use Homebrew to install the reader\./);
});

test('searchBookContents returns the number of matches for each matching page', () => {
  const index = [{
    path: 'network.htm',
    title: '网络配置',
    text: 'VXLAN 配置需要 VXLAN 网络和 vxlan 接口。',
  }];

  assert.equal(getSearchMatchCount(index[0].text, 'vxlan'), 3);
  assert.deepEqual(searchBookContents(index, 'vxlan'), [{
    path: 'network.htm',
    title: '网络配置',
    count: 3,
    excerpt: 'VXLAN 配置需要 VXLAN 网络和 vxlan 接口。',
  }]);
});

test('highlightSearchMatches marks all matches and identifies the selected match', () => {
  const result = highlightSearchMatches(
    '<html><body><p>VXLAN 配置与 vxlan 网络。</p><script>const vxlan = 1;</script></body></html>',
    'vxlan',
    1,
  );

  assert.equal(result.count, 2);
  assert.match(result.markup, /<mark class="chm-search-match">VXLAN<\/mark>/);
  assert.match(result.markup, /<mark class="chm-search-match chm-search-current" id="chm-search-current">vxlan<\/mark>/);
  assert.doesNotMatch(result.markup, /<mark[^>]*>vxlan<\/mark> = 1/);
});

test('injectContentNavigationBridge posts iframe navigation changes to parent', () => {
  const markup = injectContentNavigationBridge(
    '<html><head><title>Guide</title></head><body><a href="#next">Next</a></body></html>',
    'test-nonce',
  );

  assert.match(markup, /<script nonce="test-nonce">/);
  assert.match(markup, /type: 'chm-reader:navigated'/);
  assert.match(markup, /href: window\.location\.href/);
  assert.match(markup, /window\.addEventListener\('hashchange', notifyNavigation\)/);
  assert.match(markup, /<\/script><\/head>/);
});
