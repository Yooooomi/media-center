import { View, StyleSheet } from "react-native";
import {
  color,
  opacify,
  radius,
  shadows,
  spacing,
} from "@media-center/ui/src/constants";
import { Box } from "../../display/box";
import { Text } from "../../input/text/text";
import { Portal } from "../portal";
import { DEFAULT_HOSTNAME } from "../portal/portal";
import { ModalProps } from "./modal.props";

export function Modal({
  children,
  open,
  title,
  onClose,
  portalHostname,
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <Portal name={portalHostname ?? DEFAULT_HOSTNAME}>
      <div style={styles.back} onClick={onClose}>
        <Box mb="S16">
          <Text bold color="whiteText">
            {title}
          </Text>
        </Box>
        <View style={styles.content}>{children}</View>
      </div>
    </Portal>
  );
}

const styles = StyleSheet.create({
  back: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: opacify("background", 0.5),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  wrapper: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    maxHeight: 400,
    overflow: "hidden",
    width: "80%",
    backgroundColor: color.background,
    borderRadius: radius.big,
    padding: spacing.S16,
    ...shadows.default,
  },
});
