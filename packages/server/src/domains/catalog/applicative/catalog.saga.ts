import { EventBus, Saga, useLog } from "@media-center/domain-driven";
import { FilenameParse } from "../../../tools/filename";
import {
  HierarchyItemAdded,
  HierarchyItemDeleted,
} from "../../fileWatcher/applicative/fileWatcher.events";
import { TmdbAPI } from "../../tmdb/applicative/tmdb.api";
import {
  AnyCatalogEntry,
  CatalogEntryMovieSpecification,
  CatalogEntryShowSpecification,
  MovieCatalogEntry,
  ShowCatalogEntry,
} from "../domain/catalogEntry";
import { CatalogEntryStore } from "./catalogEntry.store";
import { CatalogEntryUpdated, CatalogEntryDeleted } from "./catalog.events";

export class CatalogSaga extends Saga {
  constructor(
    private readonly tmdbApi: TmdbAPI,
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  @Saga.on(HierarchyItemAdded)
  async onFileAdded(event: HierarchyItemAdded) {
    const logger = useLog(CatalogSaga.name);

    const catalogEntry = await this.catalogEntryStore.transactionnally(
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
        const [tmdbEntry] = await this.tmdbApi.search(infosFromFilename.title, {
          type: isShow ? "show" : "movie",
          year: infosFromFilename.year ? +infosFromFilename.year : undefined,
        });
        if (!tmdbEntry) {
          logger.warn(
            `Could not find tmdb entry for filename ${event.item.file.getFilename()} (isShow: ${isShow})`
          );
          return undefined;
        }
        const alreadyExisting =
          (await this.catalogEntryStore.load(tmdbEntry.id, transaction)) ??
          (isShow
            ? new ShowCatalogEntry({ id: tmdbEntry.id, items: [] })
            : new MovieCatalogEntry({ id: tmdbEntry.id, items: [] }));
        if (alreadyExisting instanceof ShowCatalogEntry) {
          if (!("isTv" in infosFromFilename)) {
            console.warn("File added in show but not analyzed as show");
            return undefined;
          }
          const [season] = infosFromFilename.seasons;
          const [episode] = infosFromFilename.episodeNumbers;
          if (season === undefined || episode === undefined) {
            console.warn(
              "Could not find season and/or episode from filename",
              event.item.file.getFilename()
            );
            return undefined;
          }
          const specification = new CatalogEntryShowSpecification({
            id: event.item.id,
            season,
            episode,
          });
          alreadyExisting.addSpecification(specification);
          logger.info(
            `Found tmdb entry for filename ${event.item.file.getFilename()}: ${
              tmdbEntry.title
            } (show, id: ${tmdbEntry.id.toRealId()}, S${season}E${episode})`
          );
        } else if (alreadyExisting instanceof MovieCatalogEntry) {
          const specification = new CatalogEntryMovieSpecification({
            id: event.item.id,
          });
          alreadyExisting.addSpecification(specification);
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
    const { updated, deleted } = await this.catalogEntryStore.transactionnally(
      async (transaction) => {
        const existing = await this.catalogEntryStore.loadByHierarchyItemId(
          event.item.id,
          transaction
        );
        existing.forEach((e) => e.deleteHierarchyItemId(event.item.id));
        const deleted: AnyCatalogEntry[] = [];
        const updated: AnyCatalogEntry[] = [];
        await Promise.all(
          existing.map(async (e) => {
            if (e.items.length === 0) {
              deleted.push(e);
              return this.catalogEntryStore.delete(e.id, transaction);
            }
            updated.push(e);
            return this.catalogEntryStore.save(e, transaction);
          })
        );
        return { updated, deleted };
      }
    );
    deleted.forEach((d) =>
      this.eventBus.publish(new CatalogEntryDeleted({ catalogEntry: d }))
    );
    updated.forEach((u) =>
      this.eventBus.publish(new CatalogEntryUpdated({ catalogEntry: u }))
    );
  }
}
