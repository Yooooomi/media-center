import {MovieCatalogEntryFulfilled} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';
import {usePlayCatalogEntry} from '../../services/usePlayCatalogEntry';
import {BigPressable} from '../bigPressable';
import {TorrentRequest} from '@media-center/server/src/domains/torrentRequest/domain/torrentRequest';
import {ReactNode} from 'react';
import {Text} from '../text';
import {UserTmdbMovieInfo} from '@media-center/server/src/domains/userTmdbInfo/domain/userTmdbInfo';

interface WatchCatalogEntryProps {
  name: string;
  entry: MovieCatalogEntryFulfilled;
  userInfo: UserTmdbMovieInfo;
  requests: TorrentRequest[];
}

export function WatchCatalogEntry({
  name,
  entry,
  requests,
  userInfo,
}: WatchCatalogEntryProps) {
  const {actionSheet, play} = usePlayCatalogEntry(name, entry, userInfo);

  const firstRequest = requests?.[0];
  const hasDownloadedItems = entry.items.length > 0;

  let children: ReactNode | undefined;
  if (!hasDownloadedItems && firstRequest) {
    children = <Text size="big">{firstRequest.getPercentage()}%</Text>;
  }

  return (
    <>
      <BigPressable
        text="Lire"
        focusOnMount
        bg="ctaGreen"
        icon={userInfo.progress > 0 ? 'step-forward' : 'play'}
        onPress={play}>
        {children}
      </BigPressable>
      {actionSheet}
    </>
  );
}
