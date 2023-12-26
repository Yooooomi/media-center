import { globalBoot } from "./domains/boot";
import { ScanExistingCommand } from "./domains/fileWatcher/applicative/scanExisting.command";

async function main() {
  const { commandBus } = await globalBoot();
  commandBus.execute(new ScanExistingCommand());
}

main();
