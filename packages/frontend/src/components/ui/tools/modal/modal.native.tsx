import { ReactNode, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import {
  color,
  opacify,
  radius,
  spacing,
} from "@media-center/ui/src/constants";
import { useBack } from "../../../../services/hooks/useBack";
import { Box } from "../../display/box";
import { Text } from "../../input/text/text";
import { Portal } from "../portal";
import { DEFAULT_HOSTNAME } from "../portal/portal";
import { Pressable } from "../../input/pressable/pressable";

interface ModalProps {
  title: string;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
}

export function Modal({ children, open, title, onClose }: ModalProps) {
  useBack(
    useCallback(() => {
      if (open) {
        onClose();
        return true;
      }
      return false;
    }, [onClose, open]),
  );

  if (!open) {
    return null;
  }

  return (
    <Portal name={DEFAULT_HOSTNAME}>
      <Pressable style={styles.back} onPress={onClose} />
      <View style={styles.wrapper}>
        <Box mb="S16">
          <Text bold color="whiteText">
            {title}
          </Text>
        </Box>
        <View style={styles.content}>{children}</View>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  back: {
    ...StyleSheet.absoluteFillObject,
    flexGrow: 1,
    backgroundColor: opacify("background", 0.5),
  },
  wrapper: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  content: {
    maxHeight: 400,
    overflow: "hidden",
    width: "80%",
    backgroundColor: color.background,
    borderRadius: radius.big,
    padding: spacing.S16,
  },
});
