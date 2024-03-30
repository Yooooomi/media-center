import {
  Database,
  SQLiteStore,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { ShowReleaseCalendar } from "@media-center/domains/src/calendar/domain/showReleaseCalendar";

export class SqliteShowReleaseCalendarStore extends SQLiteStore<ShowReleaseCalendar> {
  constructor(database: Database) {
    super(
      database,
      "showReleaseCalendar",
      new SerializableSerializer(ShowReleaseCalendar),
    );
  }
}
