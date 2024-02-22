import { InMemoryDatabase } from "@media-center/domain-driven";
import { FilesystemStore } from "../../../framework/store";
import { HierarchyItemUpcastSerializer } from "./hierarchyItem.upcast";
import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";
import { HierarchyStore } from "@media-center/domains/src/fileWatcher/applicative/hierarchy.store";
import { HierarchyItem } from "@media-center/domains/src/fileWatcher/domain/hierarchyItem";

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
