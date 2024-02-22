import { PortalHost as PPortalHost } from "@gorhom/portal";
import { StyleSheet, View, ViewStyle } from "react-native";

interface PortalHostProps {
  name: string;
  style?: ViewStyle;
}

export function PortalHost({ name, style }: PortalHostProps) {
  return (
    <View style={[style, styles.root]}>
      <PPortalHost name={name} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    pointerEvents: "box-none",
  },
});
