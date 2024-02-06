import {View, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {RateLimitedImage} from '../ui/display/rateLimitedImage';
import {color} from '../../services/constants';

interface PageBackgroundProps {
  imageUri: string | undefined;
}

export function PageBackground({imageUri}: PageBackgroundProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={styles.cover}>
        <RateLimitedImage
          uri={imageUri}
          style={styles.cover}
          resizeMode="cover"
        />
        <View style={styles.blackOverlay} />
        <LinearGradient
          colors={['transparent', 'transparent', color.background]}
          style={StyleSheet.absoluteFill}
          locations={[0, 0.7, 0.95]}
        />
      </View>
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
