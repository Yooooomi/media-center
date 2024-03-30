import {
  NativeRouter as NativeRouter,
  Route as NativeRoute,
  Routes as NativeRoutes,
  useLocation,
} from "react-router-native";
import { useContext, useCallback } from "react";
import { withSider } from "../services/hocs/withSider.web";
import {
  RouteProps,
  RouterProps,
  RoutesProps,
} from "./navigation.native.props";
import { NavigationParams, NavigationContext, paths } from "./params";
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

export function Route({ component, path }: RouteProps) {
  return <NativeRoute path={path} Component={component} />;
}

export function Routes({ location }: RoutesProps) {
  return (
    <NativeRoutes
      location={{
        pathname: location.pathname,
        state: location.params,
      }}
    >
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
  return useLocation().state as NavigationParams[K];
}

let uniqueId = 0;

export function useNavigate() {
  const { add, pop } = useContext(NavigationContext);

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
