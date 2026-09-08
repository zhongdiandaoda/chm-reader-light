const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
import * as cheerio from 'cheerio';
import { Parser } from 'htmlparser2';

const IGNORED_TEXT_TAGS = new Set(['script', 'style', 'noscript', 'template']);
export const MAX_SEARCH_QUERY_LENGTH = 200;
export const MAX_SEARCH_MATCHES_PER_PAGE = 10_000;
const MAX_EXTRACTION_OUTPUT_BYTES = 16 * 1024 * 1024;

function runExtractor(
  extractor: string,
  args: string[],
  timeoutMs: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(extractor, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    const stderrChunks: Buffer[] = [];
    let stderrBytes = 0;
    let timedOut = false;
    let settled = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, timeoutMs);

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) reject(error);
      else resolve();
    };

    child.stderr.on('data', (chunk: Buffer) => {
      stderrBytes += chunk.length;
      if (stderrBytes > MAX_EXTRACTION_OUTPUT_BYTES) {
        child.kill('SIGTERM');
        finish(new Error(`CHM extractor stderr exceeded ${MAX_EXTRACTION_OUTPUT_BYTES} bytes`));
        return;
      }
      stderrChunks.push(Buffer.from(chunk));
    });
    child.on('error', finish);
    child.on('close', (code: number | null, signal: string | null) => {
      if (timedOut) {
        finish(new Error(`CHM extraction timed out after ${timeoutMs} ms`));
        return;
      }
      if (code !== 0) {
        const stderr = Buffer.concat(stderrChunks).toString('utf8').trim();
        finish(new Error(`CHM extractor exited with code ${code}${signal ? ` (${signal})` : ''}${stderr ? `: ${stderr}` : ''}`));
        return;
      }
      finish();
    });
  });
}

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
  maxMarkupBytes?: number;
  maxSearchIndexSourceBytes?: number;
}

export interface ContentsLimits {
  maxItems?: number;
  maxDepth?: number;
}

export interface ReadExtractedBookOptions extends SearchIndexOptions {
  textEncoding?: string | null;
  buildSearchIndex?: boolean;
  indexConcurrency?: number;
  extractionLimits?: ExtractionLimits;
  contentsLimits?: ContentsLimits;
}

export interface ExtractionLimits {
  maxEntries?: number;
  maxFiles?: number;
  maxTotalBytes?: number;
  maxFileBytes?: number;
}

export interface ExtractedBookTreeStats {
  entryCount: number;
  fileCount: number;
  totalBytes: number;
  files: string[];
}

export interface ExtractBookOptions extends ReadExtractedBookOptions {
  extractionTimeoutMs?: number;
}

const DEFAULT_EXTRACTION_TIMEOUT_MS = 2 * 60 * 1000;
export const DEFAULT_EXTRACTION_LIMITS = Object.freeze({
  maxEntries: 60_000,
  maxFiles: 50_000,
  maxTotalBytes: 1024 * 1024 * 1024,
  maxFileBytes: 256 * 1024 * 1024,
});
export const DEFAULT_MARKUP_LIMITS = Object.freeze({
  maxMarkupBytes: 16 * 1024 * 1024,
  maxSearchIndexSourceBytes: 128 * 1024 * 1024,
});
export const DEFAULT_CONTENTS_LIMITS = Object.freeze({
  maxItems: 50_000,
  maxDepth: 256,
});

export class MarkupTooLargeError extends Error {
  constructor(maxMarkupBytes: number) {
    super(`Markup source exceeds the markup safety limit (${maxMarkupBytes} bytes)`);
    this.name = 'MarkupTooLargeError';
  }
}

export function parseContents(
  markup: string,
  limits: ContentsLimits = {},
): BookContentsItem[] {
  const maxItems = resolveByteLimit(limits.maxItems, DEFAULT_CONTENTS_LIMITS.maxItems, 'maxItems');
  const maxDepth = resolveByteLimit(limits.maxDepth, DEFAULT_CONTENTS_LIMITS.maxDepth, 'maxDepth');
  const $ = cheerio.load(markup);
  const root = $('ul').first();
  let itemCount = 0;

  function parseList(list: any, depth: number): BookContentsItem[] {
    if (depth > maxDepth) {
      throw new Error(`CHM contents exceeds the contents depth safety limit (${maxDepth})`);
    }
    const nodes: BookContentsItem[] = [];
    let previousNode: BookContentsItem | null = null;

    list.children().each((_: number, element: any) => {
      const item = $(element);
      const tagName = element.tagName?.toLowerCase();

      if (tagName === 'ul' && previousNode) {
        previousNode.children = parseList(item, depth + 1);
        return;
      }

      if (tagName !== 'li') return;
      itemCount += 1;
      if (itemCount > maxItems) {
        throw new Error(`CHM contents exceeds the contents item safety limit (${maxItems})`);
      }

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
        children: nestedList.length ? parseList(nestedList, depth + 1) : [],
      };
      nodes.push(previousNode);
    });

    return nodes;
  }

  return root.length ? parseList(root, 1) : [];
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

