import { File } from "../../../framework/valueObjects/file";
import { FileWatcher } from "../applicative/fileWatcher";
import { watch, existsSync } from "fs";
import { join } from "path";
import { HierarchyItemId } from "../domain/hierarchyItemId";
import { EventBus } from "../../../framework/event/eventBus";
import { HierarchyStore } from "../applicative/hierarchy.store";
import { EnvironmentHelper } from "../../environment/applicative/environmentHelper";
import { useLog } from "../../../framework/useLog";

export class DiskFileWatcher extends FileWatcher {
  constructor(
    eventBus: EventBus,
    hierarchyStore: HierarchyStore,
    private readonly environmentHelper: EnvironmentHelper
  ) {
    super(eventBus, hierarchyStore);
  }

  async initialize() {
    const logger = useLog(DiskFileWatcher.name);
    const movieDir = this.environmentHelper.get("FILE_WATCHER_MOVIE_DIR");

    const movieWatcher = watch(movieDir, {
      recursive: true,
    });
    logger.info("Watching movie directory", movieDir);

    movieWatcher.on("change", (event, filename) => {
      if (filename instanceof Buffer || event !== "rename") {
        return;
      }
      const path = join(movieDir, filename);
      const exists = existsSync(path);

      if (exists) {
        this.triggerAdded(new File({ path }), "movie");
      } else {
        this.triggerDeleted(new File({ path }), "movie");
      }
    });
  }

  protected async checkExistence(file: HierarchyItemId) {
    return existsSync(file.toString());
  }
}
