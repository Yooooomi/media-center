import { QueryBus } from "@media-center/domain-driven";
import { EnvironmentHelper } from "../environment/applicative/environmentHelper";
import {
  DiscoverMovieQuery,
  DiscoverMovieQueryHandler,
} from "./applicative/discoverMovie.query";
import {
  DiscoverShowQuery,
  DiscoverShowQueryHandler,
} from "./applicative/discoverShow.query";
import {
  GetEpisodesQuery,
  GetEpisodesQueryHandler,
} from "./applicative/getEpisodes.query";
import {
  GetMovieDetailsQuery,
  GetMovieDetailsQueryHandler,
} from "./applicative/getMovieDetails.query";
import {
  GetSeasonsQuery,
  GetSeasonsQueryHandler,
} from "./applicative/getSeasons.query";
import {
  GetTmdbsQuery,
  GetTmdbsQueryHandler,
} from "./applicative/getTmdbs.query";
import { SearchQuery, SearchQueryHandler } from "./applicative/search.query";
import { FilesystemTmdbStore } from "./infrastructure/filesystem.tmdb.store";
import { InMemoryTmdbStore } from "./infrastructure/inMemory.tmdb.store";
import { MockTmdbAPI } from "./infrastructure/mock.tmdb.api";
import { RealTmdbAPI } from "./infrastructure/real.tmdb.api";

export function bootTmdb(
  queryBus: QueryBus,
  environmentHelper: EnvironmentHelper
) {
  const tmdbApi = environmentHelper.match("DI_TMDB_API", {
    mock: () => new MockTmdbAPI(),
    real: () => new RealTmdbAPI(environmentHelper),
  });

  const tmdbStore = environmentHelper.match("DI_DATABASE", {
    memory: () => new InMemoryTmdbStore(tmdbApi),
    filesystem: () => new FilesystemTmdbStore(tmdbApi),
  });
  queryBus.register(DiscoverMovieQuery, new DiscoverMovieQueryHandler(tmdbApi));
  queryBus.register(DiscoverShowQuery, new DiscoverShowQueryHandler(tmdbApi));
  queryBus.register(GetTmdbsQuery, new GetTmdbsQueryHandler(tmdbStore));
  queryBus.register(GetSeasonsQuery, new GetSeasonsQueryHandler(tmdbApi));
  queryBus.register(GetEpisodesQuery, new GetEpisodesQueryHandler(tmdbApi));
  queryBus.register(SearchQuery, new SearchQueryHandler(tmdbApi));
  queryBus.register(
    GetMovieDetailsQuery,
    new GetMovieDetailsQueryHandler(tmdbApi)
  );

  return { tmdbApi, tmdbStore };
}
