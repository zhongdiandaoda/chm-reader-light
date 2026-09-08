import { parentPort, workerData } from 'node:worker_threads';
import { createSearchIndex, validateExtractedBookTree } from './chm';

async function buildSearchIndex() {
  const { files } = await validateExtractedBookTree(workerData.root);
  return createSearchIndex(
    workerData.root,
    files,
    workerData.contents,
    workerData.textEncoding || null,
    {
      concurrency: workerData.concurrency,
      maxMarkupBytes: workerData.maxMarkupBytes,
      maxSearchIndexSourceBytes: workerData.maxSearchIndexSourceBytes,
    },
  );
}

buildSearchIndex()
  .then((searchIndex) => {
    parentPort?.postMessage({ searchIndex });
  })
  .catch((error) => {
    parentPort?.postMessage({
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
  });
