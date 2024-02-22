import { StyleSheet, View } from "react-native";
import { radius, spacing } from "@media-center/ui/src/constants";
import { IconName } from "../ui/display/icon/icon";
import { Pressable } from "../ui/input/pressable/pressable";
import { Icon } from "../ui/display/icon";
import { Text } from "../ui/input/text/text";
import { Box } from "../ui/display/box";

interface SiderButtonProps {
  text: string;
  icon: IconName;
  onPress: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  upName?: string;
  downName?: string;
}

export function SiderButton({
  text,
  icon,
  onPress,
  onBlur,
  onFocus,
  upName,
  downName,
}: SiderButtonProps) {
  return (
    <View style={styles.root}>
      <Pressable
        onPress={onPress}
        onFocus={onFocus}
        onBlur={onBlur}
        name={text}
        up={() => upName ?? ""}
        down={() => downName ?? ""}
        style={styles.pressable}
      >
        {({ focused }) => (
          <Box
            row
            p="S4"
            gap="S24"
            r="default"
            bg={focused ? "buttonBackgroundFocused" : "buttonBackground"}
            items="center"
          >
            <Icon
              color={focused ? "buttonTextFocused" : "buttonText"}
              size={24}
              name={icon}
            />
            <Text
              color={focused ? "buttonTextFocused" : "buttonText"}
              numberOfLines={1}
            >
              {text}
            </Text>
          </Box>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.S8,
    padding: spacing.S8,
    borderRadius: radius.default,
    overflow: "hidden",
  },
  pressable: {
    flexGrow: 1,
    marginLeft: -6,
  },
});
