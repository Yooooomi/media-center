import { CommandBus, Database, EventBus } from "@media-center/domain-driven";
import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";
import { ScanExistingCommandHandler } from "@media-center/domains/src/fileWatcher/applicative/scanExisting.command";
import { DiskFileWatcher } from "./infrastructure/disk.fileWatcher";
import { FilesystemHierarchyStore } from "./infrastructure/filesystem.hierarchy.store";
import { InMemoryHierarchyStore } from "./infrastructure/inMemory.hierarchy.store";
import { SQLiteHierarchyStore } from "./infrastructure/sqlite.hierarchy.store";

export async function bootFileWatcher(
  database: Database,
  commandBus: CommandBus,
  eventBus: EventBus,
  environmentHelper: EnvironmentHelper,
) {
  const hierarchyStore = environmentHelper.match("DI_DATABASE", {
    memory: () => new InMemoryHierarchyStore(database),
    filesystem: () => new FilesystemHierarchyStore(environmentHelper, database),
    sqlite: () => new SQLiteHierarchyStore(database),
  });
  const watcher = new DiskFileWatcher(
    eventBus,
    hierarchyStore,
    environmentHelper,
  );

  commandBus.register(new ScanExistingCommandHandler(watcher));

  await watcher.setup();

  return { watcher, hierarchyStore };
}
