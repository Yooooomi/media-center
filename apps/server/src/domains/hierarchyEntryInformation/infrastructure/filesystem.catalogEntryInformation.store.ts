import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";
import { HierarchyEntryInformation } from "@media-center/domains/src/hierarchyEntryInformation/domain/hierarchyEntryInformation";
import {
  InMemoryDatabase,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { FilesystemStore } from "../../../framework/store";

export class FilesystemHierarchyEntryInformationStore extends FilesystemStore<HierarchyEntryInformation> {
  constructor(
    environmentHelper: EnvironmentHelper,
    database: InMemoryDatabase,
  ) {
    super(
      environmentHelper,
      database,
      "hierarchyEntryInformation",
      new SerializableSerializer(HierarchyEntryInformation),
    );
  }
}
