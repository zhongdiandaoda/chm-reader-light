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

function extractSearchableText(markup) {
  const $ = cheerio.load(markup);
  $('script, style, noscript, template').remove();
  const textMarkup = $.root().html().replace(/<[^>]+>/g, ' ');
  return cheerio.load(textMarkup).text().replace(/\s+/g, ' ').trim();
}

function normalizeSearchText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase();
}

function createSearchPattern(query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return null;

  const pattern = normalizedQuery
    .split(' ')
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('\\s+');
  return new RegExp(pattern, 'gi');
}

function getSearchMatchCount(text, query) {
  const pattern = createSearchPattern(query);
  if (!pattern) return 0;
  return [...String(text || '').matchAll(pattern)].length;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function highlightSearchMatches(markup, query, selectedIndex = 0) {
  const pattern = createSearchPattern(query);
  if (!pattern) return { markup, count: 0 };

  const $ = cheerio.load(markup, { decodeEntities: false });
  let matchIndex = 0;
  $('body, body *').contents().each((_, node) => {
    if (node.type !== 'text' || ['script', 'style', 'noscript', 'template'].includes(node.parent?.tagName)) {
      return;
    }

    const text = node.data || '';
    if (!pattern.test(text)) return;
    pattern.lastIndex = 0;
    const replacement = text.replace(pattern, (match) => {
      const classes = matchIndex === selectedIndex
        ? 'chm-search-match chm-search-current'
        : 'chm-search-match';
      const id = matchIndex === selectedIndex ? ' id="chm-search-current"' : '';
      matchIndex += 1;
      return `<mark class="${classes}"${id}>${escapeHtml(match)}</mark>`;
    });
    $(node).replaceWith(replacement);
    pattern.lastIndex = 0;
  });

  return { markup: $.html(), count: matchIndex };
}

function getTopicTitles(items, titles = new Map()) {
  items.forEach((item) => {
    if (item.path) {
      const topicPath = normalizeTopicPath(item.path).split('#', 1)[0];
      titles.set(topicPath.toLocaleLowerCase(), item.title);
    }
    getTopicTitles(item.children, titles);
  });
  return titles;
}

async function createSearchIndex(root, files, contents) {
  const titles = getTopicTitles(contents);
  const htmlFiles = files.filter((file) => ['.htm', '.html'].includes(path.extname(file).toLowerCase()));

  const entries = await Promise.all(htmlFiles.map(async (file) => {
    try {
      const relativePath = path.relative(root, file).split(path.sep).join('/');
      const markup = decodeMarkup(await fs.promises.readFile(file));
      const $ = cheerio.load(markup);
      const pageTitle = $('title').first().text().trim();
      return {
        path: relativePath,
        title: titles.get(relativePath.toLocaleLowerCase()) || pageTitle || path.basename(relativePath),
        text: extractSearchableText(markup),
      };
    } catch {
      return null;
    }
  }));
  return entries.filter(Boolean);
}

function searchBookContents(index, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  return index
    .map((entry) => ({ ...entry, count: getSearchMatchCount(entry.text, normalizedQuery) }))
    .filter((entry) => entry.count > 0)
    .slice(0, 100)
    .map((entry) => {
      const text = entry.text.replace(/\s+/g, ' ').trim();
      const position = normalizeSearchText(text).indexOf(normalizedQuery);
      const start = Math.max(0, position - 48);
      const end = Math.min(text.length, position + normalizedQuery.length + 96);
      return {
        path: entry.path,
        title: entry.title,
        count: entry.count,
        excerpt: `${start > 0 ? '...' : ''}${text.slice(start, end)}${end < text.length ? '...' : ''}`,
      };
    });
}

async function extractBook(chmPath, destination, extractor = 'extract_chmLib') {
  await fs.promises.mkdir(destination, { recursive: true });
  await execFileAsync(extractor, [chmPath, destination]);

  const files = listFiles(destination);
  const metadata = findBookMetadata(destination, files);
  const contents = metadata.contentsFile
    ? parseContents(decodeMarkup(await fs.promises.readFile(metadata.contentsFile)))
    : [];
  const searchIndex = await createSearchIndex(destination, files, contents);

  return {
    ...metadata,
    contents,
    searchIndex,
  };
}

module.exports = {
  createSearchIndex,
  decodeMarkup,
  extractBook,
  extractSearchableText,
  findBookMetadata,
  getSearchMatchCount,
  highlightSearchMatches,
  normalizeSearchText,
  normalizeTopicPath,
  parseContents,
  resolveBookResource,
  searchBookContents,
};
