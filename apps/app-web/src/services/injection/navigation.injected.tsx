import {
  BrowserRouter as NativeRouter,
  Route as NativeRoute,
  Routes as NativeRoutes,
  useLocation,
  useNavigate as useNativeNavigate,
} from "react-router-dom";

import { useCallback } from "react";
import {
  NavigationParams,
  paths,
} from "@media-center/frontend/src/screens/params";
import { AddedRecently } from "@media-center/frontend/src/screens/addedRecently";
import { Discover } from "@media-center/frontend/src/screens/discover";
import { Movie } from "@media-center/frontend/src/screens/movie";
import { Show } from "@media-center/frontend/src/screens/show";
import { Watch } from "@media-center/frontend/src/screens/watch";
import { Search } from "@media-center/frontend/src/screens/search";
import { SearchTmdb } from "@media-center/frontend/src/screens/searchTmdb";
import { SearchTorrent } from "@media-center/frontend/src/screens/searchTorrent";
import { Movies } from "@media-center/frontend/src/screens/movies";
import { Shows } from "@media-center/frontend/src/screens/shows";
import { Settings } from "@media-center/frontend/src/screens/settings";
import {
  RouterProps,
  RoutesProps,
} from "@media-center/frontend/src/screens/navigation.props";
import { withSider } from "@media-center/frontend/src/services/hocs/withSider";

export function Routes(_props: RoutesProps) {
  return (
    <NativeRoutes>
      <NativeRoute path={paths.Library} Component={withSider(AddedRecently)} />
      <NativeRoute path={paths.Discover} Component={withSider(Discover)} />
      <NativeRoute path={paths.Movie} Component={withSider(Movie)} />
      <NativeRoute path={paths.Show} Component={withSider(Show)} />
      <NativeRoute path={paths.Watch} Component={Watch} />
      <NativeRoute path={paths.Search} Component={withSider(Search)} />
      <NativeRoute path={paths.SearchTmdb} Component={withSider(SearchTmdb)} />
      <NativeRoute
        path={paths.SearchTorrent}
        Component={withSider(SearchTorrent)}
      />
      <NativeRoute path={paths.Movies} Component={withSider(Movies)} />
      <NativeRoute path={paths.Shows} Component={withSider(Shows)} />
      <NativeRoute path={paths.Settings} Component={withSider(Settings)} />
    </NativeRoutes>
  );
}

export function Router({ children }: RouterProps) {
  return <NativeRouter>{children}</NativeRouter>;
}

export function useParams<K extends keyof NavigationParams>() {
  const state = useLocation().search;

  const params = new URLSearchParams(state);
  return Object.fromEntries(params.entries()) as NavigationParams[K];
}

export function useNavigate() {
  const navigate = useNativeNavigate();

  return {
    navigate: useCallback(
      <K extends keyof NavigationParams>(
        path: K,
        params: NavigationParams[K] extends undefined
          ? void
          : NavigationParams[K],
      ) => {
        const url = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            url.append(key, value);
          });
        }
        navigate({
          pathname: paths[path],
          search: url.toString(),
        });
      },
      [navigate],
    ),
    goBack: useCallback(() => navigate(-1), [navigate]),
  };
}
