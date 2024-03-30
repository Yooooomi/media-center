import { Optional, Shape } from "@media-center/domain-driven";
import { TmdbId } from "../../tmdb/domain/tmdbId";

export class ShowReleaseCalendarItem extends Shape({
  season: Number,
  episode: Optional(Number),
  releaseDate: Date,
}) {}

export class ShowReleaseCalendar extends Shape({
  id: TmdbId,
  calendar: [ShowReleaseCalendarItem],
}) {
  addCalendarItem(showReleaseCalendarItem: ShowReleaseCalendarItem) {
    const alreadyExisting = this.calendar.findIndex(
      (calendarItem) =>
        calendarItem.season === showReleaseCalendarItem.season &&
        calendarItem.episode === showReleaseCalendarItem.episode,
    );
    if (alreadyExisting >= 0) {
      this.calendar.splice(alreadyExisting, 1);
    }
    this.calendar.push(showReleaseCalendarItem);
  }
}
