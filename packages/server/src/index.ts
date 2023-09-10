import { globalBoot } from "./domains/boot";
import { ScanExisting } from "./domains/fileWatcher/applicative/scanExisting.command";

async function main() {
  const { commandBus } = await globalBoot();
  commandBus.execute(new ScanExisting());
}

main();
