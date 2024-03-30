import { ShowEpisode } from "@media-center/domains/src/tmdb/domain/showEpisode";
import { ShowCatalogEntryFulfilled } from "@media-center/domains/src/catalog/applicative/catalogEntryFulfilled.front";
import { UserTmdbShowInfo } from "@media-center/domains/src/userTmdbInfo/domain/userTmdbInfo";
import { StyleSheet } from "react-native";
import { useCallback } from "react";
import { LineList } from "../../ui/display/lineList";
import { ShowEpisodeCardWrapper } from "../cardWrappers/showEpisodeCardWrapper";
import { ShowEpisodeCard } from "../cards/showEpisodeCard";

interface ShowEpisodeCardsLineProps {
  showEpisodes: ShowEpisode[];
  season: number;
  userInfo: UserTmdbShowInfo;
  catalogEntry: ShowCatalogEntryFulfilled;
  onFocusEpisode?: (episode: ShowEpisode) => void;
  focusIndex?: number;
}

export function ShowEpisodeCardsLine({
  showEpisodes,
  catalogEntry,
  focusIndex,
  userInfo,
  season,
  onFocusEpisode,
}: ShowEpisodeCardsLineProps) {
  const renderItem = useCallback(
    (data: ShowEpisode, index: number) => {
      const hierarchyItemId = catalogEntry.getHierarchyItemForEpisode(
        season,
        data.episode_number,
      );

      return (
        <ShowEpisodeCardWrapper>
          <ShowEpisodeCard
            hierarchyItemId={hierarchyItemId?.id}
            userInfo={userInfo}
            focusOnMount={
              focusIndex !== undefined && index === focusIndex
                ? true
                : undefined
            }
            onFocus={onFocusEpisode}
            showEpisode={data}
          />
        </ShowEpisodeCardWrapper>
      );
    },
    [catalogEntry, focusIndex, onFocusEpisode, season, userInfo],
  );

  return (
    <LineList
      style={styles.root}
      data={showEpisodes}
      keyExtractor={(showEpisode) => showEpisode.episode_number.toString()}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    marginLeft: -8,
  },
});
