import { CommandBus } from "../../framework/commandBus/commandBus";
import { EventBus } from "../../framework/event/eventBus";
import { EnvironmentHelper } from "../environment/applicative/environmentHelper";
import {
  ScanExisting,
  ScanExistingCommandHandler,
} from "./applicative/scanExisting.command";
import { DiskFileWatcher } from "./infrastructure/disk.fileWatcher";
import { InMemoryHierarchyStore } from "./infrastructure/inMemory.hierarchyStore";

export async function bootFileWatcher(
  commandBus: CommandBus,
  eventBus: EventBus,
  environmentHelper: EnvironmentHelper
) {
  const hierarchyStore = new InMemoryHierarchyStore();
  const watcher = new DiskFileWatcher(
    eventBus,
    hierarchyStore,
    environmentHelper
  );

  commandBus.register(ScanExisting, new ScanExistingCommandHandler(watcher));

  await watcher.setup();

  return { watcher, hierarchyStore };
}
