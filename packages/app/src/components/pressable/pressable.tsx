import {useEffect, useState} from 'react';
import {
  Pressable as RNPRessable,
  PressableProps as RNPressableProps,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {color, durations, radius} from '../../services/constants';

const AnimatedTouchable = Animated.createAnimatedComponent(RNPRessable);

interface PressableProps extends RNPressableProps {}

export default function Pressable({style, children, ...other}: PressableProps) {
  const [focused, setFocused] = useState(false);
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(focused ? 1 : 0, {
      duration: durations.default,
    });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(scale.value, [0, 1], [1, 1.07]),
      },
    ],
    ...(style as object),
  }));

  const borderStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    borderColor: color.white,
    borderRadius: radius.default,
    borderWidth: interpolate(scale.value, [0, 1], [0, 2]),
    opacity: interpolate(scale.value, [0, 1], [0, 1]),
  }));

  return (
    <AnimatedTouchable
      {...other}
      style={animatedStyle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}>
      <Animated.View style={borderStyle} />
      {children}
    </AnimatedTouchable>
  );
}
