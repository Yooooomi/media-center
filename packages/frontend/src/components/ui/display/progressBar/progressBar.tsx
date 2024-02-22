import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { color, radius } from "@media-center/ui/src/constants";

interface ProgressBarProps {
  // A number between 0 and 1
  progress: SharedValue<number> | number;
  style?: ViewStyle;
}

export function ProgressBar({ progress, style }: ProgressBarProps) {
  const bar = useAnimatedStyle(() => ({
    backgroundColor: "white",
    flexGrow: 1,
    width: `${
      (typeof progress === "number" ? progress : progress.value) * 100
    }%`,
  }));

  return (
    <View style={[styles.root, style]}>
      <Animated.View style={bar} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.whiteText,
    height: 10,
    borderRadius: radius.small,
    width: "100%",
  },
});
