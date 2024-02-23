import { Movie } from "@media-center/domains/src/tmdb/domain/movie";
import { TorrentRequest } from "@media-center/domains/src/torrentRequest/domain/torrentRequest";
import { Show } from "@media-center/domains/src/tmdb/domain/show";
import { useCallback } from "react";
import { StyleSheet } from "react-native";
import { MovieCard } from "../cards/movieCard/movieCard";
import {
  SectionLine,
  ExtraSectionLineProps,
} from "../../ui/display/sectionLine/sectionLine";
import { ShowCard } from "../cards/showCard";
import { Box } from "../../ui/display/box";
import { Text } from "../../ui/input/text";
import { card } from "../../../services/cards";

interface DownloadingCardLine extends ExtraSectionLineProps {
  autoFocusFirst?: boolean;
  entries: { tmdb: Movie | Show | undefined; request: TorrentRequest }[];
  title: string;
}

export function DownloadingCardLine({
  entries,
  title,
  autoFocusFirst,
  ...other
}: DownloadingCardLine) {
  const getCard = useCallback(
    (
      tmdb: Movie | Show | undefined,
      request: TorrentRequest,
      index: number,
    ) => {
      if (tmdb instanceof Movie) {
        return (
          <MovieCard
            focusOnMount={index === 0 && autoFocusFirst}
            progress={request.getClampedDownloaded()}
            disabled
            movie={tmdb}
          />
        );
      }
      if (tmdb instanceof Show) {
        return (
          <ShowCard
            focusOnMount={index === 0 && autoFocusFirst}
            progress={request.getClampedDownloaded()}
            disabled
            show={tmdb}
          />
        );
      }
      return null;
    },
    [autoFocusFirst],
  );

  return (
    <SectionLine
      {...other}
      title={title}
      data={entries}
      keyExtractor={(entry) => entry.request.id.toString()}
      renderItem={(item, index) => (
        <Box>
          {getCard(item.tmdb, item.request, index)}
          <Box
            h={card.height}
            style={StyleSheet.absoluteFillObject}
            items="center"
            content="center"
          >
            <Text>{item.request.getPercentage()}%</Text>
            <Text size="small">{item.request.getSpeed()}</Text>
          </Box>
        </Box>
      )}
    />
  );
}
