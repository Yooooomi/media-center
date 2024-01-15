import {Platform, StyleSheet} from 'react-native';
import {Navigation} from './src/screens';
import {View} from 'react-native';
import {color} from './src/services/constants';
import {useListenToUpdate} from './src/services/listenToUpdate';

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

  return (
    <View style={styles.root}>
      <Navigation />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: color.background,
  },
});
