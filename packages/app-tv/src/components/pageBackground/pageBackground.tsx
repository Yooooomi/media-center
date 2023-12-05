import MaskedView from '@react-native-masked-view/masked-view';
import {View, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LoggedImage from '../loggedImage';

interface PageBackgroundProps {
  imageUri: string | undefined;
}

export function PageBackground({imageUri}: PageBackgroundProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <MaskedView
        style={styles.cover}
        maskElement={
          <LinearGradient
            colors={['white', 'white', 'transparent']}
            style={StyleSheet.absoluteFill}
            locations={[0, 0.7, 0.95]}
          />
        }>
        <>
          <LoggedImage uri={imageUri} style={styles.cover} resizeMode="cover" />
          <View style={styles.blackOverlay} />
        </>
      </MaskedView>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    height: 300,
    width: '100%',
  },
  blackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    opacity: 0.25,
  },
});
