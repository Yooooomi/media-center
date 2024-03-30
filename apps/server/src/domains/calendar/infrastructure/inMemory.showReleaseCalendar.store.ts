import {
  Database,
  InMemoryStore,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { ShowReleaseCalendar } from "@media-center/domains/src/calendar/domain/showReleaseCalendar";

export class InMemoryShowReleaseCalendarStore extends InMemoryStore<ShowReleaseCalendar> {
  constructor(database: Database) {
    super(
      database,
      "showReleaseCalendar",
      new SerializableSerializer(ShowReleaseCalendar),
    );
  }
}
