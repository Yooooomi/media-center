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
