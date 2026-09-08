export interface NavigationItem {
  title?: string;
  path?: string | null;
  children?: NavigationItem[];
}

function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

export function normalizeTopicReference(value: string | null | undefined): string | null {
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

  const decodedPath = safeDecodeURIComponent(pathOnly);
  if (decodedPath === null) return null;

  return decodedPath
    .replace(/^[/\\]+/, '')
    .replaceAll('\\', '/')
    .toLocaleLowerCase();
}

export function normalizeTopicReferenceWithHash(value: string | null | undefined): string | null {
  const normalizedPath = normalizeTopicReference(value);
  if (!normalizedPath) return null;

  let hash = '';
  try {
    hash = new URL(value as string).hash;
  } catch {
    const hashIndex = String(value).indexOf('#');
    hash = hashIndex >= 0 ? String(value).slice(hashIndex) : '';
  }

  const decodedHash = safeDecodeURIComponent(hash);
  return decodedHash === null ? null : `${normalizedPath}${decodedHash.toLocaleLowerCase()}`;
}

function findTopicPath(
  items: readonly NavigationItem[],
  matches: (item: NavigationItem) => boolean,
): string | null {
  for (const item of items) {
    if (matches(item)) return item.path || null;

    const childPath = findTopicPath(item.children || [], matches);
    if (childPath) return childPath;
  }

  return null;
}

export function findTopicPathByUrl(
  items: readonly NavigationItem[],
  url: string | null | undefined,
): string | null {
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

export function getTopicPathsInReadingOrder(items: readonly NavigationItem[]): string[] {
  const topicPaths: string[] = [];

  function visit(item: NavigationItem): void {
    if (item.path) topicPaths.push(item.path);
    (item.children || []).forEach(visit);
  }

  items.forEach(visit);
  return topicPaths;
}
