import { EventBus } from "@media-center/domain-driven";
import { HierarchyItem } from "../domain/hierarchyItem";
import { HierarchyItemId } from "../domain/hierarchyItemId";
import {
  HierarchyItemAdded,
  HierarchyItemDeleted,
  FileType,
} from "./fileWatcher.events";
import { HierarchyStore } from "./hierarchy.store";
import { File } from "../../valueObjects/file";

export abstract class FileWatcher {
  constructor(
    private readonly eventBus: EventBus,
    private readonly hierarchyStore: HierarchyStore
  ) {}

  protected abstract initialize(): Promise<void>;
  protected abstract checkExistence(file: File): Promise<boolean>;

  public abstract scan(): Promise<void>;

  public async setup() {
    const hierarchy = await this.hierarchyStore.loadAll();
    for (const hierarchyItem of hierarchy) {
      const stillExists = await this.checkExistence(hierarchyItem.file);
      if (!stillExists) {
        await this.hierarchyStore.delete(hierarchyItem.id);
      }
    }
    await this.initialize();
  }

  protected async triggerAdded(file: File, type: FileType) {
    const alreadyExisting = await this.hierarchyStore.loadByExactPath(
      file.path
    );
    if (alreadyExisting.length > 0) {
      return;
    }
    const newItem = new HierarchyItem({
      id: HierarchyItemId.generate(),
      addedAt: new Date(),
      file,
    });
    await this.hierarchyStore.save(newItem);
    this.eventBus.publish(new HierarchyItemAdded({ type, item: newItem }));
  }

  protected async triggerDeleted(file: File, type: FileType) {
    const existing = await this.hierarchyStore.loadByPath(file.path);
    await Promise.all(existing.map((e) => this.hierarchyStore.delete(e.id)));
    existing.forEach((e) =>
      this.eventBus.publish(new HierarchyItemDeleted({ type, item: e }))
    );
  }
}
