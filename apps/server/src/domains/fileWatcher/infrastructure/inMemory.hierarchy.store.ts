import { InMemoryDatabase, InMemoryStore } from "@media-center/domain-driven";
import { HierarchyItem } from "@media-center/domains/src/fileWatcher/domain/hierarchyItem";
import { HierarchyStore } from "@media-center/domains/src/fileWatcher/applicative/hierarchy.store";
import { HierarchyItemUpcastSerializer } from "./hierarchyItem.upcast";

export class InMemoryHierarchyStore
  extends InMemoryStore<HierarchyItem>
  implements HierarchyStore
{
  constructor(database: InMemoryDatabase) {
    super(database, "hierarchy", new HierarchyItemUpcastSerializer());
  }

  loadByExactPath(path: string) {
    return this.filter((i) => i.file.path === path);
  }

  loadByPath(path: string) {
    return this.filter((i) => i.file.path.startsWith(path));
  }
}
