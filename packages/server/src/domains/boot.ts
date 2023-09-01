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
import { bootUser } from "./user/boot";
import { bootCatalog } from "./catalog/boot";

export async function globalBoot() {
  configureDotenv();

  const commandBus = new InMemoryCommandBus();
  const eventBus = new InMemoryEventBus();
  const queryBus = new InMemoryQueryBus();
  const filesystem = new DiskFilesystem();
  const safeRequest = new SolverSafeRequest(filesystem);
  const environmentHelper = new ProcessEnvironmentHelper();
  // TODO FIX THIS
  const torrentRequestStore = new InMemoryTorrentRequestStore();

  bootUser(commandBus);
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
  bootApi(queryBus, commandBus);
  const { hierarchyStore } = await bootFileWatcher(eventBus, environmentHelper);
  bootCatalog(queryBus, eventBus, tmdbApi, hierarchyStore);

  return () => {
    unsubscribeUpdateTorrentPoll();
  };
}
