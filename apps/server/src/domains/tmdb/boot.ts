import { Database, QueryBus } from "@media-center/domain-driven";
import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";
import { GetEpisodesQueryHandler } from "@media-center/domains/src/tmdb/applicative/getEpisodes.query";
import { GetMovieDetailsQueryHandler } from "@media-center/domains/src/tmdb/applicative/getMovieDetails.query";
import { GetSeasonsQueryHandler } from "@media-center/domains/src/tmdb/applicative/getSeasons.query";
import { GetTmdbsQueryHandler } from "@media-center/domains/src/tmdb/applicative/getTmdbs.query";
import { SearchTmdbQueryHandler } from "@media-center/domains/src/tmdb/applicative/searchTmdb.query";
import { RealTmdbAPI } from "./infrastructure/real.tmdb.api";
import { MockTmdbAPI } from "./infrastructure/mock.tmdb.api";
import { InMemoryTmdbStore } from "./infrastructure/inMemory.tmdb.store";
import { FilesystemTmdbStore } from "./infrastructure/filesystem.tmdb.store";
import { SQLiteTmdbStore } from "./infrastructure/sqlite.tmdb.store";

export function bootTmdb(
  database: Database,
  queryBus: QueryBus,
  environmentHelper: EnvironmentHelper,
) {
  const tmdbApi = environmentHelper.match("DI_TMDB_API", {
    mock: () => new MockTmdbAPI(),
    real: () => new RealTmdbAPI(environmentHelper),
  });

  const tmdbStore = environmentHelper.match("DI_DATABASE", {
    memory: () => new InMemoryTmdbStore(database, tmdbApi),
    filesystem: () =>
      new FilesystemTmdbStore(environmentHelper, database, tmdbApi),
    sqlite: () => new SQLiteTmdbStore(database, tmdbApi),
  });
  queryBus.register(new GetTmdbsQueryHandler(tmdbStore));
  queryBus.register(new GetSeasonsQueryHandler(tmdbApi));
  queryBus.register(new GetEpisodesQueryHandler(tmdbApi));
  queryBus.register(new SearchTmdbQueryHandler(tmdbApi));
  queryBus.register(new GetMovieDetailsQueryHandler(tmdbApi));

  return { tmdbApi, tmdbStore };
}
