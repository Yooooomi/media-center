import { globalBoot } from "./domains/boot";
import { ScanExistingCommand } from "./domains/fileWatcher/applicative/scanExisting.command";

async function main() {
  const { environmentHelper, commandBus } = await globalBoot();
  const shouldReconcileDatabaseAndDisk = environmentHelper.getSafe(
    "RECONCILE_DATABASE_ON_START"
  );
  if (shouldReconcileDatabaseAndDisk?.toLowerCase().trim() !== "no") {
    commandBus.execute(new ScanExistingCommand());
  }
}

main();
