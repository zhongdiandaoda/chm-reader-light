(function attachNavigationHelpers(globalScope) {
  function normalizeTopicReference(value) {
    if (!value) return null;

    let rawPath = value;
    try {
      const parsed = new URL(value);
      if (parsed.protocol === 'chm:' && parsed.hostname === 'book') {
        rawPath = parsed.pathname;
      }
    } catch {
      rawPath = value;
    }

    const pathOnly = rawPath.split(/[?#]/, 1)[0].replace(/^[/\\]+/, '');
    if (!pathOnly) return null;

    return decodeURIComponent(pathOnly)
      .replace(/^[/\\]+/, '')
      .replaceAll('\\', '/')
      .toLocaleLowerCase();
  }

  function normalizeTopicReferenceWithHash(value) {
    const normalizedPath = normalizeTopicReference(value);
    if (!normalizedPath) return null;

    let hash = '';
    try {
      hash = new URL(value).hash;
    } catch {
      const hashIndex = String(value).indexOf('#');
      hash = hashIndex >= 0 ? String(value).slice(hashIndex) : '';
    }

    return `${normalizedPath}${decodeURIComponent(hash).toLocaleLowerCase()}`;
  }

  function findTopicPath(items, matches) {
    for (const item of items) {
      if (matches(item)) return item.path;

      const childPath = findTopicPath(item.children || [], matches);
      if (childPath) return childPath;
    }

    return null;
  }

  function findTopicPathByUrl(items, url) {
    const targetPath = normalizeTopicReference(url);
    if (!targetPath) return null;

    const targetWithHash = normalizeTopicReferenceWithHash(url);
    const exactPath = findTopicPath(
      items,
      (item) => normalizeTopicReferenceWithHash(item.path) === targetWithHash,
    );
    if (exactPath) return exactPath;

    return findTopicPath(
      items,
      (item) => normalizeTopicReference(item.path) === targetPath,
    );
  }

  function getTopicPathsInReadingOrder(items) {
    const topicPaths = [];

    function visit(item) {
      if (item.path) topicPaths.push(item.path);
      (item.children || []).forEach(visit);
    }

    items.forEach(visit);
    return topicPaths;
  }

  const api = {
    findTopicPathByUrl,
    getTopicPathsInReadingOrder,
    normalizeTopicReference,
    normalizeTopicReferenceWithHash,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.chmNavigation = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
