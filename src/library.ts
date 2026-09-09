export interface LibraryCollection {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface LibraryBook {
  id: string;
  name: string;
  filePath?: string;
  storedName?: string;
  addedAt?: number;
  lastOpenedAt?: number;
  collectionId: string | null;
  [key: string]: unknown;
}

export interface LibraryData {
  collections: LibraryCollection[];
  books: LibraryBook[];
  [key: string]: unknown;
}

export interface LibraryLimits {
  maxCollections?: number;
  maxBooks?: number;
  maxIdChars?: number;
  maxNameChars?: number;
  maxPathChars?: number;
}

export const DEFAULT_LIBRARY_LIMITS = Object.freeze({
  maxCollections: 1_000,
  maxBooks: 10_000,
  maxIdChars: 256,
  maxNameChars: 512,
  maxPathChars: 32_768,
});

function resolveLibraryLimit(value: number | undefined, fallback: number, name: keyof LibraryLimits): number {
  const limit = value === undefined ? fallback : value;
  if (!Number.isSafeInteger(limit) || limit < 0) {
    throw new TypeError(`${name} must be a non-negative safe integer`);
  }
  return limit;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function boundedString(value: unknown, maxChars: number): string | undefined {
  return typeof value === 'string' && value.length <= maxChars ? value : undefined;
}

function normalizeLibraryCollection(
  value: unknown,
  maxIdChars: number,
  maxNameChars: number,
): LibraryCollection | null {
  if (!isRecord(value)) return null;
  const id = boundedString(value.id, maxIdChars);
  const name = boundedString(value.name, maxNameChars);
  if (id === undefined || name === undefined) return null;

  return {
    id,
    name,
    ...(typeof value.createdAt === 'number' && Number.isFinite(value.createdAt)
      ? { createdAt: value.createdAt }
      : {}),
  };
}

function normalizeLibraryBook(
  value: unknown,
  legacy: boolean,
  maxIdChars: number,
  maxNameChars: number,
  maxPathChars: number,
): LibraryBook | null {
  if (!isRecord(value)) return null;
  const id = boundedString(value.id, maxIdChars);
  const name = boundedString(value.name, maxNameChars);
  if (id === undefined || name === undefined) return null;

  const filePath = boundedString(value.filePath, maxPathChars);
  const storedName = boundedString(value.storedName, maxPathChars);
  const collectionId = legacy ? null : boundedString(value.collectionId, maxIdChars) ?? null;
  return {
    id,
    name,
    ...(filePath === undefined ? {} : { filePath }),
    ...(storedName === undefined ? {} : { storedName }),
    ...(typeof value.addedAt === 'number' && Number.isFinite(value.addedAt) ? { addedAt: value.addedAt } : {}),
    ...(typeof value.lastOpenedAt === 'number' && Number.isFinite(value.lastOpenedAt)
      ? { lastOpenedAt: value.lastOpenedAt }
      : {}),
    collectionId,
  };
}

export function normalizeLibraryData(
  parsed: unknown,
  limits: LibraryLimits = {},
): LibraryData {
  const maxCollections = resolveLibraryLimit(
    limits.maxCollections,
    DEFAULT_LIBRARY_LIMITS.maxCollections,
    'maxCollections',
  );
  const maxBooks = resolveLibraryLimit(limits.maxBooks, DEFAULT_LIBRARY_LIMITS.maxBooks, 'maxBooks');
  const maxIdChars = resolveLibraryLimit(limits.maxIdChars, DEFAULT_LIBRARY_LIMITS.maxIdChars, 'maxIdChars');
  const maxNameChars = resolveLibraryLimit(limits.maxNameChars, DEFAULT_LIBRARY_LIMITS.maxNameChars, 'maxNameChars');
  const maxPathChars = resolveLibraryLimit(limits.maxPathChars, DEFAULT_LIBRARY_LIMITS.maxPathChars, 'maxPathChars');
  const legacy = Array.isArray(parsed);
  const source = isRecord(parsed) ? parsed : {};
  const rawCollections = legacy ? [] : (Array.isArray(source.collections) ? source.collections : []);
  const rawBooks = legacy ? parsed : (Array.isArray(source.books) ? source.books : []);

  if (rawCollections.length > maxCollections) {
    throw new Error(`Library exceeds the collection count safety limit (${maxCollections})`);
  }
  if (rawBooks.length > maxBooks) {
    throw new Error(`Library exceeds the book count safety limit (${maxBooks})`);
  }

  return {
    collections: rawCollections
      .map((collection) => normalizeLibraryCollection(collection, maxIdChars, maxNameChars))
      .filter((collection): collection is LibraryCollection => collection !== null),
    books: rawBooks
      .map((book) => normalizeLibraryBook(book, legacy, maxIdChars, maxNameChars, maxPathChars))
      .filter((book): book is LibraryBook => book !== null),
  };
}

export function normalizeLibraryDataForWrite(
  library: unknown,
  limits: LibraryLimits = {},
): LibraryData {
  if (!isRecord(library) || !Array.isArray(library.collections) || !Array.isArray(library.books)) {
    throw new Error('Library state has invalid metadata');
  }

  const normalized = normalizeLibraryData(library, limits);
  if (normalized.collections.length !== library.collections.length) {
    throw new Error('Library state contains invalid collection metadata');
  }
  if (normalized.books.length !== library.books.length) {
    throw new Error('Library state contains invalid book metadata');
  }

  const maxIdChars = resolveLibraryLimit(limits.maxIdChars, DEFAULT_LIBRARY_LIMITS.maxIdChars, 'maxIdChars');
  const maxPathChars = resolveLibraryLimit(limits.maxPathChars, DEFAULT_LIBRARY_LIMITS.maxPathChars, 'maxPathChars');
  const hasInvalidOptionalString = (value: unknown, maxChars: number) => (
    value !== undefined && boundedString(value, maxChars) === undefined
  );
  const hasInvalidOptionalNumber = (value: unknown) => (
    value !== undefined && (typeof value !== 'number' || !Number.isFinite(value))
  );

  for (const collection of library.collections as Record<string, unknown>[]) {
    if (hasInvalidOptionalNumber(collection.createdAt)) {
      throw new Error('Library state contains invalid collection metadata');
    }
  }
  for (const book of library.books as Record<string, unknown>[]) {
    if (
      hasInvalidOptionalString(book.filePath, maxPathChars)
      || hasInvalidOptionalString(book.storedName, maxPathChars)
      || (book.collectionId !== undefined
        && book.collectionId !== null
        && boundedString(book.collectionId, maxIdChars) === undefined)
      || hasInvalidOptionalNumber(book.addedAt)
      || hasInvalidOptionalNumber(book.lastOpenedAt)
    ) {
      throw new Error('Library state contains invalid book metadata');
    }
  }

  return normalized;
}

export function normalizeCollectionName(value: unknown): string {
  return String(value || '').trim().slice(0, DEFAULT_LIBRARY_LIMITS.maxNameChars);
}

export function getNextCollectionName(
  collections: readonly LibraryCollection[] | null | undefined,
  baseName = '新书库',
): string {
  const usedNames = new Set(
    (Array.isArray(collections) ? collections : [])
      .map((collection) => collection?.name)
      .filter(Boolean),
  );

  if (!usedNames.has(baseName)) return baseName;

  let index = 2;
  while (usedNames.has(`${baseName} ${index}`)) {
    index += 1;
  }
  return `${baseName} ${index}`;
}

export function renameCollectionInLibrary(
  library: LibraryData | null | undefined,
  id: string | null | undefined,
  name: unknown,
): LibraryData {
  const nextName = normalizeCollectionName(name);
  if (!id || !nextName) return library || { collections: [], books: [] };

  return {
    collections: library ? library.collections.map((collection) => (
      collection.id === id ? { ...collection, name: nextName } : collection
    )) : [],
    books: library?.books || [],
  };
}

export function addBooksToLibrary(
  library: LibraryData,
  filePaths: readonly string[],
  collectionId: string | null,
  createId: () => string,
  now: () => number,
  caseInsensitivePaths = false,
): LibraryData {
  const books = [...library.books];
  const knownPaths = new Set(
    books
      .map((book) => book.filePath)
      .filter((filePath): filePath is string => Boolean(filePath))
      .map((filePath) => normalizeLibraryPathIdentity(filePath, caseInsensitivePaths)),
  );

  for (const filePath of filePaths) {
    const pathIdentity = normalizeLibraryPathIdentity(filePath, caseInsensitivePaths);
    if (!filePath.toLocaleLowerCase().endsWith('.chm') || knownPaths.has(pathIdentity)) continue;

    const fileName = filePath.split(/[\\/]/).pop() || filePath;
    const extensionIndex = fileName.toLocaleLowerCase().lastIndexOf('.chm');
    books.push({
      id: createId(),
      name: extensionIndex >= 0 ? fileName.slice(0, extensionIndex) : fileName,
      filePath,
      addedAt: now(),
      collectionId: collectionId || null,
    });
    knownPaths.add(pathIdentity);
  }

  return {
    ...library,
    books,
  };
}

function normalizeLibraryPathIdentity(filePath: string, caseInsensitive: boolean): string {
  const source = filePath.replaceAll('\\', '/');
  const prefix = source.startsWith('/') ? '/' : '';
  const segments: string[] = [];
  for (const segment of source.split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..' && segments.length > 0 && segments.at(-1) !== '..') {
      segments.pop();
    } else if (segment !== '..' || !prefix) {
      segments.push(segment);
    }
  }
  const normalized = prefix + segments.join('/');
  return caseInsensitive ? normalized.toLocaleLowerCase() : normalized;
}

export function findBookByFilePath(
  books: readonly LibraryBook[],
  filePath: string,
  caseInsensitive = false,
): LibraryBook | undefined {
  const targetPath = normalizeLibraryPathIdentity(filePath, caseInsensitive);
  return books.find((book) => Boolean(book.filePath)
    && normalizeLibraryPathIdentity(book.filePath as string, caseInsensitive) === targetPath);
}

export function relinkBookInLibrary(
  library: LibraryData,
  id: string,
  filePath: string,
  caseInsensitivePaths = false,
): LibraryData {
  const targetPath = normalizeLibraryPathIdentity(filePath, caseInsensitivePaths);
  const duplicate = library.books.some((book) => book.id !== id && Boolean(book.filePath)
    && normalizeLibraryPathIdentity(book.filePath as string, caseInsensitivePaths) === targetPath);
  if (duplicate) throw new Error('A library entry for this CHM file already exists.');

  const fileName = filePath.split(/[\\/]/).pop() || filePath;
  const extensionIndex = fileName.toLocaleLowerCase().lastIndexOf('.chm');
  const name = extensionIndex >= 0 ? fileName.slice(0, extensionIndex) : fileName;
  return {
    ...library,
    books: library.books.map((book) => {
      if (book.id !== id) return book;
      const { sourceMissing: _sourceMissing, storedName: _storedName, ...persistentBook } = book;
      return {
        ...persistentBook,
        name: name || book.name,
        filePath,
      };
    }),
  };
}

export function markBookOpenedInLibrary(
  library: LibraryData,
  id: string,
  timestamp: number,
): LibraryData {
  return {
    ...library,
    books: library.books.map((book) => (
      book.id === id ? { ...book, lastOpenedAt: timestamp } : book
    )),
  };
}

export function getBookLocationLabel(filePath: string | null | undefined): string {
  if (!filePath) return '';

  const normalizedPath = filePath.replaceAll('\\', '/');
  const parts = normalizedPath.split('/').filter(Boolean);
  if (parts.length < 2) return '';
  return parts[parts.length - 2] || '';
}

export function formatLibraryAddedDate(timestamp: number | null | undefined): string {
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) return '';

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function filterBooksByQuery(
  books: readonly LibraryBook[],
  query: string | null | undefined,
): LibraryBook[] {
  const normalizedQuery = String(query || '').trim().toLocaleLowerCase();
  if (!normalizedQuery) return [...books];

  return books.filter((book) => (
    book.name.toLocaleLowerCase().includes(normalizedQuery)
    || String(book.filePath || '').toLocaleLowerCase().includes(normalizedQuery)
  ));
}

export function sortBooksForDisplay(books: readonly LibraryBook[]): LibraryBook[] {
  const lastOpenedAtValue = (book: LibraryBook) => (
    typeof book.lastOpenedAt === 'number' && Number.isFinite(book.lastOpenedAt) ? book.lastOpenedAt : 0
  );
  const addedAtValue = (book: LibraryBook) => (
    typeof book.addedAt === 'number' && Number.isFinite(book.addedAt) ? book.addedAt : 0
  );

  return [...books].sort((left, right) => {
    const leftLastOpenedAt = lastOpenedAtValue(left);
    const rightLastOpenedAt = lastOpenedAtValue(right);
    if (leftLastOpenedAt !== rightLastOpenedAt) return rightLastOpenedAt - leftLastOpenedAt;

    const leftAddedAt = addedAtValue(left);
    const rightAddedAt = addedAtValue(right);
    if (leftAddedAt !== rightAddedAt) return rightAddedAt - leftAddedAt;
    return left.name.localeCompare(right.name, undefined, { sensitivity: 'base' });
  });
}
