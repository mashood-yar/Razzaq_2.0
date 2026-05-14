/** Reject if `promiseLike` doesn’t settle within `ms` (prevents indefinite hangs). */
export function withTimeout<T>(
  promiseLike: PromiseLike<T>,
  ms: number,
  operation: string,
): Promise<T> {
  const promise = Promise.resolve(promiseLike);
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      reject(new Error(`${operation} timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (err) => {
        clearTimeout(id);
        reject(err instanceof Error ? err : new Error(String(err)));
      },
    );
  });
}
