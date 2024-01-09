import {SearchTorrentsQuery} from '@media-center/server/src/domains/torrentIndexer/applicative/searchTorrents.query';
import {useCallback, useState} from 'react';
import {TmdbId} from '@media-center/server/src/domains/tmdb/domain/tmdbId';
import {TorrentIndexerResult} from '@media-center/server/src/domains/torrentIndexer/domain/torrentIndexerResult';
import {AddTorrentRequestCommand} from '@media-center/server/src/domains/torrentRequest/applicative/addTorrentRequest.command';
import {TorrentsActionSheet} from '../components/torrentsActionSheet';
import {Beta} from './api';
import {useBooleanState} from './useBooleanState';
import {SearchQuery} from '@media-center/server/src/tools/searchQuery';

interface QueryTorrentsProps {
  names: string[];
  tmdbId: TmdbId;
}

export function useQueryTorrents({names, tmdbId}: QueryTorrentsProps) {
  const [loading, setLoading] = useState(false);
  const [torrents, setTorrents] = useState<TorrentIndexerResult[] | undefined>(
    undefined,
  );
  const [actionSheetOpen, openActionSheet, closeActionSheet] =
    useBooleanState();

  const queryTorrents = useCallback(async () => {
    setLoading(true);
    try {
      const d = await Beta.query(
        new SearchTorrentsQuery({queries: names.map(SearchQuery.from)}),
      );
      setTorrents(d);
      openActionSheet();
    } catch (e) {}
    setLoading(false);
  }, [names, openActionSheet]);

  const downloadTorrent = useCallback(
    async (torrent: TorrentIndexerResult) => {
      closeActionSheet();
      await Beta.command(
        new AddTorrentRequestCommand({
          torrentId: torrent.id,
          tmdbId,
        }),
      );
    },
    [closeActionSheet, tmdbId],
  );

  return {
    element: (
      <TorrentsActionSheet
        onClose={closeActionSheet}
        open={actionSheetOpen}
        torrents={torrents ?? []}
        onTorrentPress={downloadTorrent}
      />
    ),
    queryTorrents,
    loading,
  };
}
