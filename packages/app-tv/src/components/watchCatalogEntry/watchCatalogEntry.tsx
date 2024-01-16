import {MovieCatalogEntryFulfilled} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';
import {usePlayCatalogEntry} from '../../services/usePlayCatalogEntry';
import {BigPressable} from '../bigPressable';
import {TorrentRequest} from '@media-center/server/src/domains/torrentRequest/domain/torrentRequest';
import {ReactNode, useMemo} from 'react';
import {Text} from '../text';
import {UserTmdbMovieInfo} from '@media-center/server/src/domains/userTmdbInfo/domain/userTmdbInfo';
import {Playlist} from '../../screens/params';

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
  const playlist: Playlist<'movie'> = useMemo(
    () => ({
      tmdbId: entry.id,
      items: [{dataset: entry.dataset, progress: userInfo.progress}],
    }),
    [entry.dataset, entry.id, userInfo.progress],
  );
  const {play} = usePlayCatalogEntry(name, playlist, 0);

  const firstRequest = requests?.[0];
  const hasHierarchyItems = entry.hasHierarchyItems();

  let children: ReactNode | undefined;
  if (!hasHierarchyItems && firstRequest) {
    children = <Text size="big">{firstRequest.getPercentage()}%</Text>;
  }

  return (
    <BigPressable
      text="Lire"
      focusOnMount
      bg="ctaGreen"
      icon={userInfo.progress > 0 ? 'step-forward' : 'play'}
      onPress={play}>
      {children}
    </BigPressable>
  );
}
