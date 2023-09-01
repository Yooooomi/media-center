import { EventBus } from "../../framework/event/eventBus";
import { EnvironmentHelper } from "../environment/applicative/environmentHelper";
import { DiskFileWatcher } from "./infrastructure/disk.fileWatcher";
import { InMemoryHierarchyStore } from "./infrastructure/inMemory.hierarchyStore";

export async function bootFileWatcher(
  eventBus: EventBus,
  environmentHelper: EnvironmentHelper
) {
  const hierarchyStore = new InMemoryHierarchyStore();
  const watcher = new DiskFileWatcher(
    eventBus,
    hierarchyStore,
    environmentHelper
  );

  await watcher.setup();

  return { watcher, hierarchyStore };
}
