import React, {
  ForwardedRef,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Pressable as RNPressable, View, ViewStyle} from 'react-native';

interface PressableProps {
  style?: ViewStyle;
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

function bindRef(ref: ForwardedRef<any>, node: any) {
  if (typeof ref === 'function') {
    ref(node);
  } else if (ref) {
    ref.current = node;
  }
}

const combineRef =
  (a: ForwardedRef<any>, b: ForwardedRef<any>) => (node: any) => {
    bindRef(a, node);
    bindRef(b, node);
  };

function useCombineRef(a: ForwardedRef<any>, b: ForwardedRef<any>) {
  const ref = useRef(combineRef(a, b));

  useMemo(() => {
    ref.current = combineRef(a, b);
  }, [a, b]);

  return ref.current;
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

    const combinedRef = useCombineRef(ref, registerFocus);

    return (
      <RNPressable
        ref={combinedRef}
        hasTVPreferredFocus={focusOnMount}
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
