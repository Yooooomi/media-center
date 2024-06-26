import { StyleSheet, View } from "react-native";
import {
  color,
  radius,
  rawColor,
  spacing,
} from "@media-center/ui/src/constants";
import { Text, Accepted } from "../../input/text/text";
import { Box, BoxProps } from "../box/box";

interface PillProps extends BoxProps {
  children: Accepted | Accepted[];
}

export function Pill({ children, style, ...other }: PillProps) {
  return (
    <Box style={{ ...styles.root, ...style }} {...other}>
      <View style={styles.background} />
      <Text size="tiny">{children}</Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.default,
    borderColor: rawColor.white,
    borderWidth: 1,
    height: 14,
    paddingHorizontal: spacing.S4,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: color.background,
    borderRadius: radius.default - 2,
    opacity: 0.6,
  },
});
