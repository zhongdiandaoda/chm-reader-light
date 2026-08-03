(function attachLibraryHelpers(globalScope) {
  function normalizeCollectionName(value) {
    return String(value || '').trim();
  }

  function getNextCollectionName(collections, baseName = '新书库') {
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

  function renameCollectionInLibrary(library, id, name) {
    const nextName = normalizeCollectionName(name);
    if (!id || !nextName) return library;

    return {
      collections: (Array.isArray(library?.collections) ? library.collections : [])
        .map((collection) => (
          collection.id === id ? { ...collection, name: nextName } : collection
        )),
      books: Array.isArray(library?.books) ? library.books : [],
    };
  }

  const api = {
    getNextCollectionName,
    normalizeCollectionName,
    renameCollectionInLibrary,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.chmLibrary = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
