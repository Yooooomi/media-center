export type AbstractConstructor<T> = abstract new (...args: any[]) => T;
export type Constructor<T> = new (...args: any[]) => T;

type DontExpand = Date | { serialize: (...args: any[]) => any };

export type Expand<T> = T extends DontExpand
  ? T
  : T extends Record<string, any>
  ? { [key in keyof T]: Expand<T[key]> }
  : T;
