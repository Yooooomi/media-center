export type Constructor<T> = new (...args: any[]) => T;
export type Instance<T extends Constructor<any>> = T extends Constructor<
  infer K
>
  ? K
  : never;
export type Awaited<T> = T extends Promise<infer K> ? K : never;
