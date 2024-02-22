import { useCallback } from "react";
import { Playlist, useNavigate } from "../../screens/params";

export function usePlayCatalogEntry(
  contextName: string,
  playlist: Playlist<any>,
  itemIndex: number,
) {
  const { navigate } = useNavigate();

  const play = useCallback(() => {
    return navigate("Watch", {
      playlist,
      startingPlaylistIndex: itemIndex,
    });
  }, [itemIndex, navigate, playlist]);

  return { play };
}
