import {useEffect} from 'react';
import {AppState, AppStateEvent} from 'react-native';

export function useAppStateEvent(event: AppStateEvent, onEvent: () => void) {
  useEffect(() => {
    const sub = AppState.addEventListener(event, onEvent);
    return sub.remove;
  }, []);
}
