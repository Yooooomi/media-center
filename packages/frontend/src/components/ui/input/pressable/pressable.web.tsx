import { forwardRef, useCallback, useState } from "react";
import { Pressable as RNPressable, View } from "react-native";
import { PressableProps } from "./pressable.props";

export const Pressable = forwardRef<View, PressableProps>(
  ({ children, style, onPress, onBlur, onFocus, onLongPress }, ref) => {
    const [focused, setFocused] = useState(false);

    const renderedChildren =
      typeof children === "function" ? children({ focused }) : children;

    const handleOnPress = useCallback(() => {
      onPress();
    }, [onPress]);

    return (
      <RNPressable
        ref={ref}
        style={style}
        onLongPress={onLongPress}
        onPress={handleOnPress}
        // @ts-expect-error
        onMouseEnter={() => {
          setFocused(true);
          onFocus?.();
        }}
        onMouseLeave={() => {
          setFocused(false);
          onBlur?.();
        }}
      >
        {renderedChildren}
      </RNPressable>
    );
  },
);
