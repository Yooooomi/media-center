import { Command, CommandHandler, Intent } from "@media-center/domain-driven";
import { FileWatcher } from "./fileWatcher";

export class ScanExistingCommand extends Command() {}

export class ScanExistingCommandHandler extends CommandHandler(
  ScanExistingCommand,
) {
  constructor(private readonly fileWatcher: FileWatcher) {
    super();
  }

  async execute() {
    await this.fileWatcher.scan();
  }
}
