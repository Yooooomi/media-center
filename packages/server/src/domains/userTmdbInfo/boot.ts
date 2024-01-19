import {
  CommandBus,
  EventBus,
  InMemoryDatabase,
} from "@media-center/domain-driven";
import { SetUserTmdbInfoProgressCommandHandler } from "./applicative/setUserTmdbInfoProgress.command";
import { EnvironmentHelper } from "../environment/applicative/environmentHelper";
import { InMemoryUserTmdbInfoStore } from "./infrastructure/inMemory.userTmdbInfo.store";
import { FilesystemUserTmdbInfoStore } from "./infrastructure/filesystem.userTmdbInfo.store";
import { TmdbStore } from "../tmdb/applicative/tmdb.store";

export function bootUserTmdbInfo(
  database: InMemoryDatabase,
  commandBus: CommandBus,
  eventBus: EventBus,
  environmentHelper: EnvironmentHelper,
  tmdbStore: TmdbStore
) {
  const userTmdbInfoStore = environmentHelper.match("DI_DATABASE", {
    memory: () => new InMemoryUserTmdbInfoStore(database),
    filesystem: () =>
      new FilesystemUserTmdbInfoStore(environmentHelper, database),
  });

  commandBus.register(
    new SetUserTmdbInfoProgressCommandHandler(
      eventBus,
      tmdbStore,
      userTmdbInfoStore
    )
  );

  return { userTmdbInfoStore };
}
