import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import {StyleSheet, View} from 'react-native';
import {card, cardShadow, radius, spacing} from '../../services/constants';
import {useNavigate} from '../../screens/params';
import LoggedImage from '../loggedImage/loggedImage';
import {useImageUri} from '../../services/tmdb';
import Pressable, {PressableProps} from '../pressable/pressable';
import Text from '../text/text';
import Box from '../box/box';
import React from 'react';

interface MovieCardProps extends Omit<PressableProps, 'children'> {
  movie: Movie;
}

export const MovieCardSize = {
  width: card.width,
  height: card.height + 24,
};

const MovieCard = React.forwardRef<View, MovieCardProps>(
  ({movie, ...other}, ref) => {
    const navigate = useNavigate();
    const imageUri = useImageUri(movie.poster_path ?? movie.backdrop_path);

    return (
      <Box shrink>
        <Pressable
          ref={ref}
          style={({focused}) => [
            styles.root,
            {zIndex: focused ? 1 : undefined},
          ]}
          onPress={() => navigate('Movie', {movie})}
          {...other}>
          <LoggedImage uri={imageUri} style={styles.image} resizeMode="cover" />
        </Pressable>
        <Box items="flex-start" style={styles.title} bg="background">
          <Text size="small" align="left" numberOfLines={1} style={styles.text}>
            {movie.title}
          </Text>
        </Box>
      </Box>
    );
  },
);

export default MovieCard;

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.default,
    overflow: 'hidden',
    height: card.height,
    width: card.width,
    ...cardShadow,
  },
  image: {
    height: card.height,
    width: card.width,
  },
  title: {
    overflow: 'hidden',
    width: card.width,
    height: 24,
    zIndex: -1,
  },
  text: {
    marginTop: spacing.S4,
    marginLeft: spacing.S4,
  },
});
