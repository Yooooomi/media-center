import { ShapeSerializer } from "../../../framework/shape";
import { FilesystemStore } from "../../../framework/store";
import { HierarchyStore } from "../applicative/hierarchy.store";
import { HierarchyItem } from "../domain/hierarchyItem";
import { HierarchyItemId } from "../domain/hierarchyItemId";

export class FilesystemHierarchyStore
  extends FilesystemStore<HierarchyItem, HierarchyItemId>
  implements HierarchyStore
{
  constructor() {
    super(new ShapeSerializer(HierarchyItem));
  }

  loadByPath(path: string) {
    return this.filter((i) => i.file.path === path);
  }
}
