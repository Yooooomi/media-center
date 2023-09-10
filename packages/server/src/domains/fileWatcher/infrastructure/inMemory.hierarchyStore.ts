import { ShapeSerializer } from "../../../framework/shape";
import { InMemoryStore } from "../../../framework/store";
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
}
