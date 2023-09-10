import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import {StyleSheet} from 'react-native';
import {radius} from '../../services/constants';
import {useNavigate} from '../../screens/params';
import LoggedImage from '../loggedImage/loggedImage';
import {useImageUri} from '../../services/tmdb';
import Pressable from '../pressable/pressable';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({movie}: MovieCardProps) {
  const navigate = useNavigate();
  const imageUri = useImageUri(movie.poster_path);

  return (
    <Pressable style={styles.root} onPress={() => navigate('Movie', {movie})}>
      <LoggedImage uri={imageUri} style={styles.image} resizeMode="cover" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.default,
    overflow: 'hidden',
  },
  image: {
    height: 200,
    width: 120,
  },
});
