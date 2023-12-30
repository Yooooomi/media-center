import { InMemoryDatabase, InMemoryStore } from "@media-center/domain-driven";
import { HierarchyStore } from "../applicative/hierarchy.store";
import { HierarchyItem } from "../domain/hierarchyItem";
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
