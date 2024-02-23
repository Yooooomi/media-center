import { NativeRouter, Route, Routes } from "react-router-native";
import { PortalProvider } from "@gorhom/portal";
import { StyleSheet, View } from "react-native";
import { useMemo } from "react";
import { DEFAULT_HOSTNAME } from "../components/ui/tools/portal/portal";
import { PortalHost } from "../components/ui/tools/portal";
import { AlertProvider } from "../components/ui/tools/alert/alertProvider";
import { withSider } from "../services/hocs/withSider";
import { LocalUserContextProvider } from "../services/localUserProfile";
import { StatusContextProvider } from "../services/contexts/status.context";
import { InjectableContext } from "../services/di/injectableContext";
import { Discover } from "./discover";
import { Movie } from "./movie/movie";
import { Watch } from "./watch/watch";
import { Show } from "./show/show";
import { AddedRecently } from "./addedRecently/addedRecently";
import { NavigationContext, paths, useNavigationContext } from "./params";
import { Search } from "./search";
import { SearchTorrent } from "./searchTorrent";
import { Movies } from "./movies/movies";
import { Shows } from "./shows/shows";
import { SearchTmdb } from "./searchTmdb";
import { Settings } from "./settings";

export function Navigation() {
  const { value, currentRoute } = useNavigationContext();

  const allRoutes = useMemo(
    () => (
      <>
        <Route path={paths.Library} Component={withSider(AddedRecently)} />
        <Route path={paths.Discover} Component={withSider(Discover)} />
        <Route path={paths.Movie} Component={withSider(Movie)} />
        <Route path={paths.Show} Component={withSider(Show)} />
        <Route path={paths.Watch} Component={Watch} />
        <Route path={paths.Search} Component={withSider(Search)} />
        <Route path={paths.SearchTmdb} Component={withSider(SearchTmdb)} />
        <Route
          path={paths.SearchTorrent}
          Component={withSider(SearchTorrent)}
        />
        <Route path={paths.Movies} Component={withSider(Movies)} />
        <Route path={paths.Shows} Component={withSider(Shows)} />
        <Route path={paths.Settings} Component={withSider(Settings)} />
      </>
    ),
    [],
  );

  const routes = useMemo(
    () => (
      <Routes
        location={{
          pathname: currentRoute.pathname,
          state: currentRoute.params,
        }}
      >
        {allRoutes}
      </Routes>
    ),
    [allRoutes, currentRoute.params, currentRoute.pathname],
  );

  return (
    <View style={styles.root}>
      <PortalProvider rootHostName={DEFAULT_HOSTNAME} shouldAddRootHost={false}>
        <NativeRouter>
          <AlertProvider>
            <InjectableContext
              provider={NavigationContext.Provider}
              value={value}
            >
              <LocalUserContextProvider>
                <StatusContextProvider>{routes}</StatusContextProvider>
              </LocalUserContextProvider>
            </InjectableContext>
          </AlertProvider>
        </NativeRouter>
        <PortalHost style={styles.portalHost} name={DEFAULT_HOSTNAME} />
      </PortalProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
  },
  portalHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
});
