import { Freeze, Shape } from "@media-center/domain-driven";
import { File } from "../../../framework/valueObjects/file";
import { HierarchyItemId } from "./hierarchyItemId";

@Freeze()
export class HierarchyItem extends Shape({
  id: HierarchyItemId,
  addedAt: Date,
  file: File,
}) {
  equals(other: unknown) {
    return (
      other instanceof HierarchyItem &&
      this.id.equals(other.id) &&
      this.addedAt.getTime() === other.addedAt.getTime() &&
      this.file.equals(other.file)
    );
  }
}
