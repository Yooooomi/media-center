import {MovieCatalogEntryFulfilled} from '@media-center/domains/src/catalog/applicative/catalogEntryFulfilled.front';
import {TorrentRequest} from '@media-center/domains/src/torrentRequest/domain/torrentRequest';
import {ReactNode, useMemo} from 'react';
import {UserTmdbMovieInfo} from '@media-center/domains/src/userTmdbInfo/domain/userTmdbInfo';
import {usePlayCatalogEntry} from '../../../services/hooks/usePlayCatalogEntry';
import {BigPressable} from '../../ui/input/bigPressable';
import {Text} from '../../ui/input/text';
import {Playlist} from '../../../screens/params';

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
      items: [{name, dataset: entry.dataset, progress: userInfo.progress}],
    }),
    [entry.dataset, entry.id, name, userInfo.progress],
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
