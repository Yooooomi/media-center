import { CommandBus, Database, EventBus } from "@media-center/domain-driven";
import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";
import { TmdbStore } from "@media-center/domains/src/tmdb/applicative/tmdb.store";
import { SetUserTmdbInfoProgressCommandHandler } from "@media-center/domains/src/userTmdbInfo/applicative/setUserTmdbInfoProgress.command";
import { FilesystemUserTmdbInfoStore } from "./infrastructure/filesystem.userTmdbInfo.store";
import { InMemoryUserTmdbInfoStore } from "./infrastructure/inMemory.userTmdbInfo.store";
import { SQLiteUserTmdbInfoStore } from "./infrastructure/sqlite.userTmdbInfo.store";

export function bootUserTmdbInfo(
  database: Database,
  commandBus: CommandBus,
  eventBus: EventBus,
  environmentHelper: EnvironmentHelper,
  tmdbStore: TmdbStore,
) {
  const userTmdbInfoStore = environmentHelper.match("DI_DATABASE", {
    memory: () => new InMemoryUserTmdbInfoStore(database),
    filesystem: () =>
      new FilesystemUserTmdbInfoStore(environmentHelper, database),
    sqlite: () => new SQLiteUserTmdbInfoStore(database),
  });

  commandBus.register(
    new SetUserTmdbInfoProgressCommandHandler(
      eventBus,
      tmdbStore,
      userTmdbInfoStore,
    ),
  );

  return { userTmdbInfoStore };
}
