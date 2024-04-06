import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import {
  color,
  radius,
  rawColor,
  spacing,
} from "@media-center/ui/src/constants";
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
              borderWidth: border ? spacing.S2 : undefined,
              borderRadius:
                border && typeof border === "string"
                  ? radius[border]
                  : focused
                    ? radius.small + 4
                    : radius.small,
              borderColor:
                border && focused ? color.whiteText : rawColor.transparent,
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
    overflow: "hidden",
  },
});
