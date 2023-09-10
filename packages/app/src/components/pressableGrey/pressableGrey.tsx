import {useEffect, useState} from 'react';
import {
  TouchableWithoutFeedbackProps as RNTouchableWithoutFeedbackProps,
  Pressable,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {color, durations, radius} from '../../services/constants';

const AnimatedTouchable = Animated.createAnimatedComponent(Pressable);

interface PressableGreyProps extends RNTouchableWithoutFeedbackProps {
  notFocusedBackground?: keyof typeof color;
  focusedBackground?: keyof typeof color;
}

const notFocusedBackground = 'white';
const focusedBackground = 'greyed';

export default function PressableGrey({
  style,
  notFocusedBackground: overwriteNotFocusedBackground,
  focusedBackground: overwriteFocusedBackground,
  ...other
}: PressableGreyProps) {
  const [focused, setFocused] = useState(false);
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(focused ? 1 : 0, {
      duration: durations.default,
    });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    zIndex: focused ? 1 : undefined,
    borderRadius: radius.default,
    backgroundColor: interpolateColor(
      scale.value,
      [0, 1],
      [
        color[overwriteNotFocusedBackground ?? notFocusedBackground],
        color[overwriteFocusedBackground ?? focusedBackground],
      ],
    ),
    ...(style as object),
  }));

  return (
    <AnimatedTouchable
      {...other}
      style={animatedStyle}
      accessible
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}
