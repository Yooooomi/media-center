import {
  MovieCatalogEntryDatasetFulfilled,
  ShowCatalogEntryDatasetFulfilled,
  ShowCatalogEntryFulfilled,
} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';
import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import {ShowSeason} from '@media-center/server/src/domains/tmdb/domain/showSeason';
import {TmdbId} from '@media-center/server/src/domains/tmdb/domain/tmdbId';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import {useLocation} from 'react-router-native';
import {useBack} from '../services/useBack';
import {BackHandler} from 'react-native';

export interface PlaylistItem<T extends 'show' | 'movie'> {
  progress: number;
  dataset: T extends 'show'
    ? ShowCatalogEntryDatasetFulfilled
    : MovieCatalogEntryDatasetFulfilled;
}

export interface Playlist<T extends 'show' | 'movie'> {
  tmdbId: TmdbId;
  items: PlaylistItem<T>[];
}

export type NavigationParams = {
  Discover: undefined;
  Library: undefined;
  Movie: {movie: Movie};
  Show: {show: Show};
  ShowSeason: {
    show: Show;
    season: ShowSeason;
    catalogEntry: ShowCatalogEntryFulfilled;
  };
  Watch: {
    name: string;
    playlist: Playlist<any>;
    startingPlaylistIndex: number;
  };
  Search: undefined;
  SearchTmdb: undefined;
  SearchTorrent: undefined;
  Movies: undefined;
  Shows: undefined;
  Settings: undefined;
};

export const paths: Record<keyof NavigationParams, string> = {
  Library: '/',
  Discover: '/discover',
  Movie: '/movie',
  Show: '/show',
  ShowSeason: '/show/season',
  Watch: '/watch',
  Search: '/search',
  SearchTmdb: '/search_tmdb',
  SearchTorrent: '/search_torrent',
  Movies: '/movies',
  Shows: '/shows',
  Settings: '/settings',
};

export function useParams<K extends keyof NavigationParams>() {
  return useLocation().state as NavigationParams[K];
}

interface HistoryItem {
  pathname: string;
  params: Record<string, any> | undefined;
  key: string;
}

interface NavigationContext {
  add: (item: HistoryItem) => void;
  pop: () => void;
}

export const NavigationContext = React.createContext<NavigationContext>(
  {} as any,
);

export function useNavigationContext() {
  const [history, setHistory] = useState<HistoryItem[]>([
    {pathname: paths.Library, params: {}, key: 'default'},
  ]);

  const add = useCallback((item: HistoryItem) => {
    setHistory(old => {
      return [...old.filter(o => o.pathname !== item.pathname), item];
    });
  }, []);

  const pop = useCallback(() => {
    setHistory(old => {
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

  useBack(
    useCallback(() => {
      pop();
      return true;
    }, [pop]),
  );

  return {value, currentRoute: history[history.length - 1]!};
}

let uniqueId = 0;

export function useNavigate() {
  const {add, pop} = useContext(NavigationContext);

  return {
    navigate: useCallback(
      <K extends keyof NavigationParams>(
        path: K,
        params: NavigationParams[K] extends undefined
          ? void
          : NavigationParams[K],
      ) => {
        add({
          pathname: paths[path],
          params: params ?? undefined,
          key: (uniqueId++).toString(),
        });
      },
      [add],
    ),
    goBack: pop,
  };
}
