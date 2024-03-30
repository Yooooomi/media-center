import { CalendarAPI } from "@media-center/domains/src/calendar/applicative/calendar.api";
import {
  Calendar,
  CalendarItem,
  ImdbId,
  TheTVDBId,
} from "@media-center/domains/src/calendar/domain/calendar";
import Axios from "axios";

export type TVMazeResult = TVMazeResultItem[];

export interface TVMazeResultItem {
  id: number;
  url: string;
  name: string;
  season: number;
  number?: number;
  type: string;
  airdate: string;
  airtime: string;
  airstamp: string;
  runtime?: number;
  rating: Rating;
  image?: Image;
  summary?: string;
  _links: Links;
  _embedded: Embedded;
}

export interface Rating {
  average?: number;
}

export interface Image {
  medium: string;
  original: string;
}

export interface Links {
  self: Self;
  show: LinkItem;
}

export interface Self {
  href: string;
}

export interface LinkItem {
  href: string;
  name: string;
}

export interface Embedded {
  show: Show;
}

export interface Show {
  id: number;
  url: string;
  name: string;
  type: string;
  language?: string;
  genres: string[];
  status: string;
  runtime?: number;
  averageRuntime?: number;
  premiered: string;
  ended?: string;
  officialSite?: string;
  schedule: Schedule;
  rating: Rating;
  weight: number;
  network?: Network;
  webChannel?: WebChannel;
  dvdCountry?: Country;
  externals: {
    tvrage?: number;
    thetvdb?: number;
    imdb?: string;
  };
  image?: {
    medium: string;
    original: string;
  };
  summary?: string;
  updated: number;
  _links: Links2;
}

export interface Schedule {
  time: string;
  days: string[];
}

export interface Network {
  id: number;
  name: string;
  country: Country;
  officialSite?: string;
}

export interface Country {
  name: string;
  code: string;
  timezone: string;
}

export interface WebChannel {
  id: number;
  name: string;
  country?: Country;
  officialSite?: string;
}

export interface Links2 {
  self: {
    href: string;
  };
  previousepisode?: LinkItem;
  nextepisode?: LinkItem;
}

export class TVMazeCalendarAPI extends CalendarAPI {
  async get() {
    const { data } = await Axios.get<TVMazeResult>(
      "https://api.tvmaze.com/schedule/full",
    );
    return new Calendar({
      items: data.reduce<CalendarItem[]>((acc, d) => {
        let id: ImdbId | TheTVDBId | undefined;

        if (d._embedded.show.externals.imdb) {
          id = new ImdbId(d._embedded.show.externals.imdb.toString());
        } else if (d._embedded.show.externals.thetvdb) {
          id = new TheTVDBId(d._embedded.show.externals.thetvdb.toString());
        }

        if (!id) {
          return acc;
        }

        acc.push(
          new CalendarItem({
            id,
            season: d.season,
            episode: d.number,
            releaseDate: new Date(d.airstamp),
          }),
        );
        return acc;
      }, []),
    });
  }
}
