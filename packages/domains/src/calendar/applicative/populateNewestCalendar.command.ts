import { Command, CommandHandler } from "@media-center/domain-driven";
import { TmdbAPI } from "../../tmdb/applicative/tmdb.api";
import {
  ShowReleaseCalendar,
  ShowReleaseCalendarItem,
} from "../domain/showReleaseCalendar";
import { CalendarAPI } from "./calendar.api";
import { ShowReleaseCalendarStore } from "./showReleaseCalendar.store";

export class PopulateNewestCalendarCommand extends Command(
  undefined,
  undefined,
) {}

export class PopulateNewestCalendarCommandHandler extends CommandHandler(
  PopulateNewestCalendarCommand,
) {
  constructor(
    private readonly calendarApi: CalendarAPI,
    private readonly tmdbApi: TmdbAPI,
    private readonly showReleaseCalendarStore: ShowReleaseCalendarStore,
  ) {
    super();
  }

  async execute() {
    const newestCalendar = await this.calendarApi.get();
    const allIdsReferenced = newestCalendar.getAllDifferentIds();
    const allTmdbs = await this.tmdbApi.getFromExternalIds(allIdsReferenced);

    for (const tmdb of allTmdbs) {
      const items = newestCalendar.getItemsConcerning(tmdb.findWith);
      const showReleaseCalendar =
        (await this.showReleaseCalendarStore.load(tmdb.tmdb.id)) ??
        new ShowReleaseCalendar({
          id: tmdb.tmdb.id,
          calendar: [],
        });

      for (const calendarItem of items) {
        showReleaseCalendar.addCalendarItem(
          new ShowReleaseCalendarItem({
            season: calendarItem.season,
            episode: calendarItem.episode,
            releaseDate: calendarItem.releaseDate,
          }),
        );
      }
      await this.showReleaseCalendarStore.save(showReleaseCalendar);
    }
  }
}
