import { CommandBus } from "../../framework/commandBus/commandBus";
import { EventBus } from "../../framework/event/eventBus";
import { EnvironmentHelper } from "../environment/applicative/environmentHelper";
import {
  ScanExisting,
  ScanExistingCommandHandler,
} from "./applicative/scanExisting.command";
import { DiskFileWatcher } from "./infrastructure/disk.fileWatcher";
import { FilesystemHierarchyStore } from "./infrastructure/filesystem.hierarchy.store";
import { InMemoryHierarchyStore } from "./infrastructure/inMemory.hierarchy.store";

export async function bootFileWatcher(
  commandBus: CommandBus,
  eventBus: EventBus,
  environmentHelper: EnvironmentHelper
) {
  const hierarchyStore = environmentHelper.match("DI_DATABASE", {
    memory: () => new InMemoryHierarchyStore(),
    filesystem: () => new FilesystemHierarchyStore(),
  });
  const watcher = new DiskFileWatcher(
    eventBus,
    hierarchyStore,
    environmentHelper
  );

  commandBus.register(ScanExisting, new ScanExistingCommandHandler(watcher));

  await watcher.setup();

  return { watcher, hierarchyStore };
}
