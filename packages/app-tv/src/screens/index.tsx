import {NativeRouter, Route, Routes} from 'react-router-native';
import {Discover} from './discover';
import {Movie} from './movie/movie';
import {PortalProvider} from '@gorhom/portal';
import {DEFAULT_HOSTNAME} from '../components/portal/portal';
import {PortalHost} from '../components/portal';
import {StyleSheet, View} from 'react-native';
import {Watch} from './watch/watch';
import {Show} from './show/show';
import {AddedRecently} from './addedRecently/addedRecently';
import {NavigationContext, paths, useNavigationContext} from './params';
import {Search} from './search';
import {SearchTorrent} from './searchTorrent';
import {AlertProvider} from '../components/alert/alertProvider';
import {withSider} from '../services/withSider';
import {Movies} from './movies/movies';
import {Shows} from './shows/shows';
import {SearchTmdb} from './searchTmdb';
import {Settings} from './settings';
import {LocalUserContextProvider} from '../services/local/localUserProfile';
import {useMemo} from 'react';

export function Navigation() {
  const {value, currentRoute} = useNavigationContext();

  const routes = useMemo(
    () => (
      <Routes
        location={{
          pathname: currentRoute.pathname,
          state: currentRoute.params,
        }}>
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
      </Routes>
    ),
    [currentRoute.params, currentRoute.pathname],
  );

  return (
    <View style={styles.root}>
      <PortalProvider rootHostName={DEFAULT_HOSTNAME} shouldAddRootHost={false}>
        <NativeRouter>
          <AlertProvider>
            <NavigationContext.Provider value={value}>
              <LocalUserContextProvider>{routes}</LocalUserContextProvider>
            </NavigationContext.Provider>
          </AlertProvider>
        </NativeRouter>
        <PortalHost
          style={StyleSheet.absoluteFillObject}
          name={DEFAULT_HOSTNAME}
        />
      </PortalProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
  },
});
