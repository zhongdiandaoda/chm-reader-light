const { parentPort, workerData } = require('node:worker_threads');
const { createSearchIndex, listFiles } = require('./chm');

async function buildSearchIndex() {
  const files = listFiles(workerData.root);
  return createSearchIndex(
    workerData.root,
    files,
    workerData.contents,
    workerData.textEncoding || null,
    { concurrency: workerData.concurrency },
  );
}

buildSearchIndex()
  .then((searchIndex) => {
    parentPort.postMessage({ searchIndex });
  })
  .catch((error) => {
    parentPort.postMessage({
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
  });
