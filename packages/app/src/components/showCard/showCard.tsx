import {StyleSheet} from 'react-native';
import {radius} from '../../services/constants';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import LoggedImage from '../loggedImage/loggedImage';
import {useImageUri} from '../../services/tmdb';
import Pressable from '../pressable/pressable';
import {useNavigate} from '../../screens/params';

interface ShowCardProps {
  show: Show;
}

export default function ShowCard({show}: ShowCardProps) {
  const imageUri = useImageUri(show.poster_path);
  const navigate = useNavigate();

  return (
    <Pressable style={styles.root} onPress={() => navigate('Show', {show})}>
      <LoggedImage uri={imageUri} style={styles.image} resizeMode="cover" />
    </Pressable>
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
