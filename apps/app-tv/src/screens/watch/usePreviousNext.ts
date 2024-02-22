import {useCallback} from 'react';
import {Playlist, useNavigate} from '../params';

export function usePreviousNext(
  playlist: Playlist<any>,
  startingIndex: number,
) {
  const {navigate} = useNavigate();

  const previousAllowed = startingIndex > 0;
  const nextAllowed = startingIndex < playlist.items.length - 1;

  const previous = useCallback(() => {
    if (!previousAllowed) {
      return;
    }
    return navigate('Watch', {
      playlist,
      startingPlaylistIndex: startingIndex - 1,
    });
  }, [navigate, playlist, previousAllowed, startingIndex]);

  const next = useCallback(() => {
    if (!nextAllowed) {
      return;
    }
    return navigate('Watch', {
      playlist,
      startingPlaylistIndex: startingIndex + 1,
    });
  }, [navigate, nextAllowed, playlist, startingIndex]);

  return {previousAllowed, previous, nextAllowed, next};
}
