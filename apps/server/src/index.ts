import { ScanExistingCommand } from "@media-center/domains/src/fileWatcher/applicative/scanExisting.command";
import { ScanMissingSubtitlesCommand } from "@media-center/domains/src/hierarchyEntryInformation/applicative/scanMissingSubtitles.command";
import { globalBoot } from "./boot";

async function main() {
  const { environmentHelper, commandBus } = await globalBoot();
  const shouldReconcileDatabaseAndDisk = environmentHelper.getSafe(
    "RECONCILE_DATABASE_ON_START",
  );
  if (shouldReconcileDatabaseAndDisk?.toLowerCase().trim() !== "no") {
    await commandBus.execute(new ScanExistingCommand());
  }
  commandBus.execute(new ScanMissingSubtitlesCommand()).catch(console.error);
}

main().catch(console.error);
