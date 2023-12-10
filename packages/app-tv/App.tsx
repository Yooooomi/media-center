import {Platform, StyleSheet} from 'react-native';
import Navigation from './src/screens';
import {listenToUpdate} from './src/services/listenToUpdate';

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

listenToUpdate();

export default function App() {
  return <Navigation />;
}
