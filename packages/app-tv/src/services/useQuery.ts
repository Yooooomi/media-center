import {useCallback, useEffect, useRef, useState} from 'react';
import {Beta} from './api';
import {
  BaseIntent,
  Constructor,
  IntentNeeding,
  IntentReturning,
} from '@media-center/domain-driven';
import {unstable_batchedUpdates} from 'react-native';

interface State<R> {
  result: R | undefined;
  error: Error | undefined;
}

export function useQuery<
  T extends BaseIntent<any, any>,
  R = IntentReturning<T>,
>(
  queryConstructor: Constructor<T>,
  parameters: IntentNeeding<T>,
  options?: {
    alterResult?: (result: IntentReturning<T>) => R;
    dependsOn?: any | undefined;
    reactive?: boolean;
  },
) {
  const previousDependsOn =
    options && Object.hasOwn(options, 'dependsOn')
      ? // eslint-disable-next-line react-hooks/rules-of-hooks
        useRef(options.dependsOn)
      : undefined;
  const shouldTrigger = previousDependsOn
    ? previousDependsOn.current === undefined &&
      options?.dependsOn !== undefined
    : true;

  const [fetching, setFetching] = useState(shouldTrigger);
  const [result, setResult] = useState<State<R>>({
    result: undefined,
    error: undefined,
  });
  const unsubscribe = useRef<(() => void) | undefined>(undefined);

  const setNewResults = useCallback((newResults: State<R>) => {
    unstable_batchedUpdates(() => {
      setResult(newResults);
      setFetching(false);
    });
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
              result: options?.alterResult
                ? options.alterResult(newResults)
                : newResults,
              error: undefined,
            }),
        );
      } else {
        const newResults: any = await Beta.query(
          new queryConstructor(parameters),
        );
        setNewResults({
          result: options?.alterResult
            ? options.alterResult(newResults)
            : newResults,
          error: undefined,
        });
      }
    } catch (e) {
      setNewResults({result: undefined, error: e as Error});
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
