import {
  Database,
  SQLiteStore,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { HierarchyEntryInformation } from "@media-center/domains/src/hierarchyEntryInformation/domain/hierarchyEntryInformation";

export class SQLiteHierarchyEntryInformationStore extends SQLiteStore<HierarchyEntryInformation> {
  constructor(database: Database) {
    super(
      database,
      "hierarchyEntryInformation",
      new SerializableSerializer(HierarchyEntryInformation),
    );
  }
}
