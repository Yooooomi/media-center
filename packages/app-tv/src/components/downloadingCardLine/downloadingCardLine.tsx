import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import {MovieCard} from '../implementedUi/cards/movieCard/movieCard';
import SectionLine, {ExtraSectionLineProps} from '../sectionLine/sectionLine';
import {TorrentRequest} from '@media-center/server/src/domains/torrentRequest/domain/torrentRequest';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import {useCallback} from 'react';
import {ShowCard} from '../implementedUi/cards/showCard';
import Box from '../box';
import {StyleSheet} from 'react-native';
import Text from '../text';
import {card} from '../../services/constants';

interface DownloadingCardLine
  extends ExtraSectionLineProps<{
    tmdb: Movie | Show | undefined;
    request: TorrentRequest;
  }> {
  entries: {tmdb: Movie | Show | undefined; request: TorrentRequest}[];
  title: string;
}

export default function DownloadingCardLine({
  entries,
  title,
  ...other
}: DownloadingCardLine) {
  const getCard = useCallback(
    (tmdb: Movie | Show | undefined, request: TorrentRequest) => {
      if (tmdb instanceof Movie) {
        return (
          <MovieCard
            progress={request.getClampedDownloaded()}
            disabled
            movie={tmdb}
          />
        );
      }
      if (tmdb instanceof Show) {
        return (
          <ShowCard
            progress={request.getClampedDownloaded()}
            disabled
            show={tmdb}
          />
        );
      }
      return null;
    },
    [],
  );

  return (
    <SectionLine
      {...other}
      title={title}
      data={entries}
      keyExtractor={entry => entry.request.id.toString()}
      renderItem={item => (
        <Box>
          {getCard(item.tmdb, item.request)}
          <Box
            h={card.height}
            style={StyleSheet.absoluteFillObject}
            items="center"
            content="center">
            <Text>{item.request.getPercentage()}%</Text>
            <Text size="small">{item.request.getSpeed()}</Text>
          </Box>
        </Box>
      )}
    />
  );
}