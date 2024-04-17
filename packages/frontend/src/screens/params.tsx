export type NavigationParams = {
  Discover: undefined;
  Library: undefined;
  Movie: { title: string; movieId: string };
  Show: { title: string; showId: string };
  Watch: { hierarchyItemId: string };
  Search: undefined;
  SearchTmdb: undefined;
  SearchTorrent: undefined;
  Movies: undefined;
  Shows: undefined;
  Settings: undefined;
};

type Serializable =
  | {
      [key: string]: string | number | boolean | undefined;
    }
  | undefined;
type EnsureSerializable<T extends Serializable> = T;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type __EnsureNavigationParamsSerializable = EnsureSerializable<
  NavigationParams[keyof NavigationParams]
>;

export const paths: Record<keyof NavigationParams, string> = {
  Library: "/",
  Discover: "/discover",
  Movie: "/movie",
  Show: "/show",
  Watch: "/watch",
  Search: "/search",
  SearchTmdb: "/search_tmdb",
  SearchTorrent: "/search_torrent",
  Movies: "/movies",
  Shows: "/shows",
  Settings: "/settings",
};
