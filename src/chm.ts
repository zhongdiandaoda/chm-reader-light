const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
import * as cheerio from 'cheerio';

const execFileAsync = promisify(execFile);

export interface BookContentsItem {
  title: string;
  path: string | null;
  children: BookContentsItem[];
}

export interface BookMetadata {
  contentsFile: string | null;
  defaultPage: string | null;
  contents: BookContentsItem[];
  searchIndex: SearchIndexEntry[];
}

export interface SearchIndexEntry {
  path: string;
  title: string;
  text: string;
}

export interface SearchResult {
  path: string;
  title: string;
  count: number;
  excerpt: string;
}

export interface SearchIndexOptions {
  concurrency?: number;
}

export interface ReadExtractedBookOptions extends SearchIndexOptions {
  textEncoding?: string | null;
  buildSearchIndex?: boolean;
  indexConcurrency?: number;
}

export interface ExtractBookOptions extends ReadExtractedBookOptions { }

export function parseContents(markup: string): BookContentsItem[] {
  const $ = cheerio.load(markup);
  const root = $('ul').first();

  function parseList(list: any): BookContentsItem[] {
    const nodes: BookContentsItem[] = [];
    let previousNode: BookContentsItem | null = null;

    list.children().each((_: number, element: any) => {
      const item = $(element);
      const tagName = element.tagName?.toLowerCase();

      if (tagName === 'ul' && previousNode) {
        previousNode.children = parseList(item);
        return;
      }

      if (tagName !== 'li') return;

      const sitemap = item.children('object').first();
      const params = new Map();

      sitemap.children('param').each((__: number, param: any) => {
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

export function normalizeTopicPath(topicPath: string | null | undefined): string | null {
  if (!topicPath) return null;

  return topicPath
    .replace(/^mk:@MSITStore:[^:]+::\//i, '')
    .replace(/^::\//, '')
    .replace(/^[/\\]+/, '')
    .replaceAll('\\', '/');
}

export function findBookMetadata(root: string, files: readonly string[]): Omit<BookMetadata, 'contents' | 'searchIndex'> {
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

export function resolveBookResource(root: string, encodedPath: string): string {
  const pathWithoutSuffix = encodedPath.split(/[?#]/, 1)[0];
  const relativePath = decodeURIComponent(pathWithoutSuffix).replace(/^[/\\]+/, '');
  const rootPath = path.resolve(root);
  const resolvedPath = path.resolve(rootPath, relativePath);

  if (resolvedPath !== rootPath && !resolvedPath.startsWith(`${rootPath}${path.sep}`)) {
    throw new Error('Resource is outside the opened book');
  }

  return resolvedPath;
}

export function listFiles(root: string): string[] {
  return fs.readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry: any) => entry.isFile())
    .map((entry: any) => path.join(entry.parentPath, entry.name));
}

export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number | undefined,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const limit = Math.max(1, Math.floor(Number(concurrency) || 1));
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function consume() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => consume(),
  );
  await Promise.all(workers);
  return results;
}

export function decodeMarkup(buffer: Uint8Array, textEncoding: string | null = null): string {
  if (textEncoding) {
    return new TextDecoder(textEncoding).decode(buffer);
  }

  const preview = Buffer.from(buffer.subarray(0, 2048)).toString('latin1');
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

export function extractSearchableText(markup: string): string {
  const $ = cheerio.load(markup);
  $('script, style, noscript, template').remove();
  const textMarkup = ($.root().html() || '').replace(/<[^>]+>/g, ' ');
  return cheerio.load(textMarkup).text().replace(/\s+/g, ' ').trim();
}

export function normalizeSearchText(value: unknown): string {
  return String(value || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase();
}

function createSearchPattern(query: string): RegExp | null {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return null;

  const pattern = normalizedQuery
    .split(' ')
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('\\s+');
  return new RegExp(pattern, 'gi');
}

export function getSearchMatchCount(text: string, query: string): number {
  const pattern = createSearchPattern(query);
  if (!pattern) return 0;
  return [...String(text || '').matchAll(pattern)].length;
}

function escapeHtml(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (character: string) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  } as Record<string, string>)[character]);
}

export function injectContentNavigationBridge(markup: string, nonce: string): string {
  const bridge = `<script nonce="${escapeHtml(nonce)}">
(function () {
  function notifyNavigation() {
    try {
      window.parent.postMessage({
        type: 'chm-reader:navigated',
        href: window.location.href
      }, '*');
    } catch (_) {}
  }

  window.addEventListener('hashchange', notifyNavigation);
  window.addEventListener('popstate', notifyNavigation);
  document.addEventListener('click', function (event) {
    var target = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!target) return;
    window.setTimeout(notifyNavigation, 0);
    window.setTimeout(notifyNavigation, 80);
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', notifyNavigation, { once: true });
  } else {
    notifyNavigation();
  }
  window.addEventListener('load', notifyNavigation, { once: true });
}());
</script>`;

  if (/<\/head>/i.test(markup)) {
    return markup.replace(/<\/head>/i, `${bridge}</head>`);
  }
  if (/<\/body>/i.test(markup)) {
    return markup.replace(/<\/body>/i, `${bridge}</body>`);
  }
  return `${bridge}${markup}`;
}

export function highlightSearchMatches(
  markup: string,
  query: string,
  selectedIndex = 0,
): { markup: string; count: number } {
  const pattern = createSearchPattern(query);
  if (!pattern) return { markup, count: 0 };

  const $ = cheerio.load(markup, { decodeEntities: false } as any);
  let matchIndex = 0;
  $('body, body *').contents().each((_: number, node: any) => {
    if (node.type !== 'text' || ['script', 'style', 'noscript', 'template'].includes(node.parent?.tagName)) {
      return;
    }

    const text = node.data || '';
    if (!pattern.test(text)) return;
    pattern.lastIndex = 0;
    const replacement = text.replace(pattern, (match: string) => {
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

function getTopicTitles(
  items: readonly BookContentsItem[],
  titles = new Map<string, string>(),
): Map<string, string> {
  items.forEach((item) => {
    if (item.path) {
      const topicPath = (normalizeTopicPath(item.path) || '').split('#', 1)[0];
      titles.set(topicPath.toLocaleLowerCase(), item.title);
    }
    getTopicTitles(item.children, titles);
  });
  return titles;
}

export async function createSearchIndex(
  root: string,
  files: readonly string[],
  contents: readonly BookContentsItem[],
  textEncoding: string | null = null,
  options: SearchIndexOptions = {},
): Promise<SearchIndexEntry[]> {
  const titles = getTopicTitles(contents);
  const htmlFiles = files.filter((file) => ['.htm', '.html'].includes(path.extname(file).toLowerCase()));
  const concurrency = options.concurrency || 4;

  const entries = await mapWithConcurrency(htmlFiles, concurrency, async (file) => {
    try {
      const relativePath = path.relative(root, file).split(path.sep).join('/');
      const markup = decodeMarkup(await fs.promises.readFile(file), textEncoding);
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
  });
  return entries.filter((entry): entry is SearchIndexEntry => entry !== null);
}

export function searchBookContents(index: readonly SearchIndexEntry[], query: string): SearchResult[] {
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

export async function readExtractedBook(
  root: string,
  textEncodingOrOptions: string | ReadExtractedBookOptions | null = null,
): Promise<BookMetadata> {
  const options: ReadExtractedBookOptions = typeof textEncodingOrOptions === 'object' && textEncodingOrOptions !== null
    ? textEncodingOrOptions
    : { textEncoding: textEncodingOrOptions };
  const textEncoding = options.textEncoding || null;
  const files = listFiles(root);
  const metadata = findBookMetadata(root, files);
  const contents = metadata.contentsFile
    ? parseContents(decodeMarkup(await fs.promises.readFile(metadata.contentsFile), textEncoding))
    : [];
  const searchIndex = options.buildSearchIndex === false
    ? []
    : await createSearchIndex(root, files, contents, textEncoding, {
      concurrency: options.indexConcurrency,
    });

  return {
    ...metadata,
    contents,
    searchIndex,
  };
}

export async function extractBook(
  chmPath: string,
  destination: string,
  extractor = 'extract_chmLib',
  options: ExtractBookOptions = {},
): Promise<BookMetadata> {
  await fs.promises.mkdir(destination, { recursive: true });
  await execFileAsync(extractor, [chmPath, destination]);

  return readExtractedBook(destination, {
    textEncoding: options.textEncoding || null,
    buildSearchIndex: options.buildSearchIndex !== false,
    indexConcurrency: options.indexConcurrency,
  });
}
