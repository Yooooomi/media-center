import {
  BrowserRouter as NativeRouter,
  Route as NativeRoute,
  Routes as NativeRoutes,
  useLocation,
  useNavigate as useNativeNavigate,
  Navigate,
} from "react-router-dom";

import { useCallback, useMemo } from "react";
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
import { withLayout } from "@media-center/frontend/src/services/hocs/withLayout";
import { FloatingTree } from "@floating-ui/react";

export function Routes(_props: RoutesProps) {
  return (
    <NativeRoutes>
      <NativeRoute path={paths.Library} Component={withLayout(AddedRecently)} />
      <NativeRoute path={paths.Discover} Component={withLayout(Discover)} />
      <NativeRoute path={paths.Movie} Component={withLayout(Movie)} />
      <NativeRoute path={paths.Show} Component={withLayout(Show)} />
      <NativeRoute path={paths.Watch} Component={Watch} />
      <NativeRoute path={paths.Search} Component={withLayout(Search)} />
      <NativeRoute path={paths.SearchTmdb} Component={withLayout(SearchTmdb)} />
      <NativeRoute
        path={paths.SearchTorrent}
        Component={withLayout(SearchTorrent)}
      />
      <NativeRoute path={paths.Movies} Component={withLayout(Movies)} />
      <NativeRoute path={paths.Shows} Component={withLayout(Shows)} />
      <NativeRoute path={paths.Settings} Component={withLayout(Settings)} />
      <NativeRoute path="*" element={<Navigate to={paths.Library} />} />
    </NativeRoutes>
  );
}

export function Router({ children }: RouterProps) {
  return (
    <FloatingTree>
      <NativeRouter>{children}</NativeRouter>
    </FloatingTree>
  );
}

export function useParams<K extends keyof NavigationParams>() {
  const { search: state, pathname } = useLocation();
  const { navigate } = useNavigate();

  const paramsObject = new URLSearchParams(state);
  const params = Object.fromEntries(
    paramsObject.entries(),
  ) as NavigationParams[K];

  return useMemo(
    () => ({
      ...params,
      setParam: (name: string, value: any) => {
        navigate(
          pathname as keyof NavigationParams,
          {
            ...params,
            [name]: value,
          } as any,
        );
      },
    }),
    [navigate, params, pathname],
  );
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
