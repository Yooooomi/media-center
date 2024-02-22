import { useCallback, useEffect, useRef, useState } from "react";
import {
  BaseIntent,
  Constructor,
  IntentNeeding,
  IntentReturning,
} from "@media-center/domain-driven";
import { Beta } from "./api";

interface State<R> {
  result: R | undefined;
  error: Error | undefined;
}

export function useQuery<T extends BaseIntent<any, any>>(
  queryConstructor: Constructor<T>,
  parameters: IntentNeeding<T>,
  options?: {
    dependsOn?: any | undefined;
    reactive?: boolean;
  },
) {
  const previousDependsOn =
    options && Object.hasOwn(options, "dependsOn")
      ? // eslint-disable-next-line react-hooks/rules-of-hooks
        useRef(options.dependsOn)
      : undefined;
  const shouldTrigger = previousDependsOn
    ? previousDependsOn.current === undefined &&
      options?.dependsOn !== undefined
    : true;

  const [fetching, setFetching] = useState(shouldTrigger);
  const [result, setResult] = useState<State<IntentReturning<T>>>({
    result: undefined,
    error: undefined,
  });
  const unsubscribe = useRef<(() => void) | undefined>(undefined);

  const setNewResults = useCallback((newResults: State<IntentReturning<T>>) => {
    setResult(newResults);
    setFetching(false);
  }, []);

  const fetch = useCallback(async () => {
    setFetching(true);
    try {
      if (options?.reactive) {
        if (unsubscribe.current) {
          unsubscribe.current();
        }
        unsubscribe.current = Beta.reactiveQuery(
          new queryConstructor(parameters),
          (newResults: any) =>
            setNewResults({
              result: newResults,
              error: undefined,
            }),
        );
      } else {
        const newResults: any = await Beta.query(
          new queryConstructor(parameters),
        );
        setNewResults({
          result: newResults,
          error: undefined,
        });
      }
    } catch (e) {
      setNewResults({ result: undefined, error: e as Error });
    }
  }, [options, parameters, queryConstructor, setNewResults]);

  useEffect(() => () => unsubscribe.current?.(), []);

  const fetchRef = useRef(fetch);
  fetchRef.current = fetch;
  useEffect(() => {
    if (shouldTrigger) {
      fetchRef.current().catch(console.warn);
    }
  }, [shouldTrigger]);

  if (previousDependsOn) {
    previousDependsOn.current = options?.dependsOn;
  }

  return [result, fetching, fetch] as const;
}
