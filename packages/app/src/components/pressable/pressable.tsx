import {useEffect, useState} from 'react';
import {
  TouchableWithoutFeedback,
  TouchableWithoutFeedbackProps as RNTouchableWithoutFeedbackProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {durations} from '../../services/constants';

const AnimatedTouchable = Animated.createAnimatedComponent(
  TouchableWithoutFeedback,
);

interface PressableProps extends RNTouchableWithoutFeedbackProps {}

export default function Pressable({style, ...other}: PressableProps) {
  const [focused, setFocused] = useState(false);
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withTiming(focused ? 1.1 : 1.0, {
      duration: durations.default,
    });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    ...style,
    zIndex: focused ? 1 : undefined,
    transform: [
      {
        scale: scale.value,
      },
    ],
  }));

  return (
    <AnimatedTouchable
      {...other}
      style={animatedStyle}
      accessible
      onFocus={() => console.log('OMG') ?? setFocused(true)}
      onBlur={() => console.log('OMG') ?? setFocused(false)}
    />
  );
}
