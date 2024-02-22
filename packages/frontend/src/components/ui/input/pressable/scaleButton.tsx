import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { color, radius, rawColor } from "@media-center/ui/src/constants";
import { Pressable } from "./pressable";

interface ScaleButtonProps {
  children: ReactNode;
  onPress: () => void;
  focusOnMount?: boolean;
  border?: boolean | keyof typeof radius;
  style?: ViewStyle;
  onFocus?: () => void;
}

export function ScaleButton({
  children,
  onPress,
  focusOnMount,
  border,
  style,
  onFocus,
}: ScaleButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      focusOnMount={focusOnMount}
      style={style}
      onFocus={onFocus}
    >
      {({ focused }) => (
        <View
          style={[
            styles.root,
            {
              borderRadius:
                border && typeof border === "string"
                  ? radius[border]
                  : focused
                    ? radius.small + 4
                    : radius.small,
              borderColor:
                border && focused ? color.whiteText : rawColor.transparent,
              transform: [{ scale: focused ? 1.05 : 1 }],
            },
          ]}
        >
          {children}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 2,
    overflow: "hidden",
  },
});