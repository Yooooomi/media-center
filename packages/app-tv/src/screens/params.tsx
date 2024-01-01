import {
  CatalogEntryMovieSpecificationFulFilled,
  CatalogEntryShowSpecificationFulFilled,
  ShowCatalogEntryFulfilled,
} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';
import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import {ShowSeason} from '@media-center/server/src/domains/tmdb/domain/showSeason';
import {TmdbId} from '@media-center/server/src/domains/tmdb/domain/tmdbId';
import {
  UserTmdbMovieInfo,
  UserTmdbShowInfo,
} from '@media-center/server/src/domains/userTmdbInfo/domain/userTmdbInfo';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import {useLocation} from 'react-router-native';

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
    tmdbId: TmdbId;
    userInfo: UserTmdbMovieInfo | UserTmdbShowInfo | undefined;
    specification:
      | CatalogEntryShowSpecificationFulFilled
      | CatalogEntryMovieSpecificationFulFilled;
  };
  Search: undefined;
  SearchTmdb: undefined;
  SearchTorrent: undefined;
  Movies: undefined;
  Shows: undefined;
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
};

export function useParams<K extends keyof NavigationParams>() {
  return useLocation().state as NavigationParams[K];
}

interface HistoryItem {
  pathname: string;
  params: Record<string, any> | undefined;
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
    {pathname: paths.Library, params: {}},
  ]);

  const value = useMemo<NavigationContext>(
    () => ({
      add: (item: HistoryItem) => {
        setHistory(old => {
          return [...old.filter(o => o.pathname !== item.pathname), item];
        });
      },
      pop: () => {
        setHistory(old => {
          if (old.length === 1) {
            return old;
          }
          return old.slice(0, -1);
        });
      },
    }),
    [],
  );

  return {value, currentRoute: history[history.length - 1]!};
}

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
        add({pathname: paths[path], params: params ?? undefined});
      },
      [add],
    ),
    goBack: pop,
  };
}
