import { config as configureDotenv } from "dotenv";
import { bootApi } from "../endpoints/boot";
import { InMemoryCommandBus } from "../framework/commandBus/inMemory.commandBus";
import { InMemoryEventBus } from "../framework/event/inMemory.eventBus";
import { InMemoryQueryBus } from "../framework/queryBus/inMemory.queryBus";
import { SolverSafeRequest } from "../framework/safeRequest/solver.safeRequest";
import { DiskFilesystem } from "../framework/valueObjects/fileSystem";
import { ProcessEnvironmentHelper } from "./environment/infrastructure/process.environmentHelper";
import { bootFileWatcher } from "./fileWatcher/boot";
import { bootTmdb } from "./tmdb/boot";
import { bootTorrentClient } from "./torrentClient/boot";
import { bootTorrentIndexer } from "./torrentIndexer/boot";
import { bootTorrentRequest } from "./torrentRequest/boot";
import { InMemoryTorrentRequestStore } from "./torrentRequest/infrastructure/inMemory.torrentRequest.store";
import { bootCatalog } from "./catalog/boot";
import { FilesystemTorrentRequestStore } from "./torrentRequest/infrastructure/filesystem.torrentRequest.store";

export async function globalBoot() {
  configureDotenv();

  const commandBus = new InMemoryCommandBus();
  const eventBus = new InMemoryEventBus();
  const queryBus = new InMemoryQueryBus();
  const filesystem = new DiskFilesystem();
  const safeRequest = new SolverSafeRequest(filesystem);
  const environmentHelper = new ProcessEnvironmentHelper();
  // TODO FIX THIS
  const torrentRequestStore = environmentHelper.match("DI_DATABASE", {
    memory: () => new InMemoryTorrentRequestStore(),
    filesystem: () => new FilesystemTorrentRequestStore(),
  });

  const { tmdbStore, tmdbApi } = bootTmdb(queryBus, environmentHelper);
  const { torrentIndexer } = bootTorrentIndexer(
    queryBus,
    tmdbStore,
    environmentHelper,
    safeRequest
  );
  const { torrentClient, unsubscribeUpdateTorrentPoll } = bootTorrentClient(
    commandBus,
    environmentHelper,
    torrentRequestStore
  );
  bootTorrentRequest(
    commandBus,
    queryBus,
    torrentClient,
    torrentIndexer,
    torrentRequestStore
  );
  const { hierarchyStore } = await bootFileWatcher(
    commandBus,
    eventBus,
    environmentHelper
  );
  bootApi(queryBus, commandBus, hierarchyStore);
  bootCatalog(queryBus, eventBus, environmentHelper, tmdbApi, hierarchyStore);

  return { commandBus, eventBus, unsubscribeUpdateTorrentPoll };
}
