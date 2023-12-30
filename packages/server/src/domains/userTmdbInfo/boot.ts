import { CommandBus, InMemoryDatabase } from "@media-center/domain-driven";
import { SetUserTmdbInfoProgressCommandHandler } from "./applicative/setUserTmdbInfoProgress.command";
import { EnvironmentHelper } from "../environment/applicative/environmentHelper";
import { InMemoryUserTmdbInfoStore } from "./infrastructure/inMemory.userTmdbInfo.store";
import { FilesystemUserTmdbInfoStore } from "./infrastructure/filesystem.userTmdbInfo.store";

export function bootUserTmdbInfo(
  database: InMemoryDatabase,
  commandBus: CommandBus,
  environmentHelper: EnvironmentHelper
) {
  const userTmdbInfoStore = environmentHelper.match("DI_DATABASE", {
    memory: () => new InMemoryUserTmdbInfoStore(database),
    filesystem: () =>
      new FilesystemUserTmdbInfoStore(environmentHelper, database),
  });
  commandBus.register(
    new SetUserTmdbInfoProgressCommandHandler(userTmdbInfoStore)
  );

  return userTmdbInfoStore;
}
