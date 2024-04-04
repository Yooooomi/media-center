import {
  MutableRefObject,
  forwardRef,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  Pressable as RNPressable,
  View,
  useTVEventHandler,
} from "react-native";
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
  (
    {
      children,
      style,
      onPress,
      focusOnMount,
      onBlur,
      onFocus,
      name,
      down,
      left,
      right,
      up,
      disabled,
      onLongPress,
    },
    ref,
  ) => {
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

    const calledOnLongPress = useRef(false);
    useTVEventHandler((event) => {
      if (focused && event.eventType === "longSelect" && onLongPress) {
        calledOnLongPress.current = true;
        onLongPress();
      }
    });

    const handleOnPress = useCallback(() => {
      if (!calledOnLongPress.current) {
        onPress();
      }
      calledOnLongPress.current = false;
    }, [onPress]);

    return (
      <RNPressable
        accessible={!disabled}
        disabled={disabled}
        focusable={!disabled}
        isTVSelectable={!disabled}
        ref={mergeRefs(ref, registerFocus)}
        hasTVPreferredFocus={!disabled && focusOnMount}
        style={style}
        onFocus={() => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        onPress={handleOnPress}
        nextFocusDown={name && down ? getHandleFromName(down(name)) : undefined}
        nextFocusUp={name && up ? getHandleFromName(up(name)) : undefined}
        nextFocusLeft={name && left ? getHandleFromName(left(name)) : undefined}
        nextFocusRight={
          name && right ? getHandleFromName(right(name)) : undefined
        }
      >
        {renderedChildren}
      </RNPressable>
    );
  },
);
