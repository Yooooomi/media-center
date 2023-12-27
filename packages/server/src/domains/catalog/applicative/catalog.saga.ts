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
import { CatalogEntryAdded, CatalogEntryDeleted } from "./catalog.events";

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

    const fileAlreadyAdded = await this.catalogEntryStore.loadByHierarchyItemId(
      event.item.id
    );
    if (fileAlreadyAdded.length > 0) {
      logger.info(`File ${event.item.file.path} already existing in catalog`);
      return;
    }

    const isShow = event.type.value === "show";
    const infosFromFilename = await FilenameParse(
      event.item.file.getFilename(),
      isShow
    );
    const [tmdbEntry] = await this.tmdbApi.search(infosFromFilename.title, {
      media: isShow ? "show" : "movie",
      year: infosFromFilename.year ? +infosFromFilename.year : undefined,
    });
    if (!tmdbEntry) {
      logger.warn(
        `Could not find tmdb entry for filename ${event.item.file.getFilename()} (isShow: ${isShow})`
      );
      return;
    }
    logger.info(
      `Found tmdb entry for filename ${event.item.file.getFilename()}: ${
        tmdbEntry.title
      } (id: ${tmdbEntry.id.toRealId()}, isShow: ${isShow})`
    );
    const alreadyExisting =
      (await this.catalogEntryStore.load(tmdbEntry.id)) ??
      (isShow
        ? new ShowCatalogEntry({ id: tmdbEntry.id, items: [] })
        : new MovieCatalogEntry({ id: tmdbEntry.id, items: [] }));
    if (alreadyExisting instanceof ShowCatalogEntry) {
      if (!("isTv" in infosFromFilename)) {
        console.warn("File added in show but not analyzed as show");
        return;
      }
      const [season] = infosFromFilename.seasons;
      const [episode] = infosFromFilename.episodeNumbers;
      if (season === undefined || episode === undefined) {
        console.warn(
          "Could not find season and/or episode from filename",
          event.item.file.getFilename()
        );
        return;
      }
      const specification = new CatalogEntryShowSpecification({
        id: event.item.id,
        season,
        episode,
      });
      alreadyExisting.addSpecification(specification);
    } else if (alreadyExisting instanceof MovieCatalogEntry) {
      const specification = new CatalogEntryMovieSpecification({
        id: event.item.id,
      });
      alreadyExisting.addSpecification(specification);
    }
    await this.catalogEntryStore.save(alreadyExisting);
    this.eventBus.publish(
      new CatalogEntryAdded({
        catalogEntry: alreadyExisting,
      })
    );
  }

  @Saga.on(HierarchyItemDeleted)
  async onFileDeleted(event: HierarchyItemDeleted) {
    const existing = await this.catalogEntryStore.loadByHierarchyItemId(
      event.item.id
    );
    existing.forEach((e) => e.deleteHierarchyItemId(event.item.id));
    const deleted: AnyCatalogEntry[] = [];
    await Promise.all(
      existing.map(async (e) => {
        if (e.items.length === 0) {
          deleted.push(e);
          return this.catalogEntryStore.delete(e.id);
        }
      })
    );
    deleted.forEach((d) =>
      this.eventBus.publish(new CatalogEntryDeleted({ catalogEntry: d }))
    );
  }
}
