import {NativeRouter, Route, Routes} from 'react-router-native';
import Home from './home/home';
import MovieScreen from './movie/movie';
import {PortalProvider} from '@gorhom/portal';
import {DEFAULT_HOSTNAME} from '../components/portal/portal';
import {PortalHost} from '../components/portal';
import {StyleSheet} from 'react-native';
import BackHandler from './backHandler';
import Watch from './watch/watch';
import ShowScreen from './show/show';
import {useEffect} from 'react';
import {Beta} from '../services/api';
import {TmdbId} from '@media-center/server/src/domains/tmdb/domain/tmdbId';
import {GetEntriesQuery} from '@media-center/server/src/domains/catalog/applicative/getEntries.query';
import {GetEntryQuery} from '@media-center/server/src/domains/catalog/applicative/getEntry.query';

export default function Navigation() {
  return (
    <>
      <PortalProvider rootHostName={DEFAULT_HOSTNAME} shouldAddRootHost={false}>
        <NativeRouter>
          <BackHandler />
          <Routes>
            <Route path="/" Component={Home} />
            <Route path="/movie" Component={MovieScreen} />
            <Route path="/show" Component={ShowScreen} />
            <Route path="/watch" Component={Watch} />
          </Routes>
        </NativeRouter>
        <PortalHost
          style={StyleSheet.absoluteFillObject}
          name={DEFAULT_HOSTNAME}
        />
      </PortalProvider>
    </>
  );
}
