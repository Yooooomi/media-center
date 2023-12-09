import {
  MovieCatalogEntryFulfilled,
  ShowCatalogEntryFulfilled,
} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';
import {usePlayCatalogEntry} from '../../services/usePlayCatalogEntry';
import {BigPressable} from '../bigPressable';
import {TorrentRequest} from '@media-center/server/src/domains/torrentRequest/domain/torrentRequest';
import {ReactNode} from 'react';
import Text from '../text';

interface WatchCatalogEntryProps {
  entry: MovieCatalogEntryFulfilled | ShowCatalogEntryFulfilled;
  requests: TorrentRequest[];
}

export function WatchCatalogEntry({entry, requests}: WatchCatalogEntryProps) {
  const {actionSheet, play} = usePlayCatalogEntry(entry);

  const firstRequest = requests?.[0];
  const hasDownloadedItems = entry.items.length > 0;

  let children: ReactNode | undefined;
  if (!hasDownloadedItems && firstRequest) {
    children = <Text size="big">{firstRequest.getPercentage()}%</Text>;
  }

  return (
    <>
      <BigPressable focusOnMount bg="ctaGreen" icon="play" onPress={play}>
        {children}
      </BigPressable>
      {actionSheet}
    </>
  );
}
