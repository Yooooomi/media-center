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
      this.data.id.equals(other.data.id) &&
      this.data.file.equals(other.data.file)
    );
  }
}

HierarchyItem.register();
