import { FilesystemStore } from "../../../framework/store";
import { HierarchyStore } from "../applicative/hierarchy.store";
import { HierarchyItem } from "../domain/hierarchyItem";
import { HierarchyItemUpcastSerializer } from "./hierarchyItem.upcast";

export class FilesystemHierarchyStore
  extends FilesystemStore<HierarchyItem>
  implements HierarchyStore
{
  constructor() {
    super(new HierarchyItemUpcastSerializer());
  }

  loadByPath(path: string) {
    return this.filter((i) => i.file.path === path);
  }
}
