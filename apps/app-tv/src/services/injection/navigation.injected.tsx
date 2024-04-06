import {
  NativeRouter as NativeRouter,
  Route as NativeRoute,
  Routes as NativeRoutes,
  useLocation,
} from "react-router-native";

import React, { useCallback, useContext } from "react";
import {
  NavigationContext,
  NavigationParams,
  paths,
} from "@media-center/frontend/src/screens/params";
import { useBack } from "@media-center/frontend/src/services/hooks/useBack";
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

  useBack(() => {
    pop();
    return true;
  });

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
