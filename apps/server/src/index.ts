import { ScanExistingCommand } from "@media-center/domains/src/fileWatcher/applicative/scanExisting.command";
import { globalBoot } from "./boot";

async function main() {
  const { environmentHelper, commandBus } = await globalBoot();
  const shouldReconcileDatabaseAndDisk = environmentHelper.getSafe(
    "RECONCILE_DATABASE_ON_START",
  );
  if (shouldReconcileDatabaseAndDisk?.toLowerCase().trim() !== "no") {
    commandBus.execute(new ScanExistingCommand());
  }
}

main();
