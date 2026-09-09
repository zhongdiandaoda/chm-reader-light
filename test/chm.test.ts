const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');

const {
  createSearchIndex,
  decodeMarkup,
  DEFAULT_CONTENTS_LIMITS,
  DEFAULT_EXTRACTION_LIMITS,
  DEFAULT_MARKUP_LIMITS,
  extractSearchableText,
  extractBook,
  findBookMetadata,
  getSearchMatchCount,
  highlightSearchMatches,
  injectContentNavigationBridge,
  mapWithConcurrency,
  MAX_SEARCH_MATCHES_PER_PAGE,
  normalizeSearchQuery,
  parseContents,
  readMarkupFile,
  readExtractedBook,
  resolveBookResource,
  searchBookContents,
  validateExtractedBookTree,
} = require('../src/chm');

export { };

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

test('default contents budgets bound table-of-contents size and nesting', () => {
  assert.deepEqual(DEFAULT_CONTENTS_LIMITS, {
    maxItems: 50_000,
    maxDepth: 256,
  });
});

test('parseContents rejects more topics than the configured item budget', () => {
  const markup = `
    <ul>
      <li><object><param name="Name" value="One"></object></li>
      <li><object><param name="Name" value="Two"></object></li>
    </ul>`;

  assert.throws(
    () => parseContents(markup, { maxItems: 1 }),
    /contents item safety limit.*1/i,
  );
});

test('parseContents rejects nesting beyond the configured depth budget', () => {
  const markup = `
    <ul><li><object><param name="Name" value="One"></object>
      <ul><li><object><param name="Name" value="Two"></object></li></ul>
    </li></ul>`;

  assert.throws(
    () => parseContents(markup, { maxDepth: 1 }),
    /contents depth safety limit.*1/i,
  );
});

