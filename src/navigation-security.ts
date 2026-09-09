export function isAllowedBookFrameNavigation(url: string, isMainFrame: boolean): boolean {
  if (isMainFrame) return false;
  if (url === 'about:blank') return true;
  try {
    const target = new URL(url);
    return target.protocol.toLowerCase() === 'chm:' && target.hostname.toLowerCase() === 'book';
  } catch {
    return false;
  }
}

export function normalizeExternalWebUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const target = new URL(value);
    if (!['http:', 'https:'].includes(target.protocol.toLowerCase())) return null;
    return target.toString();
  } catch {
    return null;
  }
}
