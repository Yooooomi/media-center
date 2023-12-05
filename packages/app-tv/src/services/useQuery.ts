import {
  InternalQuery,
  QueryReturnType,
} from '@media-center/server/src/framework/query';
import {Constructor} from '@media-center/server/src/types/utils';
import {useCallback, useEffect, useRef, useState} from 'react';
import {Beta} from './api';

type OneParameter<T> = T extends [infer First, ...any] ? First : void;
type ResultAndError<R> = {result: R | undefined; error: any | undefined};

export function useQuery<
  T extends Constructor<InternalQuery<void, any>>,
  R = QueryReturnType<InstanceType<T>>,
>(
  queryConstructor: T,
  parameters?: void,
  options?: {
    alterResult?: (result: QueryReturnType<InstanceType<T>>) => R;
    dependsOn?: any | undefined;
  },
): [ResultAndError<R>, boolean, () => Promise<void>];
export function useQuery<
  T extends Constructor<InternalQuery<any, any>>,
  R = QueryReturnType<InstanceType<T>>,
>(
  queryConstructor: T,
  parameters: OneParameter<ConstructorParameters<T>>,
  options?: {
    alterResult?: (result: QueryReturnType<InstanceType<T>>) => R;
    dependsOn?: any | undefined;
  },
): [ResultAndError<R>, boolean, () => Promise<void>];
export function useQuery<
  T extends Constructor<InternalQuery<any, any>>,
  R = QueryReturnType<InstanceType<T>>,
>(
  queryConstructor: T,
  parameters?: OneParameter<ConstructorParameters<T>>,
  options?: {
    alterResult?: (result: QueryReturnType<InstanceType<T>>) => R;
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
      console.log('Failed to fetch');
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
