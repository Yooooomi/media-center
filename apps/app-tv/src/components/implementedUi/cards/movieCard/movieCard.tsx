import {Movie} from '@media-center/domains/src/tmdb/domain/movie';
import {StyleSheet} from 'react-native';
import React, {useCallback} from 'react';
import {card, spacing} from '../../../../services/constants';
import {useNavigate} from '../../../../screens/params';
import {useImageUri} from '../../../../services/tmdb';
import {Text} from '../../../ui/input/text/text';
import {Box} from '../../../ui/display/box/box';
import {VerticalCard} from '../../../ui/display/cards/verticalCard';

interface MovieCardProps {
  movie: Movie;
  focusOnMount?: boolean;
  disabled?: boolean;
  progress?: number;
  onFocus?: (movie: Movie) => void;
}

export const MovieCardSize = {
  width: card.width,
  height: card.height + 24 + 4,
};

function MovieCard_({
  movie,
  focusOnMount,
  disabled,
  progress,
  onFocus,
}: MovieCardProps) {
  const {navigate} = useNavigate();
  const imageUri = useImageUri(movie.poster_path ?? movie.backdrop_path);

  const handleFocus = useCallback(() => {
    onFocus?.(movie);
  }, [movie, onFocus]);

  const handlePress = useCallback(() => {
    navigate('Movie', {movie});
  }, [movie, navigate]);

  return (
    <Box>
      <VerticalCard
        disabled={disabled}
        focusOnMount={focusOnMount}
        uri={imageUri}
        onPress={handlePress}
        progress={progress}
        onFocus={handleFocus}
      />
      <Box items="flex-start" style={styles.title}>
        <Text size="small" align="left" numberOfLines={1} style={styles.text}>
          {movie.title}
        </Text>
      </Box>
    </Box>
  );
}

export const MovieCard = React.memo(MovieCard_);

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
    width: '100%',
  },
});
