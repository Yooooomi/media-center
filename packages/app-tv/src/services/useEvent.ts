import {BaseEvent} from '@media-center/domain-driven';
import {useEffect} from 'react';
import {Beta} from './api';
import {SerializableConstructor} from '@media-center/domain-driven/lib/serialization/types';

export function useEvent<T extends BaseEvent<any>>(
  event: SerializableConstructor<T>,
  handle: (event: T) => void,
) {
  useEffect(() => Beta.onEvent(event, handle), [event, handle]);
}
