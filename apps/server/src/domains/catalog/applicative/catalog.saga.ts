import {
  EventBus,
  Saga,
  TransactionPerformer,
  useLog,
} from "@media-center/domain-driven";
import { FilenameParse } from "../../../../../../packages/domains/src/tools/filename";
import {
  CatalogEntryUpdated,
  CatalogEntryDeleted,
} from "@media-center/domains/src/catalog/applicative/catalog.events";
import { CatalogEntryStore } from "@media-center/domains/src/catalog/applicative/catalogEntry.store";
import {
  ShowCatalogEntry,
  MovieCatalogEntry,
  MovieCatalogEntryDataset,
  AnyCatalogEntry,
} from "@media-center/domains/src/catalog/domain/catalogEntry";
import {
  HierarchyItemAdded,
  HierarchyItemDeleted,
} from "@media-center/domains/src/fileWatcher/applicative/fileWatcher.events";
import { TmdbAPI } from "@media-center/domains/src/tmdb/applicative/tmdb.api";
import { TmdbStore } from "@media-center/domains/src/tmdb/applicative/tmdb.store";
import { AnyTmdb } from "@media-center/domains/src/tmdb/domain/anyTmdb";

export class CatalogSaga extends Saga {
  constructor(
    private readonly transactionPerformer: TransactionPerformer,
    private readonly tmdbApi: TmdbAPI,
    private readonly tmdbStore: TmdbStore,
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  private static movieReplacements: ((filename: string) => string)[] = [
    (filename) => filename.replace(/[-_.]/g, " "),
    (filename) => filename.replace(/[0-9]/g, ""),
    (filename) => filename.split(" ").slice(0, -1).join(" ").trim(),
  ];

  private static showReplacements: ((filename: string) => string)[] = [
    (filename) => filename.replace(/[-_.]/g, " "),
    (filename) => filename.split(" ").slice(0, -1).join(" ").trim(),
  ];

  private async searchWithFallback(
    name: string,
    isShow: boolean,
    year: number | undefined
  ) {
    let tmdbEntry: AnyTmdb | undefined;
    const replacements = isShow
      ? CatalogSaga.showReplacements
      : CatalogSaga.movieReplacements;
    for (let i = 0; name.length > 0; i += 1) {
      [tmdbEntry] = await this.tmdbApi.search(name, {
        type: isShow ? "show" : "movie",
        year: year,
      });
      if (tmdbEntry) {
        return tmdbEntry;
      }
      const replacement =
        replacements[i] ?? replacements[replacements.length - 1]!;
      name = replacement(name);
    }
    return undefined;
  }

  @Saga.on(HierarchyItemAdded)
  async onFileAdded(event: HierarchyItemAdded) {
    const logger = useLog(CatalogSaga.name);

    const catalogEntry = await this.transactionPerformer.transactionnally(
      async (transaction) => {
        const fileAlreadyAdded =
          await this.catalogEntryStore.loadByHierarchyItemId(
            event.item.id,
            transaction
          );
        if (fileAlreadyAdded.length > 0) {
          logger.info(
            `File ${event.item.file.path} already existing in catalog`
          );
          return undefined;
        }

        const isShow = event.type.value === "show";
        const infosFromFilename = await FilenameParse(
          event.item.file.getFilename(),
          isShow
        );
        const tmdbEntry = await this.searchWithFallback(
          infosFromFilename.title,
          isShow,
          infosFromFilename.year ? +infosFromFilename.year : undefined
        );
        if (!tmdbEntry) {
          logger.warn(
            `Could not find tmdb entry for filename ${event.item.file.getFilename()} (isShow: ${isShow})`
          );
          return undefined;
        }
        // Caches the entry in the store already
        await this.tmdbStore.load(tmdbEntry.id);

        const alreadyExisting =
          (await this.catalogEntryStore.load(tmdbEntry.id, transaction)) ??
          (isShow
            ? new ShowCatalogEntry({
                id: tmdbEntry.id,
                dataset: [],
                updatedAt: new Date(),
              })
            : new MovieCatalogEntry({
                id: tmdbEntry.id,
                dataset: new MovieCatalogEntryDataset({ hierarchyItemIds: [] }),
                updatedAt: new Date(),
              }));
        if (alreadyExisting instanceof ShowCatalogEntry) {
          if (!("isTv" in infosFromFilename)) {
            console.warn("File added in show but not analyzed as show");
            return undefined;
          }
          let [season] = infosFromFilename.seasons;
          const [episode] = infosFromFilename.episodeNumbers;
          if (episode === undefined) {
            console.warn(
              "Could not find episode from filename",
              event.item.file.getFilename()
            );
            return undefined;
          }
          alreadyExisting.addHierarchyItemIdForEpisode(
            season ?? 1,
            episode,
            event.item.id
          );
          logger.info(
            `Found tmdb entry for filename ${event.item.file.getFilename()}: ${
              tmdbEntry.title
            } (show, id: ${tmdbEntry.id.toRealId()}, S${
              season === undefined ? "1 (defaulted)" : season
            }E${episode})`
          );
        } else if (alreadyExisting instanceof MovieCatalogEntry) {
          alreadyExisting.addHierarchyItemId(event.item.id);
          logger.info(
            `Found tmdb entry for filename ${event.item.file.getFilename()}: ${
              tmdbEntry.title
            } (movie, id: ${tmdbEntry.id.toRealId()})`
          );
        }
        await this.catalogEntryStore.save(alreadyExisting, transaction);
        return alreadyExisting;
      }
    );
    if (catalogEntry) {
      this.eventBus.publish(
        new CatalogEntryUpdated({
          catalogEntry,
        })
      );
    }
  }

  @Saga.on(HierarchyItemDeleted)
  async onFileDeleted(event: HierarchyItemDeleted) {
    const { updated, deleted } =
      await this.transactionPerformer.transactionnally(async (transaction) => {
        const existing = await this.catalogEntryStore.loadByHierarchyItemId(
          event.item.id,
          transaction
        );
        existing.forEach((e) => {
          e.deleteHierarchyItemId(event.item.id);
          e.markUpdated(new Date());
        });
        const _deleted: AnyCatalogEntry[] = [];
        const _updated: AnyCatalogEntry[] = [];
        await Promise.all(
          existing.map(async (e) => {
            if (!e.hasHierarchyItems()) {
              _deleted.push(e);
              return this.catalogEntryStore.delete(e.id, transaction);
            }
            _updated.push(e);
            return this.catalogEntryStore.save(e, transaction);
          })
        );
        return { updated: _updated, deleted: _deleted };
      });
    deleted.forEach((d) =>
      this.eventBus.publish(new CatalogEntryDeleted({ catalogEntry: d }))
    );
    updated.forEach((u) =>
      this.eventBus.publish(new CatalogEntryUpdated({ catalogEntry: u }))
    );
  }
}
