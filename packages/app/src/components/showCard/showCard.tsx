import {StyleSheet, View} from 'react-native';
import {radius} from '../../services/constants';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import LoggedImage from '../loggedImage/loggedImage';
import {useImageUri} from '../../services/tmdb';

interface ShowCardProps {
  show: Show;
}

export default function ShowCard({show}: ShowCardProps) {
  const imageUri = useImageUri(show.poster_path);

  return (
    <View style={styles.root}>
      <LoggedImage uri={imageUri} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {},
  image: {
    borderRadius: radius.default,
    height: 200,
    width: 120,
  },
});
