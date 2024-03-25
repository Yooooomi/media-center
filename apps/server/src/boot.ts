import Database from "better-sqlite3";
import { config as configureDotenv } from "dotenv";
import {
  InMemoryCommandBus,
  InMemoryDatabase,
  InMemoryEventBus,
  InMemoryQueryBus,
  InMemoryTransactionPerformer,
  SQLiteTransactionPerformer,
} from "@media-center/domain-driven";
import { DiskFilesystem } from "@media-center/domains/src/miscellaneous/valueObjects/fileSystem";
import { InMemoryJobRegistry } from "@media-center/domain-driven/src/bus/jobRegistry";
import { SolverSafeRequest } from "./framework/safeRequest/solver.safeRequest";
import { bootApi } from "./endpoints/boot";
import { FilesystemTorrentRequestStore } from "./domains/torrentRequest/infrastructure/filesystem.torrentRequest.store";
import { bootCatalog } from "./domains/catalog/boot";
import { bootCommands } from "./domains/commands/boot";
import { bootFileWatcher } from "./domains/fileWatcher/boot";
import { bootQueries } from "./domains/queries/boot";
import { bootTmdb } from "./domains/tmdb/boot";
import { bootTorrentClient } from "./domains/torrentClient/boot";
import { bootTorrentIndexer } from "./domains/torrentIndexer/boot";
import { bootTorrentRequest } from "./domains/torrentRequest/boot";
import { bootUser } from "./domains/user/boot";
import { bootUserTmdbInfo } from "./domains/userTmdbInfo/boot";
import { ProcessEnvironmentHelper } from "./domains/environment/infrastructure/process.environmentHelper";
import { bootHierarchyEntryInformation } from "./domains/hierarchyEntryInformation/boot";
import { InMemoryTorrentRequestStore } from "./domains/torrentRequest/infrastructure/inMemory.torrentRequest.store";
import { SQLiteTorrentRequestStore } from "./domains/torrentRequest/infrastructure/sqlite.torrentRequest.store";

export async function globalBoot() {
  configureDotenv();

  const filesystem = new DiskFilesystem();
  const environmentHelper = new ProcessEnvironmentHelper();
  const database = environmentHelper.match("DI_DATABASE", {
    memory: () => new InMemoryDatabase(),
    filesystem: () => new InMemoryDatabase(),
    sqlite: () => {
      const db = new Database(
        environmentHelper.get("SQLITE_STORE_FILEPATH"),
      ) as any;
      // db.pragma("journal_mode = WAL");
      return db;
    },
  });
  const transactionPerformer = environmentHelper.match("DI_DATABASE", {
    memory: () => new InMemoryTransactionPerformer(database),
    filesystem: () => new InMemoryTransactionPerformer(database),
    sqlite: () => new SQLiteTransactionPerformer(database),
  });
  const jobRegistry = new InMemoryJobRegistry();

  const commandBus = new InMemoryCommandBus(jobRegistry);
  const queryBus = new InMemoryQueryBus(jobRegistry);
  const eventBus = new InMemoryEventBus();

  const safeRequest = new SolverSafeRequest(environmentHelper);
  // TODO FIX THIS
  const torrentRequestStore = environmentHelper.match("DI_DATABASE", {
    memory: () => new InMemoryTorrentRequestStore(database),
    filesystem: () =>
      new FilesystemTorrentRequestStore(environmentHelper, database),
    sqlite: () => new SQLiteTorrentRequestStore(database),
  });

  const { tmdbStore, tmdbApi } = bootTmdb(
    database,
    queryBus,
    environmentHelper,
  );
  const { torrentIndexer } = bootTorrentIndexer(
    queryBus,
    environmentHelper,
    safeRequest,
  );
  const { torrentClient, unsubscribeUpdateTorrentPoll } = bootTorrentClient(
    commandBus,
    eventBus,
    environmentHelper,
    torrentRequestStore,
  );
  bootTorrentRequest(
    commandBus,
    queryBus,
    eventBus,
    torrentClient,
    torrentIndexer,
    torrentRequestStore,
  );
  const { hierarchyStore } = await bootFileWatcher(
    database,
    commandBus,
    eventBus,
    environmentHelper,
  );
  bootApi(
    jobRegistry,
    queryBus,
    commandBus,
    hierarchyStore,
    environmentHelper,
    eventBus,
    tmdbApi,
  );
  const { catalogEntryStore } = bootCatalog(
    jobRegistry,
    database,
    transactionPerformer,
    queryBus,
    commandBus,
    eventBus,
    environmentHelper,
    tmdbApi,
    tmdbStore,
    hierarchyStore,
  );
  bootUser(queryBus, environmentHelper);
  const { userTmdbInfoStore } = bootUserTmdbInfo(
    database,
    commandBus,
    eventBus,
    environmentHelper,
    tmdbStore,
  );

  const { hierarchyEntryInformationStore } = bootHierarchyEntryInformation(
    jobRegistry,
    environmentHelper,
    transactionPerformer,
    database,
    eventBus,
    commandBus,
    queryBus,
    hierarchyStore,
    filesystem,
    catalogEntryStore,
    torrentRequestStore,
  );

  bootCommands(commandBus, torrentClient, torrentRequestStore);

  bootQueries(
    queryBus,
    catalogEntryStore,
    torrentRequestStore,
    tmdbStore,
    tmdbApi,
    hierarchyStore,
    userTmdbInfoStore,
    torrentClient,
    torrentIndexer,
    hierarchyEntryInformationStore,
  );

  return {
    commandBus,
    eventBus,
    unsubscribeUpdateTorrentPoll,
    environmentHelper,
  };
}
