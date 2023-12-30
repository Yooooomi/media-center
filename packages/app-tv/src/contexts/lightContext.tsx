import React, {
  Context,
  useContext,
  useEffect,
  ContextType,
  useRef,
} from 'react';
import {useRender} from '../services/useRender';

export function CreateLightContext<T>() {
  return React.createContext<T>({} as T) as LightContext<T>;
}

type LightContext<T> = Context<
  T & {
    register: (key: string, fn: () => void) => void;
    unregister: (fn: () => void) => void;
  }
>;

export function useLightContextValue<T extends object>(value: T) {
  const listeners = useRef<Record<string, Set<() => void>>>({});

  const lightContextValue = useRef<ContextType<LightContext<T>>>({
    ...value,
    register: (key: string, fn: () => void) => {
      const l = listeners.current[key] ?? new Set();
      l.add(fn);
      listeners.current[key] = l;
    },
    unregister: (fn: () => void) =>
      Object.values(listeners.current).forEach(l => {
        l.delete(fn);
      }),
  });

  useEffect(
    () =>
      Object.entries(value).forEach(([key, v]) => {
        if (lightContextValue.current[key as keyof T] !== v) {
          lightContextValue.current[key as keyof T] = v;
          const keyListeners = listeners.current[key];
          if (!keyListeners) {
            return;
          }
          keyListeners.forEach(e => e());
        }
      }),
    [value],
  );
  return lightContextValue.current;
}

export function useLightContext<T extends object>(context: LightContext<T>) {
  const ctx = useContext(context);

  const render = useRender();

  useEffect(
    () => () => {
      ctx.unregister(render);
    },
    [ctx, render],
  );

  const proxy = useRef(
    new Proxy(ctx as ContextType<LightContext<T>>, {
      get(target, p) {
        target.register(p as string, render);
        return target[p as keyof T];
      },
    }),
  );

  return proxy.current;
}
