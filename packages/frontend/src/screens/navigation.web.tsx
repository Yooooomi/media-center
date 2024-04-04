import {
  BrowserRouter as NativeRouter,
  Route as NativeRoute,
  Routes as NativeRoutes,
  useLocation,
  useNavigate as useNativeNavigate,
} from "react-router-dom";
import { useCallback } from "react";
import { withSider } from "../services/hocs/withSider.web";
import { RouterProps, RoutesProps } from "./navigation.native.props";
import { NavigationParams, paths } from "./params";
import { AddedRecently } from "./addedRecently";
import { Discover } from "./discover";
import { Movie } from "./movie";
import { Movies } from "./movies";
import { SearchTmdb } from "./searchTmdb";
import { SearchTorrent } from "./searchTorrent";
import { Show } from "./show";
import { Shows } from "./shows";
import { Watch } from "./watch";
import { Search } from "./search";
import { Settings } from "./settings";

export function Routes({}: RoutesProps) {
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
