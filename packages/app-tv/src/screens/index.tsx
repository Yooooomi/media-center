import {NativeRouter, Route, Routes} from 'react-router-native';
import Discover from './discover';
import MovieScreen from './movie/movie';
import {PortalProvider} from '@gorhom/portal';
import {DEFAULT_HOSTNAME} from '../components/portal/portal';
import {PortalHost} from '../components/portal';
import {StyleSheet, View} from 'react-native';
import BackHandler from './backHandler';
import Watch from './watch/watch';
import ShowScreen from './show/show';
import AddedRecently from './addedRecently/addedRecently';
import {paths} from './params';
import ShowSeason from './showSeason/showSeason';
import Search from './search/search';
import SearchTorrent from './searchTorrent/searchTorrent';
import AlertProvider from '../components/alert/alertProvider';
import {color} from '../services/constants';
import {withSider} from '../services/withSider';
import Movies from './movies/movies';
import Shows from './shows/shows';

export default function Navigation() {
  return (
    <View style={styles.root}>
      <PortalProvider rootHostName={DEFAULT_HOSTNAME} shouldAddRootHost={false}>
        <NativeRouter>
          <AlertProvider>
            <BackHandler />
            <Routes>
              <Route
                path={paths.Library}
                Component={withSider(AddedRecently)}
              />
              <Route path={paths.Discover} Component={withSider(Discover)} />
              <Route path={paths.Movie} Component={withSider(MovieScreen)} />
              <Route path={paths.Show} Component={withSider(ShowScreen)} />
              <Route path={paths.Watch} Component={Watch} />
              <Route
                path={paths.ShowSeason}
                Component={withSider(ShowSeason)}
              />
              <Route path={paths.Search} Component={withSider(Search)} />
              <Route
                path={paths.SearchTorrent}
                Component={withSider(SearchTorrent)}
              />
              <Route path={paths.Movies} Component={withSider(Movies)} />
              <Route path={paths.Shows} Component={withSider(Shows)} />
            </Routes>
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
    backgroundColor: color.background,
  },
});
