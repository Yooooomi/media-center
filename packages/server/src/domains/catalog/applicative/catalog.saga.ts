import { Saga } from "../../../framework/saga";
import { useLog } from "../../../framework/useLog";
import { FilenameParse } from "../../../tools/filename";
import {
  HierarchyItemAdded,
  HierarchyItemDeleted,
} from "../../fileWatcher/applicative/fileWatcher.events";
import { TmdbAPI } from "../../tmdb/applicative/tmdb.api";
import {
  CatalogEntryMovieSpecification,
  CatalogEntryShowSpecification,
  MovieCatalogEntry,
  ShowCatalogEntry,
} from "../domain/catalogEntry";
import { CatalogEntryStore } from "./catalogEntry.store";

export class CatalogSaga extends Saga {
  constructor(
    private readonly tmdbApi: TmdbAPI,
    private readonly catalogEntryStore: CatalogEntryStore
  ) {
    super();
  }

  @Saga.on(HierarchyItemAdded)
  async onFileAdded(event: HierarchyItemAdded) {
    const logger = useLog(CatalogSaga.name);

    const fileAlreadyAdded = await this.catalogEntryStore.loadByHierarchyItemId(
      event.data.item.id
    );
    if (fileAlreadyAdded.length > 0) {
      logger.info(
        `File ${event.data.item.file.path} already existing in catalog`
      );
      return;
    }

    const isShow = event.data.type === "show";
    const infosFromFilename = FilenameParse(
      event.data.item.file.getFilename(),
      isShow
    );
    const [tmdbEntry] = await this.tmdbApi.search(infosFromFilename.title, {
      media: isShow ? "show" : "movie",
      year: infosFromFilename.year ? +infosFromFilename.year : undefined,
    });
    if (!tmdbEntry) {
      logger.warn(
        `Could not find tmdb entry for filename ${event.data.item.file.getFilename()} (isShow: ${isShow})`
      );
      return;
    }
    logger.info(
      `Found tmdb entry for filename ${event.data.item.file.getFilename()}: ${
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
          event.data.item.file.getFilename()
        );
        return;
      }
      const specification = new CatalogEntryShowSpecification({
        id: event.data.item.id,
        season,
        episode,
      });
      alreadyExisting.addSpecification(specification);
    } else if (alreadyExisting instanceof MovieCatalogEntry) {
      const specification = new CatalogEntryMovieSpecification({
        id: event.data.item.id,
      });
      alreadyExisting.addSpecification(specification);
    }
    await this.catalogEntryStore.save(alreadyExisting);
  }

  @Saga.on(HierarchyItemDeleted)
  async onFileDeleted(event: HierarchyItemDeleted) {
    const existing = await this.catalogEntryStore.loadByHierarchyItemId(
      event.data.item.id
    );
    existing.forEach((e) => e.deleteHierarchyItemId(event.data.item.id));
    await Promise.all(
      existing.map(async (e) => {
        if (e.items.length === 0) {
          return this.catalogEntryStore.delete(e.id);
        }
      })
    );
  }
}
