import { Endpoint } from ".";
import { GetEntryQuery } from "../domains/catalog/applicative/getEntry.query";
import { DiscoverMovieQuery } from "../domains/tmdb/applicative/discoverMovie.query";
import { DiscoverShowQuery } from "../domains/tmdb/applicative/discoverShow.query";
import { TmdbId } from "../domains/tmdb/domain/tmdbId";
import { SearchTorrentsQuery } from "../domains/torrentIndexer/applicative/searchTorrents.query";
import { TorrentIndexerResultId } from "../domains/torrentIndexer/domain/torrentIndexerResultId";
import { AddTorrentRequestCommand } from "../domains/torrentRequest/applicative/addTorrentRequest.command";
import { GetTorrentRequestsQuery } from "../domains/torrentRequest/applicative/getTorrentRequests.query";

export const discoverMovie = Endpoint.query(DiscoverMovieQuery, () => []);

export const discoverShow = Endpoint.query(DiscoverShowQuery, () => []);

export const searchTorrentsForTmdb = Endpoint.query(
  SearchTorrentsQuery,
  (data: { tmdbId: string }) => [TmdbId.from(data.tmdbId)]
);

export const addTorrentRequest = Endpoint.command(
  AddTorrentRequestCommand,
  (data: { torrentId: string; tmdbId: string; name: string }) => [
    TmdbId.from(data.tmdbId),
    TorrentIndexerResultId.from(data.torrentId),
  ]
);

export const getTorrentRequests = Endpoint.query(
  GetTorrentRequestsQuery,
  (data: { tmdbId: string }) => [TmdbId.from(data.tmdbId)]
);

export const getEntry = Endpoint.query(
  GetEntryQuery,
  (data: { tmdbId: string }) => [TmdbId.from(data.tmdbId)]
);
