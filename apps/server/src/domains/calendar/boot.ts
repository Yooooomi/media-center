import {
  CommandBus,
  Database,
  InMemoryPoll,
} from "@media-center/domain-driven";
import { PopulateNewestCalendarCommandHandler } from "@media-center/domains/src/calendar/applicative/populateNewestCalendar.command";
import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";
import { TmdbAPI } from "@media-center/domains/src/tmdb/applicative/tmdb.api";
import { PopulateNewestCalendarPoll } from "@media-center/domains/src/calendar/applicative/populateNewestCalendar.poll";
import { TVMazeCalendarAPI } from "./infrastructure/tvmaze.calendar.api";
import { InMemoryShowReleaseCalendarStore } from "./infrastructure/inMemory.showReleaseCalendar.store";
import { FilesystemShowReleaseCalendarStore } from "./infrastructure/filesystem.showReleaseCalendar.store";
import { SqliteShowReleaseCalendarStore } from "./infrastructure/sqlite.showReleaseCalendar.store";
import { MockCalendarAPI } from "./infrastructure/mock.calendar.api";

export function bootCalendar(
  database: Database,
  environmentHelper: EnvironmentHelper,
  commandBus: CommandBus,
  tmdbApi: TmdbAPI,
) {
  const calendarApi = environmentHelper.match("DI_CALENDAR_API", {
    tvmaze: () => new TVMazeCalendarAPI(),
    mock: () => new MockCalendarAPI(),
  });
  const showReleaseCalendarStore = environmentHelper.match("DI_DATABASE", {
    memory: () => new InMemoryShowReleaseCalendarStore(database),
    filesystem: () =>
      new FilesystemShowReleaseCalendarStore(environmentHelper, database),
    sqlite: () => new SqliteShowReleaseCalendarStore(database),
  });

  commandBus.register(
    new PopulateNewestCalendarCommandHandler(
      calendarApi,
      tmdbApi,
      showReleaseCalendarStore,
    ),
  );

  new InMemoryPoll(new PopulateNewestCalendarPoll(commandBus)).poll();

  return { calendarApi, showReleaseCalendarStore };
}
