import { EventBus } from "../../../framework/event/eventBus";
import { File } from "../../../framework/valueObjects/file";
import { HierarchyItem } from "../domain/hierarchyItem";
import { HierarchyItemId } from "../domain/hierarchyItemId";
import {
  HierarchyItemAdded,
  HierarchyItemDeleted,
  FileType,
} from "./fileWatcher.events";
import { HierarchyStore } from "./hierarchy.store";

export abstract class FileWatcher {
  constructor(
    private readonly eventBus: EventBus,
    private readonly hierarchyStore: HierarchyStore
  ) {}

  protected abstract initialize(): Promise<void>;
  protected abstract checkExistence(file: HierarchyItemId): Promise<boolean>;

  public abstract scan(): Promise<void>;

  public async setup() {
    const hierarchy = await this.hierarchyStore.loadAll();
    for (const hierarchyItem of hierarchy) {
      const stillExists = await this.checkExistence(hierarchyItem.id);
      if (!stillExists) {
        await this.hierarchyStore.delete(hierarchyItem.id);
      }
    }
    await this.initialize();
  }

  protected async triggerAdded(file: File, type: FileType) {
    const newItem = new HierarchyItem({
      id: new HierarchyItemId(file.path),
      file,
    });
    await this.hierarchyStore.save(newItem);
    this.eventBus.publish(new HierarchyItemAdded({ type, item: newItem }));
  }

  protected async triggerDeleted(file: File, type: FileType) {
    const existing = await this.hierarchyStore.load(
      new HierarchyItemId(file.path)
    );
    if (existing) {
      this.eventBus.publish(new HierarchyItemDeleted({ type, item: existing }));
      await this.hierarchyStore.delete(existing.id);
    }
  }
}
