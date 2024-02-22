import { MutableRefObject, forwardRef, useCallback, useState } from "react";
import { Pressable as RNPressable, View } from "react-native";
import { PressableProps } from "./pressable.props";

const focuses: Record<string, number> = {};

function mergeRefs(
  ...refs: (((node: any) => void) | MutableRefObject<any> | null)[]
) {
  return (node: any) => {
    refs.forEach((ref) => {
      if (ref === null) {
        return;
      } else if (typeof ref === "function") {
        ref(node);
      } else {
        ref.current = node;
      }
    });
  };
}

export const Pressable = forwardRef<View, PressableProps>(
  ({ children, style, onPress, onBlur, onFocus, name, onLongPress }, ref) => {
    const [focused, setFocused] = useState(false);

    const renderedChildren =
      typeof children === "function" ? children({ focused }) : children;

    const registerFocus = useCallback(
      (node: View | null) => {
        if (!name) {
          return;
        }
        if (!node) {
          delete focuses[name];
          return;
        }
        focuses[name] = (node as any)._nativeTag;
      },
      [name],
    );

    const getHandleFromName = useCallback((n: string) => {
      return focuses[n];
    }, []);

    const handleOnPress = useCallback(() => {
      onPress();
    }, [onPress]);

    return (
      <RNPressable
        ref={mergeRefs(ref, registerFocus)}
        style={style}
        onFocus={() => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        onLongPress={onLongPress}
        onPress={handleOnPress}
      >
        {renderedChildren}
      </RNPressable>
    );
  },
);
