import { ShowReleaseCalendar } from "@media-center/domains/src/calendar/domain/showReleaseCalendar";
import { Database, SerializableSerializer } from "@media-center/domain-driven";
import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";
import { FilesystemStore } from "../../../framework/store";

export class FilesystemShowReleaseCalendarStore extends FilesystemStore<ShowReleaseCalendar> {
  constructor(environmentHelper: EnvironmentHelper, database: Database) {
    super(
      environmentHelper,
      database,
      "showReleaseCalendar",
      new SerializableSerializer(ShowReleaseCalendar),
    );
  }
}
