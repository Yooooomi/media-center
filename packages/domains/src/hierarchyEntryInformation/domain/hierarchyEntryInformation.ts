import { Shape } from "@media-center/domain-driven";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";

export class HierarchyEntryInformation extends Shape({
  id: HierarchyItemId,
  textTracks: [{ name: String, content: String }],
  audioTracks: [{ name: String }],
}) {}
