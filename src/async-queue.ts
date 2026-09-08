export interface SerializedTaskQueue {
  <Result>(task: () => Promise<Result>): Promise<Result>;
}

export function createSerializedTaskQueue(): SerializedTaskQueue {
  let pending: Promise<void> = Promise.resolve();

  return <Result>(task: () => Promise<Result>): Promise<Result> => {
    const operation = pending.then(task);
    pending = operation.then(() => undefined, () => undefined);
    return operation;
  };
}
