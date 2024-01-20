import {useCallback, useRef, useState} from 'react';

export function useAdditiveThrottle<T>(
  defaultValue: T,
  timeout: number,
  onThrottled: (value: T) => void,
  dontResetValue?: boolean,
) {
  const timeoutRef = useRef<number | undefined>(undefined);
  const [value, setValue] = useState<T>(defaultValue);
  const valueRef = useRef(value);
  valueRef.current = value;

  const end = useCallback(() => {
    timeoutRef.current = undefined;
    onThrottled(valueRef.current);
    if (!dontResetValue) {
      setValue(defaultValue);
    }
  }, [defaultValue, dontResetValue, onThrottled]);

  const add = useCallback(
    (fn: (oldValue: T) => T) => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(end, timeout);
      setValue(old => fn(old));
    },
    [end, timeout],
  );

  return {value, add, active: timeoutRef.current !== undefined};
}
