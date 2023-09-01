import { QueryBus } from "../../framework/queryBus/queryBus";
import { EnvironmentHelper } from "../environment/applicative/environmentHelper";
import {
  DiscoverMovieQuery,
  DiscoverMovieQueryHandler,
} from "./applicative/discoverMovie.query";
import {
  DiscoverShowQuery,
  DiscoverShowQueryHandler,
} from "./applicative/discoverShow.query";
import { InMemoryTmdbStore } from "./infrastructure/inMemory.tmdb.store";
import { MockTmdbAPI } from "./infrastructure/mock.tmdb.api";
import { RealTmdbAPI } from "./infrastructure/real.tmdb.api";

export function bootTmdb(
  queryBus: QueryBus,
  environmentHelper: EnvironmentHelper
) {
  const tmdbApi = environmentHelper.match("DI_TMDB_API", {
    mock: () => new MockTmdbAPI(),
    real: () => new RealTmdbAPI(),
  });

  const tmdbStore = new InMemoryTmdbStore(tmdbApi);
  queryBus.register(DiscoverMovieQuery, new DiscoverMovieQueryHandler(tmdbApi));
  queryBus.register(DiscoverShowQuery, new DiscoverShowQueryHandler(tmdbApi));

  return { tmdbApi, tmdbStore };
}
