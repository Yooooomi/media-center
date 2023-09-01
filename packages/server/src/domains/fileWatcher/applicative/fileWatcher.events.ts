import { Event } from "../../../framework/event/event";
import { HierarchyItem } from "../domain/hierarchyItem";

export type FileType = "movie" | "show";
export class HierarchyItemAdded extends Event<{
  type: FileType;
  item: HierarchyItem;
}> {}
export class HierarchyItemDeleted extends Event<{
  type: FileType;
  item: HierarchyItem;
}> {}