test('maximum-depth contents remain usable by search title indexing', async () => {
  const depth = DEFAULT_CONTENTS_LIMITS.maxDepth;
  let markup = '';
  for (let index = 1; index <= depth; index += 1) {
    markup += `<ul><li><object><param name="Name" value="Level ${index}">`
      + `<param name="Local" value="level-${index}.htm"></object>`;
  }
  markup += '</li></ul>'.repeat(depth);

  const contents = parseContents(markup);
  let current = contents[0];
  for (let index = 1; index < depth; index += 1) current = current.children[0];
  assert.equal(current.title, `Level ${depth}`);

  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  try {
    const deepestPage = path.join(root, `level-${depth}.htm`);
    await fs.promises.writeFile(deepestPage, '<p>deep content</p>');
    const index = await createSearchIndex(root, [deepestPage], contents);
    assert.equal(index[0].title, `Level ${depth}`);
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('parseContents rejects invalid contents budgets', () => {
  assert.throws(
    () => parseContents('<ul></ul>', { maxItems: -1 }),
    /maxItems must be a non-negative safe integer/,
  );
  assert.throws(
    () => parseContents('<ul></ul>', { maxDepth: Number.POSITIVE_INFINITY }),
    /maxDepth must be a non-negative safe integer/,
  );
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

test('default markup budgets bound per-page transforms and total search source bytes', () => {
  assert.deepEqual(DEFAULT_MARKUP_LIMITS, {
    maxMarkupBytes: 16 * 1024 * 1024,
    maxSearchIndexSourceBytes: 128 * 1024 * 1024,
  });
  assert.ok(DEFAULT_MARKUP_LIMITS.maxSearchIndexSourceBytes >= DEFAULT_MARKUP_LIMITS.maxMarkupBytes);
});

test('markup readers reject invalid byte budgets', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  try {
    const filePath = path.join(root, 'index.htm');
    await fs.promises.writeFile(filePath, '<p>Index</p>');

    await assert.rejects(
      readMarkupFile(filePath, null, Number.POSITIVE_INFINITY),
      /maxMarkupBytes must be a non-negative safe integer/,
    );
    await assert.rejects(
      createSearchIndex(root, [filePath], [], null, { maxSearchIndexSourceBytes: -1 }),
      /maxSearchIndexSourceBytes must be a non-negative safe integer/,
    );
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('readMarkupFile rejects a file before reading beyond the byte budget', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  try {
    const filePath = path.join(root, 'oversized.htm');
    await fs.promises.writeFile(filePath, '123456');

    await assert.rejects(
      readMarkupFile(filePath, null, 5),
      /markup safety limit.*5 bytes/i,
    );
    assert.equal(await readMarkupFile(filePath, null, 6), '123456');
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('readMarkupFile rejects a source whose size changed after budget accounting', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  try {
    const filePath = path.join(root, 'changed.htm');
    await fs.promises.writeFile(filePath, '123456');

    await assert.rejects(
      readMarkupFile(filePath, null, 10, 5),
      /changed after resource accounting/i,
    );
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('readMarkupFile rejects a short read even when the reported file size is unchanged', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  const filePath = path.join(root, 'short-read.htm');
  const originalOpen = fs.promises.open;
  try {
    await fs.promises.writeFile(filePath, '123456');
    fs.promises.open = async (...args: any[]) => {
      const handle = await originalOpen(...args);
      const originalRead = handle.read.bind(handle);
      let readCount = 0;
      (handle as any).read = async (...readArgs: any[]) => {
        readCount += 1;
        if (readCount > 1) return { bytesRead: 0, buffer: readArgs[0] };
        readArgs[2] = Math.min(readArgs[2], 3);
        return originalRead(...readArgs);
      };
      return handle;
    };

    await assert.rejects(
      readMarkupFile(filePath),
      /changed while it was being read/i,
    );
  } finally {
    fs.promises.open = originalOpen;
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('readMarkupFile rejects symbolic links without following them', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  try {
    const targetPath = path.join(root, 'target.htm');
    const linkPath = path.join(root, 'linked.htm');
    await fs.promises.writeFile(targetPath, '<p>private target</p>');
    await fs.promises.symlink(targetPath, linkPath);

    await assert.rejects(
      readMarkupFile(linkPath),
      /symbolic link|ELOOP/i,
    );
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('createSearchIndex skips HTML pages above the per-page markup budget', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  try {
    const smallPage = path.join(root, 'small.htm');
    const oversizedPage = path.join(root, 'oversized.htm');
    await fs.promises.writeFile(smallPage, '<title>Small</title><p>searchable</p>');
    await fs.promises.writeFile(oversizedPage, '<title>Oversized</title><p>not indexed</p>');

    const index = await createSearchIndex(root, [smallPage, oversizedPage], [], null, {
      maxMarkupBytes: 40,
      maxSearchIndexSourceBytes: 80,
    });

    assert.deepEqual(index.map((entry: { path: string }) => entry.path), ['small.htm']);
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('createSearchIndex stops deterministically before exceeding the total source budget', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  try {
    const firstPage = path.join(root, 'first.htm');
    const budgetBreaker = path.join(root, 'second.htm');
    const laterSmallPage = path.join(root, 'third.htm');
    await fs.promises.writeFile(firstPage, '<p>first page</p>');
    await fs.promises.writeFile(budgetBreaker, '<p>second page</p>');
    await fs.promises.writeFile(laterSmallPage, '<p>x</p>');
    const firstSize = (await fs.promises.stat(firstPage)).size;

    const index = await createSearchIndex(
      root,
      [firstPage, budgetBreaker, laterSmallPage],
      [],
      null,
      { maxMarkupBytes: 64, maxSearchIndexSourceBytes: firstSize },
    );

    assert.deepEqual(index.map((entry: { path: string }) => entry.path), ['first.htm']);
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('readExtractedBook rejects an HHC file above the markup transform budget', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  try {
    await fs.promises.writeFile(path.join(root, 'index.hhc'), '<ul><li>too large</li></ul>');
    await fs.promises.writeFile(path.join(root, 'index.htm'), '<p>Index</p>');

    await assert.rejects(
      readExtractedBook(root, {
        buildSearchIndex: false,
        maxMarkupBytes: 8,
      }),
      /markup safety limit.*8 bytes/i,
    );
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('readExtractedBook rejects an empty extracted cache so callers can rebuild it', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  try {
    await assert.rejects(
      readExtractedBook(root, { buildSearchIndex: false }),
      /no readable content/i,
    );
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('readExtractedBook rejects unsafe entries in an existing extracted cache', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  try {
    await fs.promises.writeFile(path.join(root, 'index.htm'), '<html><body>Index</body></html>');
    await fs.promises.symlink(path.join(root, 'index.htm'), path.join(root, 'linked.htm'));

    await assert.rejects(
      readExtractedBook(root, { buildSearchIndex: false }),
      /symbolic link/i,
    );
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('extractBook times out a stalled extractor', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  const extractorScript = path.join(root, 'stalled-extractor.js');
  const destination = path.join(root, 'output');
  try {
    await fs.promises.writeFile(extractorScript, 'setTimeout(() => {}, 1_000);');

    await assert.rejects(
      extractBook(extractorScript, destination, process.execPath, {
        buildSearchIndex: false,
        extractionTimeoutMs: 20,
      }),
      /timed out|ETIMEDOUT|killed|SIGTERM/i,
    );
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('extractBook ignores verbose extractor stdout while retaining successful output', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  const extractorScript = path.join(root, 'verbose-extractor.js');
  const destination = path.join(root, 'output');
  try {
    await fs.promises.writeFile(
      extractorScript,
      "require('node:fs').writeFileSync(process.argv[2] + '/index.htm', '<p>Index</p>'); process.stdout.write('x'.repeat(17 * 1024 * 1024));",
    );

    const book = await extractBook(extractorScript, destination, process.execPath, {
      buildSearchIndex: false,
    });

    assert.equal(book.defaultPage, 'index.htm');
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('extractBook validates extracted resources before reading book metadata', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  const extractorScript = path.join(root, 'oversized-extractor.js');
  const destination = path.join(root, 'output');
  try {
    await fs.promises.writeFile(
      extractorScript,
      "require('node:fs').writeFileSync(process.argv[2] + '/index.htm', 'too large');",
    );

    await assert.rejects(
      extractBook(extractorScript, destination, process.execPath, {
        buildSearchIndex: false,
        extractionLimits: { maxFileBytes: 4 },
      }),
      /per-file safety limit/i,
    );
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('validateExtractedBookTree accepts regular files within every extraction budget', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  try {
    await fs.promises.mkdir(path.join(root, 'guide'));
    await fs.promises.writeFile(path.join(root, 'index.htm'), 'index');
    await fs.promises.writeFile(path.join(root, 'guide', 'start.htm'), 'start');

    const result = await validateExtractedBookTree(root, {
      maxEntries: 3,
      maxFiles: 2,
      maxTotalBytes: 10,
      maxFileBytes: 5,
    });

    assert.deepEqual(
      { ...result, files: [...result.files].sort() },
      {
        entryCount: 3,
        fileCount: 2,
        totalBytes: 10,
        files: [path.join(root, 'guide', 'start.htm'), path.join(root, 'index.htm')].sort(),
      },
    );
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('default extraction budgets are finite and keep total size above the per-file limit', () => {
  assert.deepEqual(DEFAULT_EXTRACTION_LIMITS, {
    maxEntries: 60_000,
    maxFiles: 50_000,
    maxTotalBytes: 1024 * 1024 * 1024,
    maxFileBytes: 256 * 1024 * 1024,
  });
  assert.ok(DEFAULT_EXTRACTION_LIMITS.maxEntries >= DEFAULT_EXTRACTION_LIMITS.maxFiles);
  assert.ok(DEFAULT_EXTRACTION_LIMITS.maxTotalBytes >= DEFAULT_EXTRACTION_LIMITS.maxFileBytes);
});

test('validateExtractedBookTree rejects invalid extraction budgets', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  try {
    await assert.rejects(
      validateExtractedBookTree(root, { maxFiles: Number.POSITIVE_INFINITY }),
      /maxFiles must be a non-negative safe integer/,
    );
    await assert.rejects(
      validateExtractedBookTree(root, { maxTotalBytes: -1 }),
      /maxTotalBytes must be a non-negative safe integer/,
    );
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('validateExtractedBookTree rejects too many extracted entries', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  try {
    await fs.promises.writeFile(path.join(root, 'one.htm'), '1');
    await fs.promises.writeFile(path.join(root, 'two.htm'), '2');

    await assert.rejects(
      validateExtractedBookTree(root, { maxEntries: 1 }),
      /entry count safety limit/i,
    );
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('validateExtractedBookTree rejects too many extracted files', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  try {
    await fs.promises.writeFile(path.join(root, 'one.htm'), '1');
    await fs.promises.writeFile(path.join(root, 'two.htm'), '2');

    await assert.rejects(
      validateExtractedBookTree(root, { maxEntries: 2, maxFiles: 1 }),
      /file count safety limit/i,
    );
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('validateExtractedBookTree rejects a file above the per-file byte budget', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  try {
    await fs.promises.writeFile(path.join(root, 'oversized.bin'), Buffer.alloc(6));

    await assert.rejects(
      validateExtractedBookTree(root, { maxFileBytes: 5 }),
      /per-file safety limit/i,
    );
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('validateExtractedBookTree rejects files above the total byte budget', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  try {
    await fs.promises.writeFile(path.join(root, 'one.bin'), Buffer.alloc(4));
    await fs.promises.writeFile(path.join(root, 'two.bin'), Buffer.alloc(4));

    await assert.rejects(
      validateExtractedBookTree(root, { maxFileBytes: 4, maxTotalBytes: 7 }),
      /total size safety limit/i,
    );
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('validateExtractedBookTree rejects symbolic links without following them', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  try {
    await fs.promises.writeFile(path.join(root, 'index.htm'), 'index');
    await fs.promises.symlink(path.join(root, 'index.htm'), path.join(root, 'linked.htm'));

    await assert.rejects(
      validateExtractedBookTree(root),
      /symbolic link/i,
    );
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('validateExtractedBookTree rejects non-regular filesystem entries', async (context: any) => {
  if (process.platform === 'win32') {
    context.skip('FIFO creation is not available on Windows');
    return;
  }

  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-test-'));
  try {
    const fifoPath = path.join(root, 'blocked-pipe');
    const result = require('node:child_process').spawnSync('mkfifo', [fifoPath]);
    assert.equal(result.status, 0, result.stderr?.toString());

    await assert.rejects(
      validateExtractedBookTree(root),
      /non-regular entry/i,
    );
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('mapWithConcurrency never exceeds the configured worker limit', async () => {
  let active = 0;
  let maxActive = 0;

  const result = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (value: number) => {
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

test('normalizeSearchQuery trims whitespace and caps user-controlled search input', () => {
  assert.equal(normalizeSearchQuery('  VXLAN   routing  '), 'vxlan routing');
  assert.equal(normalizeSearchQuery('x'.repeat(300)).length, 200);
  assert.equal(normalizeSearchQuery(null), '');
});

test('extractSearchableText decodes entities and ignores non-content tags', () => {
  const text = extractSearchableText(`
    <html><head>
      <title>Network &amp; Routing</title>
      <style>.hidden { content: "ignored"; }</style>
      <template>ignored template</template>
    </head><body>
      <h1>VXLAN&nbsp;Guide</h1>
      <script>const ignored = "VXLAN";</script>
      <p>Use &lt;route&gt; entries.</p>
    </body></html>
  `);

  assert.equal(text, 'Network & Routing VXLAN Guide Use <route> entries.');
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

test('search match counting and highlighting cap adversarial match expansion per page', () => {
  const repeatedText = 'a'.repeat(10_005);

  assert.equal(MAX_SEARCH_MATCHES_PER_PAGE, 10_000);
  assert.equal(getSearchMatchCount(repeatedText, 'a'), MAX_SEARCH_MATCHES_PER_PAGE);

  const highlighted = highlightSearchMatches(`<p>${repeatedText}</p>`, 'a');
  assert.equal(highlighted.count, MAX_SEARCH_MATCHES_PER_PAGE);
  assert.equal(
    (highlighted.markup.match(/<mark class=/g) || []).length,
    MAX_SEARCH_MATCHES_PER_PAGE,
  );
  assert.ok(highlighted.markup.includes('aaaaa</p>'));
});

test('searchBookContents stops scanning after the result limit is reached', () => {
  const index = Array.from({ length: 101 }, (_, index) => ({
    path: `${index}.htm`,
    title: `Page ${index}`,
    get text() {
      if (index === 100) throw new Error('search scanned beyond its result limit');
      return 'match';
    },
  }));

  const results = searchBookContents(index, 'match');

  assert.equal(results.length, 100);
  assert.equal(results.at(-1)?.path, '99.htm');
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

test('highlightSearchMatches keeps encoded markup as text around a match', () => {
  const result = highlightSearchMatches(
    '<html><body><p>&lt;style&gt;body { display: none }&lt;/style&gt; VXLAN</p></body></html>',
    'vxlan',
  );

  assert.equal(result.count, 1);
  assert.match(result.markup, /&lt;style&gt;body \{ display: none \}&lt;\/style&gt; /);
  assert.doesNotMatch(result.markup, /<style>body \{ display: none \}<\/style>/);
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

test('injectContentNavigationBridge routes external web links to the parent app', () => {
  const markup = injectContentNavigationBridge(
    '<html><body><a href="https://example.com/docs">External</a></body></html>',
    'test-nonce',
  );

  assert.match(markup, /function openExternalLink\(target\)/);
  assert.match(markup, /linkUrl = new URL\(href, window\.location\.href\)/);
  assert.ok(markup.includes('if (!/^https?:$/i.test(linkUrl.protocol)) return false;'));
  assert.match(markup, /event\.preventDefault\(\)/);
  assert.match(markup, /type: 'chm-reader:open-external'/);
  assert.match(markup, /href: linkUrl\.href/);
});

test('injectContentNavigationBridge emits executable JavaScript for external links', () => {
  const markup = injectContentNavigationBridge(
    '<html><head></head><body></body></html>',
    'test-nonce',
  );
  const script = markup.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'expected an injected bridge script');

  const postedMessages: unknown[] = [];
  const listeners = new Map<string, (...args: any[]) => void>();
  const documentListeners = new Map<string, (...args: any[]) => void>();
  const context = {
    URL,
    window: {
      location: { href: 'chm://book/guide/index.html' },
      parent: {
        postMessage(message: unknown) {
          postedMessages.push(message);
        },
      },
      addEventListener(type: string, listener: (...args: any[]) => void) {
        listeners.set(type, listener);
      },
      setTimeout(listener: () => void) {
        listener();
      },
    },
    document: {
      readyState: 'complete',
      addEventListener(type: string, listener: (...args: any[]) => void) {
        documentListeners.set(type, listener);
      },
    },
  };

  assert.doesNotThrow(() => vm.runInNewContext(script, context));
  const clickListener = documentListeners.get('click');
  if (!clickListener) throw new Error('expected the bridge to register a click listener');

  let defaultPrevented = false;
  clickListener({
    target: {
      closest: () => ({
        getAttribute: () => 'https://example.com/docs',
      }),
    },
    preventDefault() {
      defaultPrevented = true;
    },
  });

  assert.equal(defaultPrevented, true);
  const externalMessage = postedMessages.at(-1) as { type?: string; href?: string };
  assert.equal(externalMessage.type, 'chm-reader:open-external');
  assert.equal(externalMessage.href, 'https://example.com/docs');
});
