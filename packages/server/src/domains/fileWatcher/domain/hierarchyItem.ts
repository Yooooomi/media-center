import { Shape } from "../../../framework/shape";
import { File } from "../../../framework/valueObjects/file";
import { HierarchyItemId } from "./hierarchyItemId";

export class HierarchyItem extends Shape({
  id: HierarchyItemId,
  file: File,
}) {
  equals(other: unknown) {
    return (
      other instanceof HierarchyItem &&
      this.id.equals(other.id) &&
      this.file.equals(other.file)
    );
  }
}
