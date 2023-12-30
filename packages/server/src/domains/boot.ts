import { config as configureDotenv } from "dotenv";
import { bootApi } from "../endpoints/boot";
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
import {
  InMemoryCommandBus,
  InMemoryDatabase,
  InMemoryEventBus,
  InMemoryQueryBus,
} from "@media-center/domain-driven";
import { bootUser } from "./user/boot";
import { bootUserTmdbInfo } from "./userTmdbInfo/boot";
import { bootQueries } from "../queries/boot";

export async function globalBoot() {
  configureDotenv();

  const database = new InMemoryDatabase();
  const commandBus = new InMemoryCommandBus();
  const eventBus = new InMemoryEventBus();
  const queryBus = new InMemoryQueryBus();
  const filesystem = new DiskFilesystem();
  const safeRequest = new SolverSafeRequest(filesystem);
  const environmentHelper = new ProcessEnvironmentHelper();
  // TODO FIX THIS
  const torrentRequestStore = environmentHelper.match("DI_DATABASE", {
    memory: () => new InMemoryTorrentRequestStore(database),
    filesystem: () =>
      new FilesystemTorrentRequestStore(environmentHelper, database),
  });

  const { tmdbStore, tmdbApi } = bootTmdb(
    database,
    queryBus,
    environmentHelper
  );
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
    database,
    commandBus,
    eventBus,
    environmentHelper
  );
  bootApi(queryBus, commandBus, hierarchyStore, environmentHelper, eventBus);
  const { catalogEntryStore } = bootCatalog(
    database,
    queryBus,
    eventBus,
    environmentHelper,
    tmdbApi,
    hierarchyStore
  );
  bootUser(queryBus, environmentHelper);
  bootUserTmdbInfo(database, commandBus, environmentHelper);

  bootQueries(
    queryBus,
    catalogEntryStore,
    torrentRequestStore,
    tmdbStore,
    tmdbApi,
    hierarchyStore
  );

  return { commandBus, eventBus, unsubscribeUpdateTorrentPoll };
}
