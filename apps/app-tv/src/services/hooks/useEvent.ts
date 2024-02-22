import {BaseEvent} from '@media-center/domain-driven';
import {useEffect} from 'react';
import {SerializableConstructor} from '@media-center/domain-driven/lib/serialization/types';
import {Beta} from '../api';

export function useEvent<T extends BaseEvent<any>>(
  event: SerializableConstructor<T>,
  handle: (event: T) => void,
) {
  useEffect(() => Beta.onEvent(event, handle), [event, handle]);
}
