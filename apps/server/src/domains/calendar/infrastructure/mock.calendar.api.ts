import { CalendarAPI } from "@media-center/domains/src/calendar/applicative/calendar.api";
import { Calendar } from "@media-center/domains/src/calendar/domain/calendar";

export class MockCalendarAPI extends CalendarAPI {
  async get() {
    return new Calendar({
      items: [],
    });
  }
}
