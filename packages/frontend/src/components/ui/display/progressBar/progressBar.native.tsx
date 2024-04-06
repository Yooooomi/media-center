import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { color, radius } from "@media-center/ui/src/constants";
import { ProgressBarProps } from "./progressBar.props";

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
    position: "relative",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.whiteText,
    height: 10,
    borderRadius: radius.small,
    width: "100%",
  },
});
