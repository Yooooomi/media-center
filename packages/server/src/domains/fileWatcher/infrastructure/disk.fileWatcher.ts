import { File } from "../../../framework/valueObjects/file";
import { FileWatcher } from "../applicative/fileWatcher";
import * as fs from "fs";
import { join, extname } from "path";
import { HierarchyStore } from "../applicative/hierarchy.store";
import { EnvironmentHelper } from "../../environment/applicative/environmentHelper";
import {
  InfrastructureError,
  EventBus,
  useLog,
} from "@media-center/domain-driven";
import { FileType } from "../applicative/fileWatcher.events";

class CannotWatchSameDirectory extends InfrastructureError {
  constructor(dirname: string) {
    super(
      `Cannot watch same directory, determination of movie and show is based on their location (received: ${dirname})`
    );
  }
}

class CannotWatchNonExistingDirectory extends InfrastructureError {
  constructor(path: string) {
    super(`Tried to create directory at ${path}, but parent does not exist`);
  }
}

export class DiskFileWatcher extends FileWatcher {
  static logger = useLog(DiskFileWatcher.name);

  constructor(
    eventBus: EventBus,
    hierarchyStore: HierarchyStore,
    private readonly environmentHelper: EnvironmentHelper
  ) {
    super(eventBus, hierarchyStore);
  }

  static ensureExists(path: string) {
    try {
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
        DiskFileWatcher.logger.info(`Created ${path} as it did not exist`);
      }
    } catch (e) {
      throw new CannotWatchNonExistingDirectory(path);
    }
  }

  private onFileChange(dir: string, type: FileType) {
    return (event: string, filename: string | Buffer) => {
      if (filename instanceof Buffer || event !== "rename") {
        return;
      }
      const path = join(dir, filename);
      const exists = fs.existsSync(path);

      if (exists) {
        const stat = fs.statSync(path);

        if (stat.isFile() && DiskFileWatcher.isValidVideoFile(path)) {
          this.triggerAdded(new File({ path }), type);
        } else if (stat.isDirectory()) {
          if (type === "show") {
            this.scanShow(path);
          } else if (type === "movie") {
            this.scanMovie(path);
          }
        }
      } else {
        this.triggerDeleted(new File({ path }), type);
      }
    };
  }

  protected async initializeMovie() {
    const movieDir = this.environmentHelper.get("FILE_WATCHER_MOVIE_DIR");

    DiskFileWatcher.ensureExists(movieDir);

    const movieWatcher = fs.watch(movieDir, {
      recursive: true,
    });
    DiskFileWatcher.logger.info("Watching movie directory", movieDir);

    movieWatcher.on("change", this.onFileChange(movieDir, "movie"));
  }

  protected async initializeShow() {
    const logger = useLog(DiskFileWatcher.name);
    const showDir = this.environmentHelper.get("FILE_WATCHER_SHOW_DIR");

    DiskFileWatcher.ensureExists(showDir);

    const showWatcher = fs.watch(showDir, {
      recursive: true,
    });
    logger.info("Watching show directory", showDir);

    showWatcher.on("change", this.onFileChange(showDir, "show"));
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

  private static validVideoExtensions = ["avi", "mkv", "mp4"];

  private static isValidVideoFile(filepath: string) {
    const extension = extname(filepath).slice(1);
    return DiskFileWatcher.validVideoExtensions.includes(extension);
  }

  private scanMovie(dir: string | undefined = undefined) {
    const movieDir =
      dir ?? this.environmentHelper.get("FILE_WATCHER_MOVIE_DIR");

    for (const entry of fs.readdirSync(movieDir)) {
      const path = join(movieDir, entry);
      const stat = fs.statSync(path);
      if (stat.isDirectory()) {
        this.scanMovie(path);
      }
      if (stat.isFile() && DiskFileWatcher.isValidVideoFile(path)) {
        this.triggerAdded(new File({ path }), "movie");
      }
    }
  }

  private scanShow(dir: string | undefined = undefined) {
    const showDir = dir ?? this.environmentHelper.get("FILE_WATCHER_SHOW_DIR");

    for (const entry of fs.readdirSync(showDir)) {
      const path = join(showDir, entry);
      const stat = fs.statSync(path);
      if (stat.isDirectory()) {
        this.scanShow(path);
      }
      if (stat.isFile() && DiskFileWatcher.isValidVideoFile(path)) {
        this.triggerAdded(new File({ path }), "show");
      }
    }
  }

  public async scan() {
    this.scanMovie();
    this.scanShow();
  }

  protected async checkExistence(file: File) {
    return fs.existsSync(file.path);
  }
}
