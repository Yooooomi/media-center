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

  async loadByHierarchyItemId(
    hierarchyItemId: HierarchyItemId,
    transaction?: Transaction,
  ) {
    const result = await this.run(
      (database) =>
        database
          .prepare(
            `SELECT ${this.collectionName}.id, ${this.collectionName}.data, json_each.value as fv FROM ${this.collectionName}, json_each(data, '$.1.dataset')
              WHERE CASE
              WHEN json_extract(data, '$.0') = 0
              THEN ?
                IN (SELECT json_each.value as idd from json_each(fv))
              ELSE ?
                IN (SELECT json_each.value AS idd FROM json_each(json_extract(fv, '$.hierarchyItemIds')))
              END`,
          )
          .all(hierarchyItemId.toString(), hierarchyItemId.toString()),
      transaction,
    );
    return Promise.all(
      result.map((e: any) =>
        this.serializer.deserializeModel({ id: e.id, ...JSON.parse(e.data) }),
      ),
    );
  }

  loadMovies() {
    return this._select(
      "WHERE json_extract(data, '$.0') = ?",
      undefined,
      0,
    ) as Promise<MovieCatalogEntry[]>;
  }

  loadShows() {
    return this._select(
      "WHERE json_extract(data, '$.0') = ?",
      undefined,
      1,
    ) as Promise<ShowCatalogEntry[]>;
  }

  async loadNewestMovies(limit: number) {
    return this._select(
      "WHERE json_extract(data, '$.0') = ? ORDER BY json_extract(data, '$.1.updatedAt') DESC LIMIT ?",
      undefined,
      1,
      limit,
    ) as Promise<MovieCatalogEntry[]>;
  }

  async loadNewestShows(limit: number) {
    return this._select(
      "WHERE json_extract(data, '$.0') = ? ORDER BY json_extract(data, '$.1.updatedAt') DESC LIMIT ?",
      undefined,
      0,
      limit,
    ) as Promise<ShowCatalogEntry[]>;
  }
}
