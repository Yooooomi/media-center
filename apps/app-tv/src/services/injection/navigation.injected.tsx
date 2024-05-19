import {
  NativeRouter as NativeRouter,
  Route as NativeRoute,
  Routes as NativeRoutes,
  useLocation,
} from "react-router-native";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
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
import { withLayout } from "@media-center/frontend/src/services/hocs/withLayout";
import { BackHandler } from "react-native";

export interface HistoryItem {
  pathname: string;
  params: Record<string, any> | undefined;
  key: string;
}

interface NavigationContext {
  history: HistoryItem[];
  add: (item: HistoryItem) => void;
  setParam: (name: string, value: any) => void;
  pop: () => void;
}

export const NavigationContext = createContext<NavigationContext>({} as any);

export function useNavigationContext() {
  const [history, setHistory] = useState<HistoryItem[]>([
    { pathname: paths.Library, params: undefined, key: "default" },
  ]);

  const add = useCallback((item: HistoryItem) => {
    setHistory((old) => {
      return [...old.filter((o) => o.pathname !== item.pathname), item];
    });
  }, []);

  const pop = useCallback(() => {
    setHistory((old) => {
      if (old.length === 1) {
        BackHandler.exitApp();
        return old;
      }
      return old.slice(0, -1);
    });
  }, []);

  const setParam = useCallback((name: string, value: any) => {
    setHistory((h) => {
      const lastItem = h.at(-1);
      if (!lastItem) {
        return h;
      }
      lastItem.params = {
        ...lastItem.params,
        [name]: value,
      };
      return [...h];
    });
  }, []);

  const value = useMemo<NavigationContext>(
    () => ({
      add,
      pop,
      history,
      setParam,
    }),
    [add, history, pop, setParam],
  );

  return { value };
}

export function Routes(_props: RoutesProps) {
  const { history, pop } = useContext(NavigationContext);

  useBack(
    useCallback(() => {
      pop();
      return true;
    }, [pop]),
  );

  const lastItem = history[history.length - 1]!;

  const content = useMemo(
    () => (
      <>
        <NativeRoute
          path={paths.Library}
          Component={withLayout(AddedRecently)}
        />
        <NativeRoute path={paths.Discover} Component={withLayout(Discover)} />
        <NativeRoute path={paths.Movie} Component={withLayout(Movie)} />
        <NativeRoute path={paths.Show} Component={withLayout(Show)} />
        <NativeRoute path={paths.Watch} Component={Watch} />
        <NativeRoute path={paths.Search} Component={withLayout(Search)} />
        <NativeRoute
          path={paths.SearchTmdb}
          Component={withLayout(SearchTmdb)}
        />
        <NativeRoute
          path={paths.SearchTorrent}
          Component={withLayout(SearchTorrent)}
        />
        <NativeRoute path={paths.Movies} Component={withLayout(Movies)} />
        <NativeRoute path={paths.Shows} Component={withLayout(Shows)} />
        <NativeRoute path={paths.Settings} Component={withLayout(Settings)} />
      </>
    ),
    [],
  );

  return (
    <NativeRoutes
      location={{
        pathname: lastItem.pathname,
        state: lastItem.params,
      }}
    >
      {content}
    </NativeRoutes>
  );
}

export function Router({ children }: RouterProps) {
  const { value } = useNavigationContext();

  const content = useMemo(
    () => <NativeRouter>{children}</NativeRouter>,
    [children],
  );

  return (
    <NavigationContext.Provider value={value}>
      {content}
    </NavigationContext.Provider>
  );
}

export function useParams<K extends keyof NavigationParams>() {
  const state = useLocation().state as NavigationParams[K];
  const { setParam } = useContext(NavigationContext);

  return useMemo(
    () => ({
      ...state,
      setParam: (name: string, value: any) => {
        setParam(name, value);
      },
    }),
    [setParam, state],
  );
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
