import {
  UpcastSerializer,
  UpcastManifest,
  EnsureFrozen,
} from "@media-center/domain-driven";
import type { HierarchyItem0 } from "./hierarchyItem.version.0";
import { HierarchyItem } from "@media-center/domains/src/fileWatcher/domain/hierarchyItem";

export class HierarchyItemUpcastSerializer extends UpcastSerializer<HierarchyItem> {
  constructor() {
    super(HierarchyItem, new HierarchyItemUpcastManifest());
  }
}

type Versions = [HierarchyItem0];

export class HierarchyItemUpcastManifest extends UpcastManifest<
  Versions,
  EnsureFrozen<HierarchyItem, Versions>
> {
  get manifest() {
    return [];
  }
}
