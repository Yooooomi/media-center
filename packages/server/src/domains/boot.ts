import { config as configureDotenv } from "dotenv";
import { bootApi } from "../endpoints/boot";
import { SolverSafeRequest } from "../framework/safeRequest/solver.safeRequest";
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
  InMemoryTransactionPerformer,
} from "@media-center/domain-driven";
import { bootUser } from "./user/boot";
import { bootUserTmdbInfo } from "./userTmdbInfo/boot";
import { bootQueries } from "../queries/boot";
import { bootCommands } from "./commands/boot";

export async function globalBoot() {
  configureDotenv();

  const database = new InMemoryDatabase();
  const transactionPerformer = new InMemoryTransactionPerformer(database);
  const commandBus = new InMemoryCommandBus();
  const eventBus = new InMemoryEventBus();
  const queryBus = new InMemoryQueryBus();
  const environmentHelper = new ProcessEnvironmentHelper();
  const safeRequest = new SolverSafeRequest(environmentHelper);
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
    environmentHelper,
    safeRequest
  );
  const { torrentClient, unsubscribeUpdateTorrentPoll } = bootTorrentClient(
    commandBus,
    eventBus,
    environmentHelper,
    torrentRequestStore
  );
  bootTorrentRequest(
    commandBus,
    queryBus,
    eventBus,
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
  bootApi(
    queryBus,
    commandBus,
    hierarchyStore,
    environmentHelper,
    eventBus,
    tmdbApi
  );
  const { catalogEntryStore } = bootCatalog(
    database,
    transactionPerformer,
    queryBus,
    commandBus,
    eventBus,
    environmentHelper,
    tmdbApi,
    tmdbStore,
    hierarchyStore
  );
  bootUser(queryBus, environmentHelper);
  const { userTmdbInfoStore } = bootUserTmdbInfo(
    database,
    commandBus,
    environmentHelper,
    tmdbStore
  );

  bootCommands(commandBus, torrentClient, torrentRequestStore);

  bootQueries(
    queryBus,
    catalogEntryStore,
    torrentRequestStore,
    tmdbStore,
    tmdbApi,
    hierarchyStore,
    userTmdbInfoStore
  );

  return { commandBus, eventBus, unsubscribeUpdateTorrentPoll };
}
