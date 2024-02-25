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

export function maxBy<T>(values: T[], getValue: (value: T) => number) {
  let maxIndex: number | undefined = 0;
  let maxValue: number | undefined = undefined;

  for (let i = 0; i < values.length; i += 1) {
    const item = values[i]!;
    const value = getValue(item);
    if (maxValue === undefined || value > maxValue) {
      maxIndex = i;
      maxValue = value;
    }
  }
  return maxIndex === undefined ? undefined : values[maxIndex];
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
  ms: number,
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

export function debounceOverflow<F extends (...args: any[]) => void>(
  fn: F,
  ms: number,
  overflowAt: number,
) {
  let timeoutId: NodeJS.Timeout | undefined;
  let currentQueueSize = 0;

  return function (...args: any[]) {
    // If there's a pending timeout, clear it to ensure only the latest call is delayed.
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    currentQueueSize += 1;

    if (currentQueueSize === overflowAt) {
      currentQueueSize = 0;
      fn(...args);
    } else {
      // Schedule a new timeout to invoke the function after the specified delay.
      timeoutId = setTimeout(() => {
        currentQueueSize = 0;
        fn(...args);
      }, ms);
    }
  };
}

export function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export function fromPairs<K extends string | number, V>(
  arrayOfTuple: [K, V][],
) {
  return arrayOfTuple.reduce(
    (acc, curr) => {
      acc[curr[0]] = curr[1];
      return acc;
    },
    {} as Record<K, V>,
  );
}

export function mapNumber<R>(count: number, handle: (index: number) => R) {
  const results: R[] = [];
  for (let i = 0; i < count; i += 1) {
    results.push(handle(i));
  }
  return results;
}

export async function PromiseAllByChunk<T, R>(
  list: T[],
  handler: (data: T) => Promise<R>,
  chunkSize: number,
) {
  return new Promise<{ result: R | undefined; error: any }[]>((res) => {
    const notFullfilled = list.map((_, index) => index);
    let running = 0;
    const results: { result: R | undefined; error: any }[] = [];

    function launch() {
      const index = notFullfilled.shift();
      if (running === 0 && notFullfilled.length === 0) {
        res(results);
      }
      if (index === undefined) {
        return;
      }
      running += 1;
      handler(list[index]!)
        .then((result: R) => {
          results[index] = { result, error: undefined };
        })
        .catch((error) => {
          results[index] = { result: undefined, error };
        })
        .finally(() => {
          running -= 1;
          launch();
        });
    }

    for (let i = 0; i < chunkSize; i += 1) {
      launch();
    }
  });
}
