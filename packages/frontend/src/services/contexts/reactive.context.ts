import { useRef } from "react";
import { useRender } from "../hooks/useRender";

type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

export class ReactiveShape<T> {
  instance: T;

  constructor(
    shape: T,
    private readonly render: () => void,
  ) {
    this.instance = shape;
  }

  static use<T>(instance: T) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const render = useRender();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRef(new ReactiveShape(instance, render)).current;
  }

  updateInstance(instance: T) {
    this.instance = instance;
    this.render();
  }

  call<F extends FunctionKeys<NonNullable<T>>>(
    fn: F,
    ...args: NonNullable<T>[F] extends (...args: any[]) => void
      ? Parameters<NonNullable<T>[F]>
      : never
  ) {
    (this.instance?.[fn] as any).bind(this.instance)(...args);
    this.render();
  }
}
