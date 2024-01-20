import { InMemoryDatabase } from "@media-center/domain-driven";
import { FilesystemStore } from "../../../framework/store";
import { HierarchyStore } from "../applicative/hierarchy.store";
import { HierarchyItem } from "../domain/hierarchyItem";
import { EnvironmentHelper } from "../../environment/applicative/environmentHelper";
import { HierarchyItemUpcastSerializer } from "./hierarchyItem.upcast";

export class FilesystemHierarchyStore
  extends FilesystemStore<HierarchyItem>
  implements HierarchyStore
{
  constructor(
    environmentHelper: EnvironmentHelper,
    database: InMemoryDatabase
  ) {
    super(
      environmentHelper,
      database,
      "hierarchy",
      new HierarchyItemUpcastSerializer()
    );
  }

  loadByExactPath(path: string) {
    return this.filter((i) => i.file.path === path);
  }

  loadByPath(path: string) {
    return this.filter((i) => i.file.path.startsWith(path));
  }
}
