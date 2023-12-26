import {Signal} from '@preact/signals-core';
import {useState, useEffect} from 'react';

export function useSignal<T>(signal: Signal<T>) {
  const [v, setV] = useState(signal.peek());

  useEffect(() => signal.subscribe(setV), [signal]);

  return v;
}
