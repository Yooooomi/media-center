import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import {useNavigate as RRNuseNavigate, useLocation} from 'react-router-native';

export type NavigationParams = {
  Home: undefined;
  Movie: {movie: Movie};
};

const paths: Record<keyof NavigationParams, string> = {
  Home: '/',
  Movie: '/movie',
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
