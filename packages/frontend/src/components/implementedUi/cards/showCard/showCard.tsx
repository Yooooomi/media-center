import { StyleSheet } from "react-native";
import { Show } from "@media-center/domains/src/tmdb/domain/show";
import React, { useCallback } from "react";
import { spacing } from "@media-center/ui/src/constants";
import { useImageUri } from "../../../../services/tmdb";
import { useNavigate } from "../../../../screens/navigation";
import { Box } from "../../../ui/display/box";
import { Text } from "../../../ui/input/text/text";
import { VerticalCard } from "../../../ui/display/cards/verticalCard";
import { card } from "../../../../services/cards";

interface ShowCardProps {
  show: Show;
  focusOnMount?: boolean;
  disabled?: boolean;
  progress?: number;
  onFocus?: (show: Show) => void;
}

export const ShowCardSize = {
  width: card.width,
  height: card.height + 24,
};

function ShowCard_({
  show,
  focusOnMount,
  disabled,
  progress,
  onFocus,
}: ShowCardProps) {
  const imageUri = useImageUri(show.poster_path ?? show.backdrop_path);
  const { navigate } = useNavigate();

  const handlePress = useCallback(() => {
    navigate("Show", { showId: show.id.toString() });
  }, [navigate, show]);

  const handleFocus = useCallback(() => {
    onFocus?.(show);
  }, [onFocus, show]);

  return (
    <Box>
      <VerticalCard
        focusOnMount={focusOnMount}
        uri={imageUri}
        onPress={handlePress}
        disabled={disabled}
        progress={progress}
        onFocus={handleFocus}
      />
      <Box items="flex-start" style={styles.title}>
        <Text size="small" align="left" numberOfLines={1} style={styles.text}>
          {show.title}
        </Text>
      </Box>
    </Box>
  );
}

export const ShowCard = React.memo(ShowCard_);

const styles = StyleSheet.create({
  title: {
    overflow: "hidden",
    width: card.width,
    height: 24,
    zIndex: -1,
  },
  text: {
    marginTop: spacing.S4,
    marginLeft: spacing.S4,
    width: "100%",
  },
});
