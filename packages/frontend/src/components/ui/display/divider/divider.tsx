import { StyleSheet, View, ViewStyle } from "react-native";
import { color } from "@media-center/ui/src/constants";

interface DividerProps {
  width: ViewStyle["width"];
}

export function Divider({ width }: DividerProps) {
  return <View style={[styles.root, { width }]} />;
}

const styles = StyleSheet.create({
  root: {
    height: 1,
    backgroundColor: color.divider,
  },
});
