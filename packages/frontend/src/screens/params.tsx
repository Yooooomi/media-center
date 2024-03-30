import { createContext, useCallback, useMemo, useState } from "react";
import { BackHandler } from "react-native";

export type NavigationParams = {
  Discover: undefined;
  Library: undefined;
  Movie: { movieId: string };
  Show: { showId: string };
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

export interface HistoryItem {
  pathname: string;
  params: Record<string, any> | undefined;
  key: string;
}

interface NavigationContext {
  add: (item: HistoryItem) => void;
  pop: () => void;
}

export const NavigationContext = createContext<NavigationContext>({} as any);

export function useNavigationContext() {
  const [history, setHistory] = useState<HistoryItem[]>([
    { pathname: paths.Library, params: {}, key: "default" },
  ]);

  const add = useCallback((item: HistoryItem) => {
    setHistory((old) => {
      return [...old.filter((o) => o.pathname !== item.pathname), item];
    });
  }, []);

  const pop = useCallback(() => {
    setHistory((old) => {
      if (old.length === 1) {
        BackHandler.exitApp();
        return old;
      }
      return old.slice(0, -1);
    });
  }, []);

  const value = useMemo<NavigationContext>(
    () => ({
      add,
      pop,
    }),
    [add, pop],
  );

  return { value, currentRoute: history[history.length - 1]! };
}
