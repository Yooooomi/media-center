import { View, ViewStyle } from "react-native";
import { color } from "@media-center/ui/src/constants";
import { forwardRef } from "react";
import { Text } from "../text/text";
import { Box } from "../../display/box";
import { Pressable } from "./pressable";

type Variants = "default" | "delete";

interface TextButtonProps {
  text: string;
  onPress: () => void;
  focusOnMount?: boolean;
  variant?: Variants;
  style?: ViewStyle;
}

const variants: Record<
  Variants,
  [
    [keyof typeof color, keyof typeof color],
    [keyof typeof color, keyof typeof color],
  ]
> = {
  default: [
    ["buttonBackgroundFocused", "buttonBackground"],
    ["buttonTextFocused", "buttonText"],
  ],
  delete: [
    ["error", "buttonBackground"],
    ["whiteText", "error"],
  ],
};

export const TextButton = forwardRef<View, TextButtonProps>(
  ({ text, onPress, focusOnMount, variant = "default", style }, ref) => {
    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        focusOnMount={focusOnMount}
        style={style}
      >
        {({ focused }) => (
          <Box
            bg={focused ? variants[variant][0][0] : variants[variant][0][1]}
            h={32}
            items="center"
            row
            ph="S8"
            r="default"
          >
            <Text
              align="center"
              color={
                focused ? variants[variant][1][0] : variants[variant][1][1]
              }
            >
              {text}
            </Text>
          </Box>
        )}
      </Pressable>
    );
  },
);
