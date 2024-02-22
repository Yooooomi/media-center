import { StyleSheet, View } from "react-native";
import { color as colors, radius } from "@media-center/ui/src/constants";

interface DotProps {
  color: keyof typeof colors;
}

export function Dot({ color }: DotProps) {
  return <View style={[styles.root, { backgroundColor: colors[color] }]} />;
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.max,
    height: 4,
    width: 4,
  },
});
