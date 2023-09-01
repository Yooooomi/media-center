import { Saga } from "../../../framework/saga";
import { useLog } from "../../../framework/useLog";
import { FilenameParse } from "../../../tools/filename";
import {
  HierarchyItemAdded,
  HierarchyItemDeleted,
} from "../../fileWatcher/applicative/fileWatcher.events";
import { TmdbAPI } from "../../tmdb/applicative/tmdb.api";
import { CatalogEntry } from "../domain/catalogEntry";
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
    const isShow = event.data.type === "show";
    const infosFromFilename = FilenameParse(
      event.data.item.data.file.getFilename(),
      isShow
    );
    console.log("Extracted from filename", infosFromFilename);
    const [tmdbEntry] = await this.tmdbApi.search(infosFromFilename.title, {
      media: isShow ? "show" : "movie",
      year: infosFromFilename.year ? +infosFromFilename.year : undefined,
    });
    if (!tmdbEntry) {
      logger.warn(
        `Could not find tmdb entry for filename ${event.data.item.data.file.getFilename()} (isShow: ${isShow})`
      );
      return;
    }
    logger.info(
      `Found tmdb entry for filename ${event.data.item.data.file.getFilename()}: ${
        tmdbEntry.title
      } (isShow: ${isShow})`
    );
    const alreadyExisting =
      (await this.catalogEntryStore.load(tmdbEntry.id)) ??
      new CatalogEntry(tmdbEntry.id, []);
    alreadyExisting.addHierarchyItemId(event.data.item.data.id);
    console.log("ADDING ITEM", alreadyExisting);
    await this.catalogEntryStore.save(alreadyExisting);
  }

  @Saga.on(HierarchyItemDeleted)
  async onFileDeleted(event: HierarchyItemDeleted) {
    const existing = await this.catalogEntryStore.loadByHierarchyItemId(
      event.data.item.data.id
    );
    existing.forEach((e) => e.deleteHierarchyItemId(event.data.item.data.id));
    await Promise.all(
      existing.map(async (e) => {
        if (e.items.length === 0) {
          return this.catalogEntryStore.delete(e.id);
        }
      })
    );
  }
}
