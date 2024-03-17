import { StyleSheet, View } from "react-native";
import { spacing } from "@media-center/ui/src/constants";
import { noop } from "@media-center/algorithm";
import { IconButton } from "../../../ui/input/pressable/iconButton";
import { Box } from "../../../ui/display/box";
import { ShowEpisodeCardWrapperProps } from "./showEpisodeCardWrapper.props";

export function ShowEpisodeCardWrapper({
  children,
}: ShowEpisodeCardWrapperProps) {
  return (
    <Box grow>
      {children}
      <View style={styles.button}>
        <IconButton size={24} icon="dots-horizontal" onPress={noop} />
      </View>
    </Box>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    left: spacing.S8,
    top: spacing.S8,
  },
});
