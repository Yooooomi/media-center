import React, {MutableRefObject, ReactNode, useCallback, useState} from 'react';
import {Pressable as RNPressable, View, ViewStyle} from 'react-native';

interface PressableProps {
  style?: ViewStyle;
  disabled?: boolean;
  children: ReactNode | ((infos: {focused: boolean}) => ReactNode);
  onPress: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  focusOnMount?: boolean;

  // Used to handle direction without refs
  name?: string;
  up?: (thisName: string) => string;
  down?: (thisName: string) => string;
  left?: (thisName: string) => string;
  right?: (thisName: string) => string;
}

const focuses: Record<string, number> = {};

function mergeRefs(
  ...refs: (((node: any) => void) | MutableRefObject<any> | null)[]
) {
  return (node: any) => {
    refs.forEach(ref => {
      if (ref === null) {
        return;
      } else if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    });
  };
}

export const Pressable = React.forwardRef<View, PressableProps>(
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
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);

    const renderedChildren =
      typeof children === 'function' ? children({focused}) : children;

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
        onPress={onPress}
        nextFocusDown={name && down ? getHandleFromName(down(name)) : undefined}
        nextFocusUp={name && up ? getHandleFromName(up(name)) : undefined}
        nextFocusLeft={name && left ? getHandleFromName(left(name)) : undefined}
        nextFocusRight={
          name && right ? getHandleFromName(right(name)) : undefined
        }>
        {renderedChildren}
      </RNPressable>
    );
  },
);
