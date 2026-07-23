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

  function findTopicPathByUrl(items, url) {
    const targetPath = normalizeTopicReference(url);
    if (!targetPath) return null;

    for (const item of items) {
      if (normalizeTopicReference(item.path) === targetPath) {
        return item.path;
      }

      const childPath = findTopicPathByUrl(item.children || [], url);
      if (childPath) return childPath;
    }

    return null;
  }

  const api = {
    findTopicPathByUrl,
    normalizeTopicReference,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.chmNavigation = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
