import { ActivityIndicator, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export function FullScreenLoading() {
  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.root}>
      <ActivityIndicator size={48} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
