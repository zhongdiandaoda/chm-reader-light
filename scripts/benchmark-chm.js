const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { performance } = require('node:perf_hooks');
const { promisify } = require('node:util');

const rootDir = path.resolve(__dirname, '..');
const {
  createSearchIndex,
  decodeMarkup,
  findBookMetadata,
  listFiles,
  parseContents,
  readExtractedBook,
} = require(path.join(rootDir, 'build', 'chm.js'));
const execFileAsync = promisify(execFile);

function readNumberFlag(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1 || index + 1 >= process.argv.length) return fallback;
  const value = Number.parseInt(process.argv[index + 1], 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function readStringFlag(name, fallback = null) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1 || index + 1 >= process.argv.length) return fallback;
  return process.argv[index + 1];
}

function readBooleanFlag(name) {
  return process.argv.includes(`--${name}`);
}

function createParagraph(pageIndex, paragraphIndex) {
  return [
    `Page ${pageIndex} paragraph ${paragraphIndex} explains CHM parsing, navigation, and search indexing.`,
    'The benchmark keeps enough repeated text to exercise HTML text extraction and whitespace normalization.',
    'VXLAN routing examples, GB18030 compatibility notes, and resource links make the content closer to docs.',
  ].join(' ');
}

async function writeSyntheticBook(root, pages, paragraphs) {
  const sections = Math.max(1, Math.ceil(pages / 20));
  const hhcItems = [];

  for (let section = 0; section < sections; section += 1) {
    hhcItems.push([
      '<li><object type="text/sitemap">',
      `<param name="Name" value="Section ${section + 1}">`,
      `<param name="Local" value="section-${section + 1}/page-1.htm">`,
      '</object><ul>',
    ].join(''));

    const start = section * 20;
    const end = Math.min(pages, start + 20);
    for (let page = start; page < end; page += 1) {
      const relativePath = `section-${section + 1}/page-${page - start + 1}.htm`;
      hhcItems.push([
        '<li><object type="text/sitemap">',
        `<param name="Name" value="Topic ${page + 1}">`,
        `<param name="Local" value="${relativePath}">`,
        '</object></li>',
      ].join(''));

      const directory = path.join(root, `section-${section + 1}`);
      await fs.promises.mkdir(directory, { recursive: true });
      const body = Array.from({ length: paragraphs }, (_, paragraph) => (
        `<p>${createParagraph(page + 1, paragraph + 1)}</p>`
      )).join('\n');
      await fs.promises.writeFile(path.join(root, relativePath), [
        '<!doctype html>',
        '<html>',
        '<head>',
        '<meta charset="utf-8">',
        `<title>Topic ${page + 1}</title>`,
        '<style>.hidden { display: none; }</style>',
        '</head>',
        '<body>',
        '<script>window.unrelated = true;</script>',
        `<h1>Topic ${page + 1}</h1>`,
        body,
        '</body>',
        '</html>',
      ].join('\n'));
    }

    hhcItems.push('</ul></li>');
  }

  await fs.promises.writeFile(
    path.join(root, 'index.hhc'),
    `<html><body><ul>${hhcItems.join('')}</ul></body></html>`,
  );
}

async function measure(label, iterations, action) {
  await action();

  const samples = [];
  let lastResult = null;
  for (let index = 0; index < iterations; index += 1) {
    const start = performance.now();
    lastResult = await action();
    samples.push(performance.now() - start);
  }

  samples.sort((a, b) => a - b);
  const total = samples.reduce((sum, value) => sum + value, 0);
  const mean = total / samples.length;
  const median = samples[Math.floor(samples.length / 2)];
  const min = samples[0];

  return {
    label,
    pages: lastResult.searchIndex.length,
    contents: lastResult.contents.length,
    minMs: Math.round(min),
    medianMs: Math.round(median),
    meanMs: Math.round(mean),
    samplesMs: samples.map((value) => Math.round(value)),
  };
}

async function measureOnce(label, action) {
  const start = performance.now();
  const result = await action();
  return {
    label,
    ms: Math.round(performance.now() - start),
    result,
  };
}

