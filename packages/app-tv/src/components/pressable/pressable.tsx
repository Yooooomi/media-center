import React, {ReactNode, useEffect, useState} from 'react';
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
import {durations, radius, rawColor} from '../../services/constants';
import {combineStyles} from '../../services/utils';

const AnimatedTouchable = Animated.createAnimatedComponent(RNPRessable);

export interface PressableProps extends RNPressableProps {
  children: ReactNode;
  radius?: number;
}

const Pressable = React.forwardRef<View, PressableProps>(
  ({style, radius: overrideRadius, children, onFocus, ...other}, ref) => {
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
          scale: interpolate(scale.value, [0, 1], [1, 1.05]),
        },
      ],
    }));

    const borderStyle = useAnimatedStyle(() => ({
      ...StyleSheet.absoluteFillObject,
      borderColor: rawColor.white,
      borderRadius: overrideRadius ?? radius.default,
      borderWidth: interpolate(scale.value, [0, 1], [0, 2]),
      opacity: interpolate(scale.value, [0, 1], [0, 1]),
      zIndex: 2,
    }));

    return (
      <AnimatedTouchable
        {...other}
        ref={ref}
        style={[animatedStyle, combineStyles(style)({focused, pressed: false})]}
        onFocus={e => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={() => setFocused(false)}>
        <Animated.View style={borderStyle} />
        {children}
      </AnimatedTouchable>
    );
  },
);

export default Pressable;
