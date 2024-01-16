import {Playlist, useNavigate} from '../screens/params';
import {useCallback} from 'react';

export function usePlayCatalogEntry(
  contextName: string,
  playlist: Playlist<any>,
  itemIndex: number,
) {
  const {navigate} = useNavigate();

  const play = useCallback(() => {
    return navigate('Watch', {
      name: contextName,
      playlist,
      startingPlaylistIndex: itemIndex,
    });
  }, [contextName, itemIndex, navigate, playlist]);

  return {play};
}
