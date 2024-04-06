import { PortalHost as PPortalHost } from "@gorhom/portal";
import { StyleSheet, View, ViewStyle } from "react-native";

interface PortalHostProps {
  name: string;
  style?: ViewStyle;
  absoluteFill?: boolean;
}

export function PortalHost({ name, style, absoluteFill }: PortalHostProps) {
  return (
    <View
      style={[
        style,
        styles.root,
        absoluteFill ? styles.absoluteFill : undefined,
      ]}
    >
      <PPortalHost name={name} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 1,
    pointerEvents: "box-none",
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
});
