import { Event } from "@media-center/domain-driven";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";

export class HierarchyEntryInformationUpdated extends Event({
  hierarchyItemId: HierarchyItemId,
}) {}
