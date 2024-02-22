export function combineFunction<T>(...fns: ((...args: T[]) => void)[]) {
  return function (...args: T[]) {
    fns.forEach((fn) => fn(...args));
  };
}
