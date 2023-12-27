import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import {StyleSheet} from 'react-native';
import {card, spacing} from '../../../../services/constants';
import {useNavigate} from '../../../../screens/params';
import {useImageUri} from '../../../../services/tmdb';
import Text from '../../../text/text';
import Box from '../../../box/box';
import React from 'react';
import {VerticalCard} from '../../../ui/cards/verticalCard';

interface MovieCardProps {
  movie: Movie;
  focusOnMount?: boolean;
  disabled?: boolean;
  progress?: number;
}

export const MovieCardSize = {
  width: card.width,
  height: card.height + 24,
};

export function MovieCard({
  movie,
  focusOnMount,
  disabled,
  progress,
}: MovieCardProps) {
  const {navigate} = useNavigate();
  const imageUri = useImageUri(movie.poster_path ?? movie.backdrop_path);

  return (
    <Box>
      <VerticalCard
        disabled={disabled}
        focusOnMount={focusOnMount}
        uri={imageUri}
        onPress={() => navigate('Movie', {movie})}
        progress={progress}
      />
      <Box items="flex-start" style={styles.title} bg="background">
        <Text size="small" align="left" numberOfLines={1} style={styles.text}>
          {movie.title}
        </Text>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
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
