import {NativeRouter, Route, Routes} from 'react-router-native';
import Home from './home/home';
import MovieScreen from './movie/movie';
import {PortalProvider} from '@gorhom/portal';
import {DEFAULT_HOSTNAME} from '../components/portal/portal';
import {PortalHost} from '../components/portal';
import {StyleSheet} from 'react-native';

export default function Navigation() {
  return (
    <>
      <PortalProvider rootHostName={DEFAULT_HOSTNAME} shouldAddRootHost={false}>
        <NativeRouter>
          <Routes>
            <Route path="/" Component={Home} />
            <Route path="/movie" Component={MovieScreen} />
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
