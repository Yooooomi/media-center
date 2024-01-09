import {
  Command,
  CommandHandler,
  EventBus,
  TransactionPerformer,
} from "@media-center/domain-driven";
import { CatalogEntryStore } from "./catalogEntry.store";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { CatalogDeleted } from "./catalog.events";

export class ReinitCatalogCommand extends Command() {}

export class ReinitCatalogCommandHandler extends CommandHandler(
  ReinitCatalogCommand
) {
  constructor(
    private readonly eventBus: EventBus,
    private readonly transactionPerformer: TransactionPerformer,
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly hierarchyStore: HierarchyStore
  ) {
    super();
  }

  async execute() {
    await this.transactionPerformer.transactionnally(async (transaction) => {
      await this.catalogEntryStore.deleteAll(transaction);
      await this.hierarchyStore.deleteAll(transaction);
    });
    this.eventBus.publish(new CatalogDeleted({}));
  }
}
