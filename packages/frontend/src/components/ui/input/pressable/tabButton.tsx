import { StyleSheet, View } from "react-native";
import {
  color,
  opacify,
  opacifyRaw,
  radius,
  rawColor,
  spacing,
} from "@media-center/ui/src/constants";
import { Text } from "../text";
import { Pressable } from "./pressable";

interface TabButtonProps {
  text: string;
  selected: boolean;
  onPress: () => void;
}

export function TabButton({ text, selected, onPress }: TabButtonProps) {
  return (
    <Pressable onPress={onPress}>
      {({ focused }) => (
        <View>
          <View
            style={[
              styles.base,
              focused ? styles.focused : undefined,
              selected ? styles.selected : undefined,
            ]}
          >
            <Text
              color={focused || selected ? "buttonTextFocused" : "buttonText"}
            >
              {text}
            </Text>
          </View>
          {/* <View
            style={[
              styles.bar,
              selected ? styles.barSelected : styles.barUnselected,
            ]}
          /> */}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.S8,
    paddingVertical: spacing.S4,
    borderRadius: radius.default,
  },
  focused: {
    backgroundColor: opacifyRaw(color.whiteText, 0.8),
  },
  selected: {
    backgroundColor: rawColor.white,
  },
});
