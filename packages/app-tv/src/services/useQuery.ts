import {useCallback, useEffect, useRef, useState} from 'react';
import {Beta} from './api';
import {
  BaseIntention,
  Constructor,
  IntentionNeed,
  IntentionReturn,
} from '@media-center/domain-driven';

export function useQuery<
  T extends BaseIntention<any, any>,
  R = IntentionReturn<T>,
>(
  queryConstructor: Constructor<T>,
  parameters: IntentionNeed<T>,
  options?: {
    alterResult?: (result: IntentionReturn<T>) => R;
    dependsOn?: any | undefined;
  },
) {
  const [fetching, setFetching] = useState(false);
  const [result, setResult] = useState<{
    result: R | undefined;
    error: any | undefined;
  }>({result: undefined, error: undefined});
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
      const newResults: any = await Beta.query(
        new queryConstructor(parameters),
      );
      setResult({
        result: options?.alterResult
          ? options.alterResult(newResults)
          : newResults,
        error: undefined,
      });
    } catch (e) {
      console.log('Failed to fetch', e);
      setResult({result: undefined, error: e});
    }
    setFetching(false);
  }, [options, parameters, queryConstructor]);
  const fref = useRef(f);
  fref.current = f;

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
