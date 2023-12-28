import { CommandBus } from "@media-center/domain-driven";
import { SetUserTmdbInfoProgressCommandHandler } from "./applicative/setUserTmdbInfoProgress.command";
import { EnvironmentHelper } from "../environment/applicative/environmentHelper";
import { InMemoryUserTmdbInfoStore } from "./infrastructure/inMemory.userTmdbInfo.store";
import { FilesystemUserTmdbInfoStore } from "./infrastructure/filesystem.userTmdbInfo.store";

export function bootUserTmdbInfo(
  commandBus: CommandBus,
  environmentHelper: EnvironmentHelper
) {
  const userTmdbInfoStore = environmentHelper.match("DI_DATABASE", {
    memory: () => new InMemoryUserTmdbInfoStore(),
    filesystem: () => new FilesystemUserTmdbInfoStore(),
  });
  commandBus.register(
    new SetUserTmdbInfoProgressCommandHandler(userTmdbInfoStore)
  );

  return userTmdbInfoStore;
}
