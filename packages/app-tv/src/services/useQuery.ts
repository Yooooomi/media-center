import {useCallback, useEffect, useRef, useState} from 'react';
import {Beta} from './api';
import {
  BaseIntent,
  Constructor,
  IntentNeeding,
  IntentReturning,
} from '@media-center/domain-driven';

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
  const [fetching, setFetching] = useState(false);
  const [result, setResult] = useState<{
    result: R | undefined;
    error: any | undefined;
  }>({result: undefined, error: undefined});
  const unsubscribe = useRef<(() => void) | undefined>(undefined);
  const previousDependsOn =
    options && Object.hasOwn(options, 'dependsOn')
      ? // eslint-disable-next-line react-hooks/rules-of-hooks
        useRef(options.dependsOn)
      : undefined;

  const shouldTrigger = previousDependsOn
    ? previousDependsOn.current === undefined &&
      options?.dependsOn !== undefined
    : true;

  const f = useCallback(async () => {
    setFetching(true);
    try {
      if (options?.reactive) {
        if (unsubscribe.current) {
          unsubscribe.current();
        }
        unsubscribe.current = Beta.reactiveQuery(
          new queryConstructor(parameters),
          (newResults: any) => {
            setResult({
              result: options?.alterResult
                ? options.alterResult(newResults)
                : newResults,
              error: undefined,
            });
          },
        );
      } else {
        const newResults: any = await Beta.query(
          new queryConstructor(parameters),
        );
        setResult({
          result: options?.alterResult
            ? options.alterResult(newResults)
            : newResults,
          error: undefined,
        });
      }
    } catch (e) {
      console.log('Failed to fetch', e);
      setResult({result: undefined, error: e});
    }
    setFetching(false);
  }, [options, parameters, queryConstructor]);
  const fref = useRef(f);
  fref.current = f;

  useEffect(() => () => unsubscribe.current?.(), []);

  useEffect(() => {
    if (shouldTrigger) {
      fref.current().catch(console.error);
    }
  }, [shouldTrigger]);

  if (previousDependsOn) {
    previousDependsOn.current = options?.dependsOn;
  }

  return [result, fetching, f] as const;
}
