import { ShowEpisode } from "@media-center/domains/src/tmdb/domain/showEpisode";
import { noop } from "@media-center/algorithm";
import { UserTmdbShowInfo } from "@media-center/domains/src/userTmdbInfo/domain/userTmdbInfo";
import { useCallback } from "react";
import { HierarchyItemId } from "@media-center/domains/src/fileWatcher/domain/hierarchyItemId";
import { usePlayCatalogEntry } from "../../../../services/hooks/usePlayCatalogEntry";
import { InfoCard } from "../../../ui/display/infoCard/infoCard";
import { useImageUri } from "../../../../services/tmdb";

interface ShowEpisodeCardProps {
  showEpisode: ShowEpisode;
  userInfo: UserTmdbShowInfo;
  focusOnMount?: boolean;
  onFocus?: (episode: ShowEpisode) => void;
  hierarchyItemId: HierarchyItemId | undefined;
}

export function ShowEpisodeCard({
  showEpisode,
  focusOnMount,
  userInfo,
  hierarchyItemId,
  onFocus,
}: ShowEpisodeCardProps) {
  const imageUri = useImageUri(showEpisode.still_path);

  const { play } = usePlayCatalogEntry(hierarchyItemId);

  const handleFocus = useCallback(() => {
    onFocus?.(showEpisode);
  }, [onFocus, showEpisode]);

  const disabled = !hierarchyItemId;

  return (
    <InfoCard
      progress={userInfo.getEpisodeProgress(
        showEpisode.season_number,
        showEpisode.episode_number,
      )}
      focusOnMount={focusOnMount}
      pillText={`Episode ${showEpisode.episode_number}`}
      title={showEpisode.name}
      subtitle={`${showEpisode.runtime} minutes`}
      onPress={disabled ? noop : play}
      imageUri={imageUri}
      disabled={disabled}
      onFocus={handleFocus}
    />
  );
}
