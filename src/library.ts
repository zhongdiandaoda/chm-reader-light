export interface LibraryCollection {
  id?: string;
  name?: string;
  [key: string]: unknown;
}

export interface LibraryData {
  collections?: LibraryCollection[];
  books?: unknown[];
  [key: string]: unknown;
}

export function normalizeCollectionName(value: unknown): string {
  return String(value || '').trim();
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
  if (!id || !nextName) return library || {};

  return {
    collections: (Array.isArray(library?.collections) ? library.collections : [])
      .map((collection) => (
        collection.id === id ? { ...collection, name: nextName } : collection
      )),
    books: Array.isArray(library?.books) ? library.books : [],
  };
}
