import {Platform, StyleSheet, View} from 'react-native';
import {useMemo} from 'react';
import * as SplashScreen from 'expo-splash-screen';
import {Navigation} from './src/screens';
import {color} from './src/services/constants';
import {useListenToUpdate} from './src/services/listenToUpdate';
import {SplashScreenContextProvider} from './src/services/contexts/splashScreen.context';

SplashScreen.preventAutoHideAsync();

const fonts = Platform.select<Record<string, string>>({
  default: {
    Rubik: 'Rubik',
    'Rubik-Medium': 'Rubik-Medium',
    'Rubik-Bold': 'Rubik-Bold',
    'Rubik-SemiBold': 'Rubik-SemiBold',
    'Rubik-Light': 'Rubik-Light',
  },
  android: {
    Rubik: 'rubik-regular',
    'Rubik-Medium': 'rubik-medium',
    'Rubik-Bold': 'rubik-bold',
    'Rubik-SemiBold': 'rubik-semibold',
    'Rubik-Light': 'rubik-light',
  },
});

StyleSheet.setStyleAttributePreprocessor('fontFamily', next => {
  return fonts[next] ?? next;
});

export function App() {
  useListenToUpdate();

  const content = useMemo(
    () => (
      <View style={styles.root}>
        <Navigation />
      </View>
    ),
    [],
  );

  return <SplashScreenContextProvider>{content}</SplashScreenContextProvider>;
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: color.background,
  },
});