function resolveExtractionLimit(
  value: number | undefined,
  fallback: number,
  name: keyof ExtractionLimits,
): number {
  const limit = value === undefined ? fallback : value;
  if (!Number.isSafeInteger(limit) || limit < 0) {
    throw new TypeError(`${name} must be a non-negative safe integer`);
  }
  return limit;
}

function resolveByteLimit(value: number | undefined, fallback: number, name: string): number {
  const limit = value === undefined ? fallback : value;
  if (!Number.isSafeInteger(limit) || limit < 0) {
    throw new TypeError(`${name} must be a non-negative safe integer`);
  }
  return limit;
}

export async function validateExtractedBookTree(
  root: string,
  limits: ExtractionLimits = {},
): Promise<ExtractedBookTreeStats> {
  const maxEntries = resolveExtractionLimit(limits.maxEntries, DEFAULT_EXTRACTION_LIMITS.maxEntries, 'maxEntries');
  const maxFiles = resolveExtractionLimit(limits.maxFiles, DEFAULT_EXTRACTION_LIMITS.maxFiles, 'maxFiles');
  const maxTotalBytes = resolveExtractionLimit(
    limits.maxTotalBytes,
    DEFAULT_EXTRACTION_LIMITS.maxTotalBytes,
    'maxTotalBytes',
  );
  const maxFileBytes = resolveExtractionLimit(
    limits.maxFileBytes,
    DEFAULT_EXTRACTION_LIMITS.maxFileBytes,
    'maxFileBytes',
  );
  const pendingDirectories = [root];
  let entryCount = 0;
  let fileCount = 0;
  let totalBytes = 0;
  const files: string[] = [];

  while (pendingDirectories.length > 0) {
    const directory = pendingDirectories.pop() as string;
    const entries = await fs.promises.opendir(directory);
    for await (const entry of entries) {
      entryCount += 1;
      if (entryCount > maxEntries) {
        throw new Error(`Extracted CHM exceeds the entry count safety limit (${maxEntries})`);
      }

      const entryPath = path.join(directory, entry.name);
      const stats = await fs.promises.lstat(entryPath);
      if (stats.isSymbolicLink()) {
        throw new Error(`Extracted CHM contains a symbolic link: ${entry.name}`);
      }
      if (stats.isDirectory()) {
        pendingDirectories.push(entryPath);
        continue;
      }
      if (!stats.isFile()) {
        throw new Error(`Extracted CHM contains a non-regular entry: ${entry.name}`);
      }

      fileCount += 1;
      if (fileCount > maxFiles) {
        throw new Error(`Extracted CHM exceeds the file count safety limit (${maxFiles})`);
      }
      if (stats.size > maxFileBytes) {
        throw new Error(`Extracted CHM exceeds the per-file safety limit (${maxFileBytes} bytes)`);
      }
      totalBytes += stats.size;
      if (totalBytes > maxTotalBytes) {
        throw new Error(`Extracted CHM exceeds the total size safety limit (${maxTotalBytes} bytes)`);
      }
      files.push(entryPath);
    }
  }

  files.sort();
  return { entryCount, fileCount, totalBytes, files };
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

export async function readMarkupFile(
  filePath: string,
  textEncoding: string | null = null,
  maxMarkupBytes: number = DEFAULT_MARKUP_LIMITS.maxMarkupBytes,
  expectedBytes?: number,
): Promise<string> {
  const byteLimit = resolveByteLimit(
    maxMarkupBytes,
    DEFAULT_MARKUP_LIMITS.maxMarkupBytes,
    'maxMarkupBytes',
  );
  const noFollowFlag = typeof fs.constants.O_NOFOLLOW === 'number' ? fs.constants.O_NOFOLLOW : 0;
  const pathStats = await fs.promises.lstat(filePath);
  if (pathStats.isSymbolicLink()) {
    throw new Error('Markup source is a symbolic link');
  }
  const handle = await fs.promises.open(filePath, fs.constants.O_RDONLY | noFollowFlag);
  try {
    const stats = await handle.stat();
    if (!stats.isFile()) {
      throw new Error('Markup source is not a regular file');
    }
    if (pathStats.dev !== stats.dev || pathStats.ino !== stats.ino) {
      throw new Error('Markup source changed while it was being opened');
    }
    if (stats.size > byteLimit) {
      throw new MarkupTooLargeError(byteLimit);
    }
    if (expectedBytes !== undefined && stats.size !== expectedBytes) {
      throw new Error('Markup source changed after resource accounting');
    }

    const buffer = Buffer.allocUnsafe(stats.size);
    let offset = 0;
    while (offset < buffer.length) {
      const { bytesRead } = await handle.read(buffer, offset, buffer.length - offset, offset);
      if (bytesRead === 0) break;
      offset += bytesRead;
    }
    const finalStats = await handle.stat();
    if (finalStats.size !== stats.size) {
      if (finalStats.size > byteLimit) {
        throw new MarkupTooLargeError(byteLimit);
      }
      throw new Error('Markup source changed while it was being read');
    }
    if (offset !== stats.size) {
      throw new Error('Markup source changed while it was being read');
    }
    return decodeMarkup(buffer, textEncoding);
  } finally {
    await handle.close();
  }
}

export function extractSearchableText(markup: string): string {
  return extractHtmlTextAndTitle(markup).text;
}

function extractHtmlTextAndTitle(markup: string): { title: string; text: string } {
  const textParts: string[] = [];
  const titleParts: string[] = [];
  let ignoredDepth = 0;
  let titleDepth = 0;

  const parser = new Parser({
    onopentag(name: string) {
      const tagName = name.toLowerCase();
      if (IGNORED_TEXT_TAGS.has(tagName)) {
        ignoredDepth += 1;
        return;
      }
      if (tagName === 'title' && ignoredDepth === 0) {
        titleDepth += 1;
      }
      if (ignoredDepth === 0) {
        textParts.push(' ');
        if (titleDepth > 0) {
          titleParts.push(' ');
        }
      }
    },
    ontext(text: string) {
      if (ignoredDepth > 0) return;
      textParts.push(text);
      if (titleDepth > 0) {
        titleParts.push(text);
      }
    },
    onclosetag(name: string) {
      const tagName = name.toLowerCase();
      if (IGNORED_TEXT_TAGS.has(tagName)) {
        ignoredDepth = Math.max(0, ignoredDepth - 1);
        return;
      }
      if (tagName === 'title') {
        titleDepth = Math.max(0, titleDepth - 1);
      }
      if (ignoredDepth === 0) {
        textParts.push(' ');
        if (titleDepth > 0) {
          titleParts.push(' ');
        }
      }
    },
  }, { decodeEntities: true });

  parser.end(markup);

  return {
    title: titleParts.join('').replace(/\s+/g, ' ').trim(),
    text: textParts.join('').replace(/\s+/g, ' ').trim(),
  };
}

export function normalizeSearchText(value: unknown): string {
  return String(value || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase();
}

export function normalizeSearchQuery(value: unknown): string {
  return normalizeSearchText(value).slice(0, MAX_SEARCH_QUERY_LENGTH);
}

function createSearchPattern(query: string): RegExp | null {
  const normalizedQuery = normalizeSearchQuery(query);
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

  let count = 0;
  for (const _match of String(text || '').matchAll(pattern)) {
    count += 1;
    if (count >= MAX_SEARCH_MATCHES_PER_PAGE) break;
  }
  return count;
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

  function openExternalLink(target) {
    var href = target.getAttribute('href');
    if (!href) return false;

    var linkUrl;
    try {
      linkUrl = new URL(href, window.location.href);
    } catch (_) {
      return false;
    }

    if (!/^https?:$/i.test(linkUrl.protocol)) return false;
    try {
      window.parent.postMessage({
        type: 'chm-reader:open-external',
        href: linkUrl.href
      }, '*');
    } catch (_) {}
    return true;
  }

  window.addEventListener('hashchange', notifyNavigation);
  window.addEventListener('popstate', notifyNavigation);
  document.addEventListener('click', function (event) {
    var target = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!target) return;
    if (openExternalLink(target)) {
      event.preventDefault();
      return;
    }
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
    let replacement = '';
    let previousEnd = 0;
    for (const match of text.matchAll(pattern)) {
      if (matchIndex >= MAX_SEARCH_MATCHES_PER_PAGE) break;
      const matchStart = match.index || 0;
      replacement += escapeHtml(text.slice(previousEnd, matchStart));
      const classes = matchIndex === selectedIndex
        ? 'chm-search-match chm-search-current'
        : 'chm-search-match';
      const id = matchIndex === selectedIndex ? ' id="chm-search-current"' : '';
      matchIndex += 1;
      replacement += `<mark class="${classes}"${id}>${escapeHtml(match[0])}</mark>`;
      previousEnd = matchStart + match[0].length;
    }
    replacement += escapeHtml(text.slice(previousEnd));
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
  const maxMarkupBytes = resolveByteLimit(
    options.maxMarkupBytes,
    DEFAULT_MARKUP_LIMITS.maxMarkupBytes,
    'maxMarkupBytes',
  );
  const maxSearchIndexSourceBytes = resolveByteLimit(
    options.maxSearchIndexSourceBytes,
    DEFAULT_MARKUP_LIMITS.maxSearchIndexSourceBytes,
    'maxSearchIndexSourceBytes',
  );
  const selectedFiles: Array<{ file: string; size: number }> = [];
  let selectedSourceBytes = 0;

  for (const file of htmlFiles) {
    try {
      const stats = await fs.promises.stat(file);
      if (!stats.isFile() || stats.size > maxMarkupBytes) continue;
      if (selectedSourceBytes + stats.size > maxSearchIndexSourceBytes) break;
      selectedSourceBytes += stats.size;
      selectedFiles.push({ file, size: stats.size });
    } catch {
      // Skip unreadable pages while retaining the remaining searchable content.
    }
  }

  const entries = await mapWithConcurrency(selectedFiles, concurrency, async ({ file, size }) => {
    try {
      const relativePath = path.relative(root, file).split(path.sep).join('/');
      const markup = await readMarkupFile(file, textEncoding, maxMarkupBytes, size);
      const page = extractHtmlTextAndTitle(markup);
      return {
        path: relativePath,
        title: titles.get(relativePath.toLocaleLowerCase()) || page.title || path.basename(relativePath),
        text: page.text,
      };
    } catch {
      return null;
    }
  });
  return entries.filter((entry): entry is SearchIndexEntry => entry !== null);
}

export function searchBookContents(index: readonly SearchIndexEntry[], query: string): SearchResult[] {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return [];

  const results: SearchResult[] = [];
  for (const entry of index) {
    const count = getSearchMatchCount(entry.text, normalizedQuery);
    if (count === 0) continue;

    const text = entry.text.replace(/\s+/g, ' ').trim();
    const position = normalizeSearchText(text).indexOf(normalizedQuery);
    const start = Math.max(0, position - 48);
    const end = Math.min(text.length, position + normalizedQuery.length + 96);
    results.push({
      path: entry.path,
      title: entry.title,
      count,
      excerpt: `${start > 0 ? '...' : ''}${text.slice(start, end)}${end < text.length ? '...' : ''}`,
    });
    if (results.length >= 100) break;
  }
  return results;
}

export async function readExtractedBook(
  root: string,
  textEncodingOrOptions: string | ReadExtractedBookOptions | null = null,
): Promise<BookMetadata> {
  const options: ReadExtractedBookOptions = typeof textEncodingOrOptions === 'object' && textEncodingOrOptions !== null
    ? textEncodingOrOptions
    : { textEncoding: textEncodingOrOptions };
  const textEncoding = options.textEncoding || null;
  const { files } = await validateExtractedBookTree(root, options.extractionLimits);
  if (!files.length) {
    throw new Error('Extracted CHM contains no readable content');
  }
  const metadata = findBookMetadata(root, files);
  const contents = metadata.contentsFile
    ? parseContents(
      await readMarkupFile(metadata.contentsFile, textEncoding, options.maxMarkupBytes),
      options.contentsLimits,
    )
    : [];
  const searchIndex = options.buildSearchIndex === false
    ? []
    : await createSearchIndex(root, files, contents, textEncoding, {
      concurrency: options.indexConcurrency,
      maxMarkupBytes: options.maxMarkupBytes,
      maxSearchIndexSourceBytes: options.maxSearchIndexSourceBytes,
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
  const extractionTimeoutMs = options.extractionTimeoutMs || DEFAULT_EXTRACTION_TIMEOUT_MS;
  await runExtractor(extractor, [chmPath, destination], extractionTimeoutMs);

  return readExtractedBook(destination, {
    textEncoding: options.textEncoding || null,
    buildSearchIndex: options.buildSearchIndex !== false,
    indexConcurrency: options.indexConcurrency,
    maxMarkupBytes: options.maxMarkupBytes,
    maxSearchIndexSourceBytes: options.maxSearchIndexSourceBytes,
    extractionLimits: options.extractionLimits,
    contentsLimits: options.contentsLimits,
  });
}
