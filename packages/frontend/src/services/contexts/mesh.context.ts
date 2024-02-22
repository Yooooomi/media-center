import React, {
  Context,
  ContextType,
  useContext,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
} from "react";

type RenderFunction = () => void;
type SelectorFunction<S = any, R = any> = (state: S) => R;
type EqualityFunction<R = any> = (a: R, b: R) => boolean;
type State = object;

const REGISTER_SYMBOL = Symbol("register");
const UNREGISTER_SYMBOL = Symbol("unregister");
const REGISTER_SELECTOR_SYMBOL = Symbol("register_selector");
const UNREGISTER_SELECTOR_SYMBOL = Symbol("unregister_selector");

const DEFAULT_EQUALITY_FUNCTION = (a: any, b: any) => a === b;

function useRender(): RenderFunction {
  return useReducer(() => ({}), {})[1] as () => void;
}

export function createMeshContext<S extends State>() {
  return React.createContext<S>({} as S) as MeshContext<S>;
}

type MeshContext<S extends State> = Context<
  S & {
    [REGISTER_SYMBOL]: (key: string, render: RenderFunction) => void;
    [UNREGISTER_SYMBOL]: (render: RenderFunction) => void;
    [REGISTER_SELECTOR_SYMBOL]: (
      oldSelector: SelectorFunction<S>,
      newSelector: SelectorFunction<S>,
      render: RenderFunction,
      isEqual?: EqualityFunction,
    ) => void;
    [UNREGISTER_SELECTOR_SYMBOL]: (selector: SelectorFunction<S>) => void;
  }
>;

const UNIQUE_REF = {};
export function useMeshContextSetup<S extends State>(value: S) {
  const valueListeners = useRef<Record<string, Set<RenderFunction>>>({});
  const selectors = useRef<
    Map<
      SelectorFunction<S>,
      {
        oldValue: any;
        render: RenderFunction;
        equalityFunction: EqualityFunction | undefined;
      }
    >
  >(new Map());

  const lightContextValue = useRef<ContextType<MeshContext<S>>>({
    ...value,
    [REGISTER_SELECTOR_SYMBOL]: (
      oldSelector: SelectorFunction<S>,
      newSelector: SelectorFunction<S>,
      render: RenderFunction,
      isEqual?: EqualityFunction,
    ) => {
      const stored = selectors.current.get(oldSelector);
      selectors.current.delete(oldSelector);
      selectors.current.set(
        newSelector,
        stored ?? { oldValue: UNIQUE_REF, render, equalityFunction: isEqual },
      );
    },
    [UNREGISTER_SELECTOR_SYMBOL]: (selector: SelectorFunction<S>) => {
      selectors.current.delete(selector);
    },
    [REGISTER_SYMBOL]: (key: string, render: RenderFunction) => {
      const l = valueListeners.current[key] ?? new Set();
      l.add(render);
      valueListeners.current[key] = l;
    },
    [UNREGISTER_SYMBOL]: (render: RenderFunction) => {
      Object.values(valueListeners.current).forEach((l) => {
        l.delete(render);
      });
    },
  });

  const firstRender = useRef(true);
  useLayoutEffect(() => {
    Object.entries(value).forEach(([key, v]) => {
      if (lightContextValue.current[key as keyof S] !== v) {
        lightContextValue.current[key as keyof S] = v;
        const keyListeners = valueListeners.current[key];
        if (!keyListeners) {
          return;
        }
        keyListeners.forEach((e) => e());
      }
    });
    selectors.current.forEach((selectorState, selector) => {
      const { oldValue, render } = selectorState;
      const equalityFunction =
        selectorState.equalityFunction ?? DEFAULT_EQUALITY_FUNCTION;
      const newValue = selector(value);
      if (!equalityFunction(oldValue, newValue)) {
        if (!firstRender.current) {
          render();
        }
        selectorState.oldValue = newValue;
      }
    });
    firstRender.current = false;
  }, [value]);

  return lightContextValue.current;
}

function useMeshContextValue<S extends State>(
  context: ContextType<MeshContext<S>>,
  render: RenderFunction,
) {
  useEffect(
    () => () => {
      context[UNREGISTER_SYMBOL](render);
    },
    [context, render],
  );

  const proxy = useRef(
    new Proxy(context as ContextType<MeshContext<S>>, {
      get(target, p) {
        target[REGISTER_SYMBOL](p as string, render);
        return target[p as keyof S];
      },
    }),
  );

  return proxy.current;
}

function useMeshContextSelector<S extends State, R>(
  context: ContextType<MeshContext<S>>,
  selector: (state: S) => R,
  render: RenderFunction,
  isEqual?: EqualityFunction<R>,
) {
  const selectorRef = useRef(selector);

  useEffect(() => {
    context[REGISTER_SELECTOR_SYMBOL](
      selectorRef.current,
      selector,
      render,
      isEqual,
    );
    selectorRef.current = selector;
  }, [context, isEqual, render, selector]);

  useEffect(
    () => () => {
      context[UNREGISTER_SELECTOR_SYMBOL](selectorRef.current);
    },
    [context],
  );

  return selector(context);
}

export function useMeshContext<S extends State>(context: MeshContext<S>): S;
export function useMeshContext<S extends State, R>(
  context: MeshContext<S>,
  selector: SelectorFunction<S, R>,
  isEqual?: EqualityFunction<R>,
): R;
export function useMeshContext<S extends State, R>(
  context: MeshContext<S>,
  selector?: SelectorFunction<S, R>,
  isEqual?: EqualityFunction<R>,
) {
  const ctx = useContext(context);
  const render = useRender();

  if (selector) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMeshContextSelector(ctx, selector, render, isEqual);
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMeshContextValue(ctx, render);
}
