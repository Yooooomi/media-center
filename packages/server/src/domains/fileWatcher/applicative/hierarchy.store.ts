import { Store } from "../../../framework/store";
import { HierarchyItem } from "../domain/hierarchyItem";
import { HierarchyItemId } from "../domain/hierarchyItemId";

export abstract class HierarchyStore extends Store<
  HierarchyItem,
  HierarchyItemId
> {
  abstract loadByPath(path: string): Promise<HierarchyItem[]>;
}
