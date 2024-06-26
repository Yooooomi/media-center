import { StyleSheet } from "react-native";
import { radius, cardShadow, color } from "@media-center/ui/src/constants";
import { ScaleButton } from "../../input/pressable/scaleButton";
import { Box } from "../box";
import { Icon } from "../icon";
import { DisabledFill } from "../disabledFill";
import { RateLimitedImage } from "../rateLimitedImage";
import { ProgressOverlay } from "../progressOverlay";
import { card } from "../../../../services/cards";
import { isMobile } from "../../../../services/platform";

interface VerticalCardProps {
  uri: string | undefined;
  focusOnMount?: boolean;
  onPress: () => void;
  disabled?: boolean;
  progress?: number;
  onFocus?: () => void;
  width: number;
}

export function VerticalCard({
  uri,
  onPress,
  focusOnMount,
  disabled,
  progress,
  onFocus,
  width,
}: VerticalCardProps) {
  const size = {
    width,
    height: width * card.ratio,
  };

  return (
    <ScaleButton
      focusOnMount={focusOnMount}
      onPress={onPress}
      onFocus={onFocus}
      border={!isMobile()}
    >
      <ProgressOverlay style={[styles.root, size]} progress={progress}>
        {uri ? (
          <RateLimitedImage uri={uri} style={size} resizeMode="cover" />
        ) : (
          <Box style={size} bg="background" items="center" content="center">
            <Icon name="movie" size={36} />
          </Box>
        )}
        {disabled ? <DisabledFill /> : null}
      </ProgressOverlay>
    </ScaleButton>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.default,
    overflow: "hidden",
    ...cardShadow,
  },
  progress: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    bottom: 0,
    backgroundColor: color.progress,
  },
});
