import {NativeRouter, Route, Routes} from 'react-router-native';
import Discover from './discover';
import {Movie} from './movie/movie';
import {PortalProvider} from '@gorhom/portal';
import {DEFAULT_HOSTNAME} from '../components/portal/portal';
import {PortalHost} from '../components/portal';
import {StyleSheet, View} from 'react-native';
import BackHandler from './backHandler';
import Watch from './watch/watch';
import {Show} from './show/show';
import AddedRecently from './addedRecently/addedRecently';
import {NavigationContext, paths, useNavigationContext} from './params';
import ShowSeason from './showSeason';
import {Search} from './search';
import SearchTorrent from './searchTorrent';
import AlertProvider from '../components/alert/alertProvider';
import {color} from '../services/constants';
import {withSider} from '../services/withSider';
import Movies from './movies/movies';
import Shows from './shows/shows';
import {SearchTmdb} from './searchTmdb';
import {useLocalUserProfileContext} from '../services/local/localUserProfile';
import FullScreenLoading from '../components/fullScreenLoading';
import {ChooseUser} from './chooseUser';
import {ConfigureServer} from './configureServer';

export default function Navigation() {
  const {value, currentRoute} = useNavigationContext();
  const localUser = useLocalUserProfileContext();

  if (!localUser.user) {
    return <FullScreenLoading />;
  }

  if (!localUser.user?.serverAddress || !localUser.user?.serverPassword) {
    return (
      <ConfigureServer
        onConfigured={(address, password) => {
          localUser.user?.setServerAddress(address);
          localUser.user?.setServerPassword(password);
          localUser.saveUser().catch(console.error);
        }}
      />
    );
  }

  if (!localUser.declaredUsers) {
    return <FullScreenLoading />;
  }

  if (!localUser.user.user) {
    return (
      <ChooseUser
        declaredUsers={localUser.declaredUsers}
        chooseUser={selected => {
          localUser.user?.setUser(selected);
          localUser.saveUser().catch(console.error);
        }}
      />
    );
  }

  return (
    <View style={styles.root}>
      <PortalProvider rootHostName={DEFAULT_HOSTNAME} shouldAddRootHost={false}>
        <NativeRouter>
          <AlertProvider>
            <NavigationContext.Provider value={value}>
              <BackHandler />
              <Routes
                location={{
                  pathname: currentRoute.pathname,
                  state: currentRoute.params,
                }}>
                <Route
                  path={paths.Library}
                  Component={withSider(AddedRecently)}
                />
                <Route path={paths.Discover} Component={withSider(Discover)} />
                <Route path={paths.Movie} Component={withSider(Movie)} />
                <Route path={paths.Show} Component={withSider(Show)} />
                <Route path={paths.Watch} Component={Watch} />
                <Route
                  path={paths.ShowSeason}
                  Component={withSider(ShowSeason)}
                />
                <Route path={paths.Search} Component={withSider(Search)} />
                <Route
                  path={paths.SearchTmdb}
                  Component={withSider(SearchTmdb)}
                />
                <Route
                  path={paths.SearchTorrent}
                  Component={withSider(SearchTorrent)}
                />
                <Route path={paths.Movies} Component={withSider(Movies)} />
                <Route path={paths.Shows} Component={withSider(Shows)} />
              </Routes>
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
