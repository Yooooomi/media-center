import {ShowCatalogEntryFulfilled} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';
import {HierarchyItem} from '@media-center/server/src/domains/fileWatcher/domain/hierarchyItem';
import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import {ShowSeason} from '@media-center/server/src/domains/tmdb/domain/showSeason';
import {useNavigate as RRNuseNavigate, useLocation} from 'react-router-native';

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
  Watch: {hierarchyItem: HierarchyItem};
  Search: undefined;
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
  SearchTorrent: '/search_torrent',
  Movies: '/movies',
  Shows: '/shows',
};

export function useNavigate() {
  const navigate = RRNuseNavigate();
  return <K extends keyof NavigationParams>(
    path: K,
    params: NavigationParams[K] extends undefined ? void : NavigationParams[K],
  ) =>
    navigate(paths[path], {
      state: params,
    });
}

export function useParams<K extends keyof NavigationParams>() {
  return useLocation().state as NavigationParams[K];
}
