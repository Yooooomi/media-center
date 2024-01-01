export function noop() {}

export function compact<T>(array: T[]): NonNullable<T>[] {
  return array.filter(Boolean) as NonNullable<T>[];
}

export function keyBy<T>(values: T[], getKey: (value: T) => string) {
  return values.reduce<Record<string, T>>((acc, curr) => {
    acc[getKey(curr)] = curr;
    return acc;
  }, {});
}

export function chunk<T>(values: T[], chunkSize: number) {
  const results: T[][] = [];

  const iteration = Math.floor(values.length / chunkSize);
  for (let i = 0; i < iteration; i += 1) {
    results.push(values.slice(i * chunkSize, (i + 1) * chunkSize));
  }
  const last = values.slice(iteration * chunkSize);
  if (last.length > 0) {
    results.push(last);
  }
  return results;
}

export function uniqBy<T>(value: T[], by: (item: T) => string) {
  const results: T[] = [];
  const already = new Set<string>();

  for (const v of value) {
    const id = by(v);
    if (already.has(id)) {
      continue;
    }
    already.add(id);
    results.push(v);
  }
  return results;
}

export function debounce<F extends (...args: any[]) => void>(
  fn: F,
  ms: number
) {
  let timeoutId: NodeJS.Timeout | undefined;

  return function (...args: any[]) {
    // If there's a pending timeout, clear it to ensure only the latest call is delayed.
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Schedule a new timeout to invoke the function after the specified delay.
    timeoutId = setTimeout(() => {
      fn(...args);
    }, ms);
  };
}

export function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
