import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";

export interface SubtitleStore {
  fromLocalFile(
    hierarchyItemId: HierarchyItemId,
    trackIndex: number,
    filepath: string,
  ): Promise<void>;
  load(
    hierarchyItemId: HierarchyItemId,
    trackIndex: number,
  ): Promise<string | undefined>;
  delete(hierarchyItemId: HierarchyItemId, trackIndex: number): Promise<void>;
  deleteAll(): Promise<void>;
}
