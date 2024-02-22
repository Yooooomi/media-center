import { Store } from "@media-center/domain-driven";
import { HierarchyItem } from "../domain/hierarchyItem";

export abstract class HierarchyStore extends Store<HierarchyItem> {
  abstract loadByExactPath(path: string): Promise<HierarchyItem[]>;
  abstract loadByPath(path: string): Promise<HierarchyItem[]>;
}
