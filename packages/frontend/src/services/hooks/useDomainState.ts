import { Constructor } from "@media-center/domain-driven";
import { Dispatch, SetStateAction, useState as rUseState } from "react";

type useState<S> = (
  initialState: S | (() => S),
) => [S, Dispatch<SetStateAction<S>>];

export function useDomainState<T, S>(
  clss: Constructor<T>,
  ...args: Parameters<useState<S>>
): ReturnType<useState<S>> {
  // eslint-disable-next-line no-void
  void clss;
  return rUseState(...args);
}
