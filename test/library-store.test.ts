const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  createSerializedStateUpdater,
  DEFAULT_LIBRARY_FILE_LIMIT_BYTES,
  readLibraryFile,
  writeLibraryFile,
} = require('../src/library-store');

export { };

test('readLibraryFile treats a missing file as an empty initial state', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-library-store-'));
  try {
    assert.equal(await readLibraryFile(path.join(root, 'library.json')), null);
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('readLibraryFile reports corrupt JSON without replacing the source file', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-library-store-'));
  const libraryPath = path.join(root, 'library.json');
  try {
    await fs.promises.writeFile(libraryPath, '{ incomplete');

    await assert.rejects(readLibraryFile(libraryPath), /Unexpected|JSON/);
    assert.equal(await fs.promises.readFile(libraryPath, 'utf-8'), '{ incomplete');
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('library metadata uses a finite default file-size budget', () => {
  assert.equal(DEFAULT_LIBRARY_FILE_LIMIT_BYTES, 16 * 1024 * 1024);
});

test('readLibraryFile rejects oversized metadata before loading it', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-library-store-'));
  const libraryPath = path.join(root, 'library.json');
  try {
    await fs.promises.writeFile(libraryPath, '{"books":[]}');

    await assert.rejects(
      readLibraryFile(libraryPath, 4),
      /library metadata exceeds.*4 bytes/i,
    );
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('readLibraryFile rejects symbolic links without following them', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-library-store-'));
  const targetPath = path.join(root, 'target.json');
  const libraryPath = path.join(root, 'library.json');
  try {
    await fs.promises.writeFile(targetPath, '{"books":[]}');
    await fs.promises.symlink(targetPath, libraryPath);

    await assert.rejects(readLibraryFile(libraryPath), /symbolic link|ELOOP/i);
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('writeLibraryFile rejects oversized metadata without replacing existing state', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-library-store-'));
  const libraryPath = path.join(root, 'library.json');
  const previous = '{"collections":[],"books":[]}';
  try {
    await fs.promises.writeFile(libraryPath, previous);

    await assert.rejects(
      writeLibraryFile(libraryPath, { books: [{ name: 'too large' }] }, 8),
      /library metadata exceeds.*8 bytes/i,
    );
    assert.equal(await fs.promises.readFile(libraryPath, 'utf-8'), previous);
    assert.deepEqual(await fs.promises.readdir(root), ['library.json']);
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('library metadata rejects invalid file-size budgets', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-library-store-'));
  const libraryPath = path.join(root, 'library.json');
  try {
    await assert.rejects(readLibraryFile(libraryPath, -1), /non-negative safe integer/i);
    await assert.rejects(writeLibraryFile(libraryPath, {}, Number.POSITIVE_INFINITY), /non-negative safe integer/i);
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('writeLibraryFile atomically replaces the index and leaves no temporary file', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-library-store-'));
  const libraryPath = path.join(root, 'library.json');
  const library = {
    collections: [{ id: 'docs', name: 'Docs' }],
    books: [{ id: 'guide', name: 'Guide', filePath: '/docs/Guide.chm', collectionId: 'docs' }],
  };
  try {
    await fs.promises.writeFile(libraryPath, '{"collections":[],"books":[]}');
    await writeLibraryFile(libraryPath, library);

    assert.deepEqual(JSON.parse(await fs.promises.readFile(libraryPath, 'utf-8')), library);
    assert.deepEqual(
      (await fs.promises.readdir(root)).filter((fileName: string) => fileName !== 'library.json'),
      [],
    );
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('writeLibraryFile keeps concurrent writes isolated', async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-library-store-'));
  const libraryPath = path.join(root, 'library.json');
  const first = { collections: [], books: [{ id: 'first' }] };
  const second = { collections: [{ id: 'second' }], books: [] };
  try {
    await Promise.all([
      writeLibraryFile(libraryPath, first),
      writeLibraryFile(libraryPath, second),
    ]);

    const stored = JSON.parse(await fs.promises.readFile(libraryPath, 'utf-8'));
    assert.ok(
      JSON.stringify(stored) === JSON.stringify(first) || JSON.stringify(stored) === JSON.stringify(second),
    );
    assert.deepEqual(
      (await fs.promises.readdir(root)).filter((fileName: string) => fileName !== 'library.json'),
      [],
    );
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test('createSerializedStateUpdater prevents concurrent read-modify-write updates from losing state', async () => {
  let state = { count: 0 };
  const update = createSerializedStateUpdater(
    async () => ({ ...state }),
    async (nextState: { count: number }) => {
      state = nextState;
    },
  );

  await Promise.all([
    update(async (current: { count: number }) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { count: current.count + 1 };
    }),
    update(async (current: { count: number }) => ({ count: current.count + 1 })),
  ]);

  assert.deepEqual(state, { count: 2 });
});

test('createSerializedStateUpdater continues after a rejected update', async () => {
  let state = { count: 0 };
  const update = createSerializedStateUpdater(
    async () => ({ ...state }),
    async (nextState: { count: number }) => {
      state = nextState;
    },
  );

  await assert.rejects(
    update(async () => {
      throw new Error('rejected update');
    }),
    /rejected update/,
  );
  await update(async (current: { count: number }) => ({ count: current.count + 1 }));

  assert.deepEqual(state, { count: 1 });
});

test('createSerializedStateUpdater publishes transformed results in mutation order', async () => {
  let state = { count: 0 };
  let releaseFirstResult: (() => void) | undefined;
  const firstResultGate = new Promise<void>((resolve) => {
    releaseFirstResult = resolve;
  });
  const events: string[] = [];
  const update = createSerializedStateUpdater(
    async () => ({ ...state }),
    async (nextState: { count: number }) => { state = nextState; },
    async (nextState: { count: number }) => {
      events.push(`prepare-${nextState.count}`);
      if (nextState.count === 1) await firstResultGate;
      events.push(`publish-${nextState.count}`);
      return { ...nextState, prepared: true };
    },
  );

  const first = update((current: { count: number }) => ({ count: current.count + 1 }));
  const second = update((current: { count: number }) => ({ count: current.count + 1 }));
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(events, ['prepare-1']);

  releaseFirstResult?.();
  assert.deepEqual(await first, { count: 1, prepared: true });
  assert.deepEqual(await second, { count: 2, prepared: true });
  assert.deepEqual(events, ['prepare-1', 'publish-1', 'prepare-2', 'publish-2']);
});
