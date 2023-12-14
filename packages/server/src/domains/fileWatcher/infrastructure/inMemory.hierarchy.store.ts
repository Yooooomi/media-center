import { InMemoryStore, ShapeSerializer } from "@media-center/domain-driven";
import { HierarchyStore } from "../applicative/hierarchy.store";
import { HierarchyItem } from "../domain/hierarchyItem";
import { HierarchyItemId } from "../domain/hierarchyItemId";

export class InMemoryHierarchyStore
  extends InMemoryStore<HierarchyItem, HierarchyItemId>
  implements HierarchyStore
{
  constructor() {
    super(new ShapeSerializer(HierarchyItem));
  }

  loadByPath(path: string) {
    return this.filter((i) => i.file.path === path);
  }
}
