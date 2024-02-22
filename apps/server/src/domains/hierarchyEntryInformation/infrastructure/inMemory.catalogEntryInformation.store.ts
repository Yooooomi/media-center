import {
  InMemoryDatabase,
  InMemoryStore,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { HierarchyEntryInformation } from "@media-center/domains/src/hierarchyEntryInformation/domain/hierarchyEntryInformation";

export class InMemoryHierarchyEntryInformationStore extends InMemoryStore<HierarchyEntryInformation> {
  constructor(database: InMemoryDatabase) {
    super(
      database,
      "hierarchyEntryInformation",
      new SerializableSerializer(HierarchyEntryInformation)
    );
  }
}