async function benchmarkExtractedBook(root, concurrency, textEncoding = null, buildSearchIndex = true) {
  const phases = [];
  const listed = await measureOnce('listFiles', async () => listFiles(root));
  const files = listed.result;
  phases.push({ label: listed.label, ms: listed.ms, files: files.length });

  const metadata = await measureOnce('metadata', async () => {
    const base = findBookMetadata(root, files);
    const contents = base.contentsFile
      ? parseContents(decodeMarkup(await fs.promises.readFile(base.contentsFile), textEncoding))
      : [];
    return { ...base, contents };
  });
  phases.push({
    label: metadata.label,
    ms: metadata.ms,
    contents: metadata.result.contents.length,
    contentsFile: metadata.result.contentsFile ? path.relative(root, metadata.result.contentsFile) : null,
    defaultPage: metadata.result.defaultPage,
  });

  if (buildSearchIndex) {
    const indexed = await measureOnce('createSearchIndex', async () => createSearchIndex(
      root,
      files,
      metadata.result.contents,
      textEncoding,
      { concurrency },
    ));
    phases.push({
      label: indexed.label,
      ms: indexed.ms,
      pages: indexed.result.length,
    });
  }

  const totalMs = phases.reduce((sum, phase) => sum + phase.ms, 0);
  return {
    totalMs,
    phases,
  };
}

async function benchmarkChm(chmPath, iterations, concurrency, extractor, textEncoding = null, buildSearchIndex = true) {
  const samples = [];
  let last = null;

  for (let index = 0; index < iterations; index += 1) {
    const extractRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-real-bench-'));
    try {
      const extracted = await measureOnce('extract_chmLib', async () => {
        await execFileAsync(extractor, [chmPath, extractRoot], { maxBuffer: 1024 * 1024 * 16 });
      });
      const parsed = await benchmarkExtractedBook(extractRoot, concurrency, textEncoding, buildSearchIndex);
      last = {
        totalMs: extracted.ms + parsed.totalMs,
        phases: [
          { label: extracted.label, ms: extracted.ms },
          ...parsed.phases,
        ],
      };
      samples.push(last.totalMs);
    } finally {
      await fs.promises.rm(extractRoot, { recursive: true, force: true });
    }
  }

  samples.sort((a, b) => a - b);
  return {
    chmPath,
    fileSizeBytes: fs.statSync(chmPath).size,
    iterations,
    concurrency,
    minMs: samples[0],
    medianMs: samples[Math.floor(samples.length / 2)],
    meanMs: Math.round(samples.reduce((sum, value) => sum + value, 0) / samples.length),
    samplesMs: samples,
    last,
  };
}

async function main() {
  const pages = readNumberFlag('pages', 800);
  const paragraphs = readNumberFlag('paragraphs', 8);
  const iterations = readNumberFlag('iterations', 5);
  const concurrency = readNumberFlag('concurrency', 4);
  const chmPath = readStringFlag('chm');
  const extractedRoot = readStringFlag('extracted-root');
  const extractor = readStringFlag('extractor', 'extract_chmLib');
  const buildSearchIndex = !readBooleanFlag('skip-search-index');
  const tempRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'chm-reader-bench-'));

  try {
    if (extractedRoot) {
      console.log(JSON.stringify({
        extractedRoot: path.resolve(extractedRoot),
        concurrency,
        buildSearchIndex,
        ...(await benchmarkExtractedBook(path.resolve(extractedRoot), concurrency, null, buildSearchIndex)),
      }, null, 2));
      return;
    }

    if (chmPath) {
      console.log(JSON.stringify(await benchmarkChm(
        path.resolve(chmPath),
        iterations,
        concurrency,
        extractor,
        null,
        buildSearchIndex,
      ), null, 2));
      return;
    }

    await writeSyntheticBook(tempRoot, pages, paragraphs);
    const result = await measure('readExtractedBook', iterations, () => readExtractedBook(tempRoot, {
      indexConcurrency: concurrency,
    }));

    console.log(JSON.stringify({
      pages,
      paragraphs,
      iterations,
      concurrency,
      result,
    }, null, 2));
  } finally {
    await fs.promises.rm(tempRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
