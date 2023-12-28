import { QueryBus } from "@media-center/domain-driven";
import { EnvironmentHelper } from "../environment/applicative/environmentHelper";
import { DiscoverMovieQueryHandler } from "./applicative/discoverMovie.query";
import { DiscoverShowQueryHandler } from "./applicative/discoverShow.query";
import { GetEpisodesQueryHandler } from "./applicative/getEpisodes.query";
import { GetMovieDetailsQueryHandler } from "./applicative/getMovieDetails.query";
import { GetSeasonsQueryHandler } from "./applicative/getSeasons.query";
import { GetTmdbsQueryHandler } from "./applicative/getTmdbs.query";
import { SearchQueryHandler } from "./applicative/search.query";
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
  queryBus.register(new DiscoverMovieQueryHandler(tmdbApi));
  queryBus.register(new DiscoverShowQueryHandler(tmdbApi));
  queryBus.register(new GetTmdbsQueryHandler(tmdbStore));
  queryBus.register(new GetSeasonsQueryHandler(tmdbApi));
  queryBus.register(new GetEpisodesQueryHandler(tmdbApi));
  queryBus.register(new SearchQueryHandler(tmdbApi));
  queryBus.register(new GetMovieDetailsQueryHandler(tmdbApi));

  return { tmdbApi, tmdbStore };
}
