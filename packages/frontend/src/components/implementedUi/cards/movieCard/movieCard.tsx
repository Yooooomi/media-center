import { Movie } from "@media-center/domains/src/tmdb/domain/movie";
import { StyleSheet } from "react-native";
import React, { useCallback } from "react";
import { spacing } from "@media-center/ui/src/constants";
import { useImageUri } from "../../../../services/tmdb";
import { Text } from "../../../ui/input/text/text";
import { Box } from "../../../ui/display/box/box";
import { VerticalCard } from "../../../ui/display/cards/verticalCard";
import { card } from "../../../../services/cards";
import { useNavigate } from "../../../../screens/navigation.dependency";

interface MovieCardProps {
  movie: Movie;
  focusOnMount?: boolean;
  disabled?: boolean;
  progress?: number;
  onFocus?: (movie: Movie) => void;
  width?: number;
}

function MovieCard_({
  movie,
  focusOnMount,
  disabled,
  progress,
  onFocus,
  width = card.width,
}: MovieCardProps) {
  const { navigate } = useNavigate();
  const imageUri = useImageUri(movie.poster_path ?? movie.backdrop_path);

  const handleFocus = useCallback(() => {
    onFocus?.(movie);
  }, [movie, onFocus]);

  const handlePress = useCallback(() => {
    navigate("Movie", { movieId: movie.id.toString(), title: movie.title });
  }, [movie, navigate]);

  return (
    <Box>
      <VerticalCard
        width={width}
        disabled={disabled}
        focusOnMount={focusOnMount}
        uri={imageUri}
        onPress={handlePress}
        progress={progress}
        onFocus={handleFocus}
      />
      <Box w={width} items="flex-start" overflow="hidden" style={styles.title}>
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
    height: 24,
    zIndex: -1,
  },
  text: {
    marginTop: spacing.S4,
    marginLeft: spacing.S4,
    width: "100%",
  },
});
