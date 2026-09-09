const test = require('node:test');
const assert = require('node:assert/strict');

const { createSerializedTaskQueue } = require('../src/async-queue');

export { };

test('createSerializedTaskQueue serializes different operations and preserves result types', async () => {
  const events: string[] = [];
  const enqueue = createSerializedTaskQueue();

  const first = enqueue(async () => {
    events.push('open:start');
    await new Promise((resolve) => setTimeout(resolve, 10));
    events.push('open:end');
    return 42;
  });
  const second = enqueue(async () => {
    events.push('clear');
    return 'cleared';
  });

  assert.deepEqual(await Promise.all([first, second]), [42, 'cleared']);
  assert.deepEqual(events, ['open:start', 'open:end', 'clear']);
});

test('createSerializedTaskQueue continues after a rejected task', async () => {
  const enqueue = createSerializedTaskQueue();

  await assert.rejects(
    enqueue(async () => {
      throw new Error('failed task');
    }),
    /failed task/,
  );
  assert.equal(await enqueue(async () => 'completed'), 'completed');
});
