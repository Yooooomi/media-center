import {useState, useEffect} from 'react';
import {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolateColor,
} from 'react-native-reanimated';
import {durations} from '../../../services/constants';

export function useFocusable(
  notFocusedBackground: string,
  focusedBackground: string,
  colorProperty: 'color' | 'backgroundColor',
) {
  const [focused, setFocused] = useState(false);
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(focused ? 1 : 0, {
      duration: durations.default,
    });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    // eslint-disable-next-line no-void
    void colorProperty;
    return {
      zIndex: focused ? 1 : undefined,
      [colorProperty]: interpolateColor(
        scale.value,
        [0, 1],
        [notFocusedBackground, focusedBackground],
      ),
    };
  });

  return [setFocused, animatedStyle, scale] as const;
}
