import { File } from "../../../framework/valueObjects/file";
import { FileWatcher } from "../applicative/fileWatcher";
import * as fs from "fs";
import { join } from "path";
import { HierarchyItemId } from "../domain/hierarchyItemId";
import { EventBus } from "../../../framework/event/eventBus";
import { HierarchyStore } from "../applicative/hierarchy.store";
import { EnvironmentHelper } from "../../environment/applicative/environmentHelper";
import { useLog } from "../../../framework/useLog";
import { InfrastructureError } from "../../../framework/error";

class CannotWatchSameDirectory extends InfrastructureError {
  constructor(dirname: string) {
    super(
      `Cannot watch same directory, determination of movie and show is based on their location (received: ${dirname})`
    );
  }
}

export class DiskFileWatcher extends FileWatcher {
  constructor(
    eventBus: EventBus,
    hierarchyStore: HierarchyStore,
    private readonly environmentHelper: EnvironmentHelper
  ) {
    super(eventBus, hierarchyStore);
  }

  protected async initializeMovie() {
    const logger = useLog(DiskFileWatcher.name);
    const movieDir = this.environmentHelper.get("FILE_WATCHER_MOVIE_DIR");

    const movieWatcher = fs.watch(movieDir, {
      recursive: true,
    });
    logger.info("Watching movie directory", movieDir);

    movieWatcher.on("change", (event, filename) => {
      if (filename instanceof Buffer || event !== "rename") {
        return;
      }
      const path = join(movieDir, filename);
      const exists = fs.existsSync(path);

      if (exists) {
        this.triggerAdded(new File({ path }), "movie");
      } else {
        this.triggerDeleted(new File({ path }), "movie");
      }
    });
  }

  protected async initializeShow() {
    const logger = useLog(DiskFileWatcher.name);
    const showDir = this.environmentHelper.get("FILE_WATCHER_SHOW_DIR");

    const showWatcher = fs.watch(showDir, {
      recursive: true,
    });
    logger.info("Watching show directory", showDir);

    showWatcher.on("change", (event, filename) => {
      if (filename instanceof Buffer || event !== "rename") {
        return;
      }
      const path = join(showDir, filename);
      const exists = fs.existsSync(path);

      if (exists) {
        this.triggerAdded(new File({ path }), "show");
      } else {
        this.triggerDeleted(new File({ path }), "show");
      }
    });
  }

  protected async initialize() {
    if (
      this.environmentHelper.get("FILE_WATCHER_SHOW_DIR") ===
      this.environmentHelper.get("FILE_WATCHER_MOVIE_DIR")
    ) {
      throw new CannotWatchSameDirectory(
        this.environmentHelper.get("FILE_WATCHER_SHOW_DIR")
      );
    }

    await Promise.all([this.initializeMovie(), this.initializeShow()]);
  }

  public async scanMovie(dir: string | undefined = undefined): Promise<void> {
    const movieDir =
      dir ?? this.environmentHelper.get("FILE_WATCHER_MOVIE_DIR");

    for (const entry of fs.readdirSync(movieDir)) {
      const path = join(movieDir, entry);
      const stat = fs.statSync(path);
      if (stat.isDirectory()) {
        return this.scanMovie(path);
      }
      if (stat.isFile()) {
        this.triggerAdded(new File({ path: path }), "movie");
      }
    }
  }

  public async scanShow(dir: string | undefined = undefined): Promise<void> {
    const showDir = dir ?? this.environmentHelper.get("FILE_WATCHER_SHOW_DIR");

    for (const entry of fs.readdirSync(showDir)) {
      const path = join(showDir, entry);
      const stat = fs.statSync(path);
      if (stat.isDirectory()) {
        return this.scanShow(path);
      }
      if (stat.isFile()) {
        this.triggerAdded(new File({ path: path }), "show");
      }
    }
  }

  public async scan() {
    await Promise.all([this.scanMovie(), this.scanShow()]);
  }

  protected async checkExistence(file: HierarchyItemId) {
    return fs.existsSync(file.toString());
  }
}
