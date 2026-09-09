const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

export const DEFAULT_LIBRARY_FILE_LIMIT_BYTES = 16 * 1024 * 1024;

export function createSerializedStateUpdater<T, Result = T>(
  readState: () => Promise<T>,
  writeState: (state: T) => Promise<void>,
  prepareResult: (state: T) => Result | Promise<Result> = async (state) => state as unknown as Result,
): (update: (state: T) => T | Promise<T>) => Promise<Result> {
  let pending: Promise<void> = Promise.resolve();

  return (update) => {
    const operation = pending.then(async () => {
      const current = await readState();
      const next = await update(current);
      await writeState(next);
      return prepareResult(next);
    });
    pending = operation.then(() => undefined, () => undefined);
    return operation;
  };
}

function resolveLibraryFileLimit(maxBytes: number): number {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
    throw new TypeError('maxBytes must be a non-negative safe integer');
  }
  return maxBytes;
}

function assertLibraryFileSize(size: number, maxBytes: number): void {
  if (size > maxBytes) {
    throw new Error(`Library metadata exceeds the file-size safety limit (${maxBytes} bytes)`);
  }
}

export async function readLibraryFile(
  filePath: string,
  maxBytes: number = DEFAULT_LIBRARY_FILE_LIMIT_BYTES,
): Promise<unknown | null> {
  const byteLimit = resolveLibraryFileLimit(maxBytes);
  let handle: import('node:fs/promises').FileHandle | undefined;
  try {
    const noFollowFlag = typeof fs.constants.O_NOFOLLOW === 'number' ? fs.constants.O_NOFOLLOW : 0;
    const pathStats = await fs.promises.lstat(filePath);
    if (pathStats.isSymbolicLink()) throw new Error('Library metadata is a symbolic link');
    const openedHandle = await fs.promises.open(filePath, fs.constants.O_RDONLY | noFollowFlag);
    handle = openedHandle;
    const stats = await openedHandle.stat();
    if (!stats.isFile()) throw new Error('Library metadata is not a regular file');
    if (pathStats.dev !== stats.dev || pathStats.ino !== stats.ino) {
      throw new Error('Library metadata changed while it was being opened');
    }
    assertLibraryFileSize(stats.size, byteLimit);

    const buffer = Buffer.allocUnsafe(stats.size);
    let offset = 0;
    while (offset < buffer.length) {
      const { bytesRead } = await openedHandle.read(buffer, offset, buffer.length - offset, offset);
      if (bytesRead === 0) break;
      offset += bytesRead;
    }
    const finalStats = await openedHandle.stat();
    assertLibraryFileSize(finalStats.size, byteLimit);
    if (finalStats.size !== stats.size || offset !== stats.size) {
      throw new Error('Library metadata changed while it was being read');
    }
    return JSON.parse(buffer.toString('utf-8'));
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') return null;
    throw error;
  } finally {
    await handle?.close();
  }
}

export async function writeLibraryFile(
  filePath: string,
  library: unknown,
  maxBytes: number = DEFAULT_LIBRARY_FILE_LIMIT_BYTES,
): Promise<void> {
  const byteLimit = resolveLibraryFileLimit(maxBytes);
  const serialized = JSON.stringify(library, null, 2);
  assertLibraryFileSize(Buffer.byteLength(serialized), byteLimit);
  const directory = path.dirname(filePath);
  const temporaryPath = path.join(
    directory,
    `.${path.basename(filePath)}.${process.pid}.${randomUUID()}.tmp`,
  );
  await fs.promises.mkdir(directory, { recursive: true });

  try {
    await fs.promises.writeFile(temporaryPath, serialized);
    await fs.promises.rename(temporaryPath, filePath);
  } catch (error) {
    await fs.promises.rm(temporaryPath, { force: true }).catch(() => { });
    throw error;
  }
}
