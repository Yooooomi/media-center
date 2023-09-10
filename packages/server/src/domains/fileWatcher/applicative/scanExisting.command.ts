import { Command, CommandHandler } from "../../../framework/command";
import { FileWatcher } from "./fileWatcher";

export class ScanExisting extends Command({}) {}

export class ScanExistingCommandHandler extends CommandHandler(ScanExisting) {
  constructor(private readonly fileWatcher: FileWatcher) {
    super();
  }

  async execute(command: ScanExisting) {
    await this.fileWatcher.scan();
  }
}
