const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const cheerio = require('cheerio');

const execFileAsync = promisify(execFile);

function parseContents(markup) {
  const $ = cheerio.load(markup);
  const root = $('ul').first();

  function parseList(list) {
    const nodes = [];
    let previousNode = null;

    list.children().each((_, element) => {
      const item = $(element);
      const tagName = element.tagName?.toLowerCase();

      if (tagName === 'ul' && previousNode) {
        previousNode.children = parseList(item);
        return;
      }

      if (tagName !== 'li') return;

      const sitemap = item.children('object').first();
      const params = new Map();

      sitemap.children('param').each((__, param) => {
        const name = ($(param).attr('name') || '').toLowerCase();
        params.set(name, $(param).attr('value') || '');
      });

      const title = params.get('name') || 'Untitled';
      const localPath = normalizeTopicPath(params.get('local'));
      const nestedList = item.children('ul').first();

      previousNode = {
        title,
        path: localPath,
        children: nestedList.length ? parseList(nestedList) : [],
      };
      nodes.push(previousNode);
    });

    return nodes;
  }

  return root.length ? parseList(root) : [];
}

function normalizeTopicPath(topicPath) {
  if (!topicPath) return null;

  return topicPath
    .replace(/^mk:@MSITStore:[^:]+::\//i, '')
    .replace(/^::\//, '')
    .replace(/^[/\\]+/, '')
    .replaceAll('\\', '/');
}

function findBookMetadata(root, files) {
  const contentsFile = files.find((file) => path.extname(file).toLowerCase() === '.hhc') || null;
  const htmlFiles = files.filter((file) => ['.htm', '.html'].includes(path.extname(file).toLowerCase()));
  const preferredNames = ['index.htm', 'index.html', 'default.htm', 'default.html'];
  const defaultFile = preferredNames
    .map((name) => htmlFiles.find((file) => path.basename(file).toLowerCase() === name))
    .find(Boolean) || htmlFiles[0] || null;

  return {
    contentsFile,
    defaultPage: defaultFile ? path.relative(root, defaultFile).split(path.sep).join('/') : null,
  };
}

function resolveBookResource(root, encodedPath) {
  const pathWithoutSuffix = encodedPath.split(/[?#]/, 1)[0];
  const relativePath = decodeURIComponent(pathWithoutSuffix).replace(/^[/\\]+/, '');
  const rootPath = path.resolve(root);
  const resolvedPath = path.resolve(rootPath, relativePath);

  if (resolvedPath !== rootPath && !resolvedPath.startsWith(`${rootPath}${path.sep}`)) {
    throw new Error('Resource is outside the opened book');
  }

  return resolvedPath;
}

function listFiles(root) {
  return fs.readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name));
}

function decodeMarkup(buffer) {
  const preview = buffer.subarray(0, 2048).toString('latin1');
  const declaredCharset = preview.match(/charset\s*=\s*["']?([\w-]+)/i)?.[1];

  if (declaredCharset) {
    try {
      return new TextDecoder(declaredCharset).decode(buffer);
    } catch {
      // Continue with encoding detection when a legacy charset label is invalid.
    }
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder('gb18030').decode(buffer);
  }
}

async function extractBook(chmPath, destination, extractor = 'extract_chmLib') {
  await fs.promises.mkdir(destination, { recursive: true });
  await execFileAsync(extractor, [chmPath, destination]);

  const files = listFiles(destination);
  const metadata = findBookMetadata(destination, files);
  const contents = metadata.contentsFile
    ? parseContents(decodeMarkup(await fs.promises.readFile(metadata.contentsFile)))
    : [];

  return {
    ...metadata,
    contents,
  };
}

module.exports = {
  decodeMarkup,
  extractBook,
  findBookMetadata,
  normalizeTopicPath,
  parseContents,
  resolveBookResource,
};
