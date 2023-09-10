import {HierarchyItem} from '@media-center/server/src/domains/fileWatcher/domain/hierarchyItem';
import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import {useNavigate as RRNuseNavigate, useLocation} from 'react-router-native';

export type NavigationParams = {
  Home: undefined;
  Movie: {movie: Movie};
  Show: {show: Show};
  Watch: {hierarchyItem: HierarchyItem};
};

const paths: Record<keyof NavigationParams, string> = {
  Home: '/',
  Movie: '/movie',
  Show: '/show',
  Watch: '/watch',
};

export function useNavigate() {
  const navigate = RRNuseNavigate();
  return <K extends keyof NavigationParams>(
    path: K,
    params: NavigationParams[K],
  ) =>
    navigate(paths[path], {
      state: params,
    });
}

export function useParams<K extends keyof NavigationParams>() {
  return useLocation().state as NavigationParams[K];
}
