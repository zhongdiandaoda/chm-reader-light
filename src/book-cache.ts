const { createHash } = require('node:crypto');
const path = require('node:path');

export interface BookCacheFileIdentity {
  dev: bigint;
  ino: bigint;
  size: bigint;
  mtimeNs: bigint;
  ctimeNs: bigint;
}

export function isSameBookCacheIdentity(
  left: BookCacheFileIdentity,
  right: BookCacheFileIdentity,
): boolean {
  return left.dev === right.dev
    && left.ino === right.ino
    && left.size === right.size
    && left.mtimeNs === right.mtimeNs
    && left.ctimeNs === right.ctimeNs;
}

export function createBookCacheKey(
  chmPath: string,
  stats: BookCacheFileIdentity,
): string {
  const identityParts = [
    path.resolve(chmPath),
    stats.dev,
    stats.ino,
    stats.size,
    stats.mtimeNs,
    stats.ctimeNs,
  ];

  return createHash('sha256')
    .update(identityParts.map(String).join('\0'))
    .digest('hex');
}
