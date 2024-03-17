import {
  Either,
  SerializableSerializer,
  Database,
  SQLiteStore,
  Transaction,
} from "@media-center/domain-driven";
import { CatalogEntryStore } from "@media-center/domains/src/catalog/applicative/catalogEntry.store";
import {
  AnyCatalogEntry,
  MovieCatalogEntry,
  ShowCatalogEntry,
} from "@media-center/domains/src/catalog/domain/catalogEntry";
import { HierarchyItemId } from "@media-center/domains/src/fileWatcher/domain/hierarchyItemId";

export class SQLiteCatalogEntryStore
  extends SQLiteStore<AnyCatalogEntry>
  implements CatalogEntryStore
{
  constructor(database: Database) {
    super(
      database,
      "catalogEntry",
      new SerializableSerializer(Either(MovieCatalogEntry, ShowCatalogEntry)),
    );
  }

  loadByHierarchyItemId(
    hierarchyItemId: HierarchyItemId,
    transaction?: Transaction,
  ) {
    return this._select(
      `, json_each(data, '$.1.dataset')
      WHERE ? IN (json_extract(data, '$.1.dataset.hierarchyItemIds'))
      OR ? IN (json_extract(json_each.value, '$.hierarchyItemIds'))
      `,
      transaction,
      hierarchyItemId.toString(),
      hierarchyItemId.toString(),
    );
  }

  loadMovies() {
    return this._select(
      "WHERE json_extract(data, '$.0') = ?",
      undefined,
      1,
    ) as Promise<MovieCatalogEntry[]>;
  }

  loadShows() {
    return this._select(
      "WHERE json_extract(data, '$.0') = ?",
      undefined,
      0,
    ) as Promise<ShowCatalogEntry[]>;
  }

  async loadNewestMovies(limit: number) {
    return this._select(
      "WHERE json_extract(data, '$.0') = ? ORDER BY json_extract(data, '$.1.updatedAt') LIMIT ?",
      undefined,
      1,
      limit,
    ) as Promise<MovieCatalogEntry[]>;
  }

  async loadNewestShows(limit: number) {
    return this._select(
      "WHERE json_extract(data, '$.0') = ? ORDER BY json_extract(data, '$.1.updatedAt') LIMIT ?",
      undefined,
      0,
      limit,
    ) as Promise<ShowCatalogEntry[]>;
  }
}
