import { Database, SQLiteStore } from "@media-center/domain-driven";
import { HierarchyItem } from "@media-center/domains/src/fileWatcher/domain/hierarchyItem";
import { HierarchyStore } from "@media-center/domains/src/fileWatcher/applicative/hierarchy.store";
import { HierarchyItemUpcastSerializer } from "./hierarchyItem.upcast";

export class SQLiteHierarchyStore
  extends SQLiteStore<HierarchyItem>
  implements HierarchyStore
{
  constructor(database: Database) {
    super(database, "hierarchy", new HierarchyItemUpcastSerializer());
  }

  loadByExactPath(path: string) {
    return this._select(
      "WHERE json_extract(data, '$.file.path') = ?",
      undefined,
      path,
    );
  }

  loadByPath(path: string) {
    return this._select(
      "WHERE json_extract(data, '$.file.path') LIKE ?",
      undefined,
      `${path}%`,
    );
  }
}
