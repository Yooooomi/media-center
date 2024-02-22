import { Event } from "@media-center/domain-driven";
import { HierarchyItem } from "../domain/hierarchyItem";

export type FileType = "movie" | "show";
export class HierarchyItemAdded extends Event({
  type: ["movie", "show"],
  item: HierarchyItem,
}) {}
export class HierarchyItemDeleted extends Event({
  type: ["movie", "show"],
  item: HierarchyItem,
}) {}
