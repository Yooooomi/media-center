import {
  TouchableWithoutFeedbackProps as RNTouchableWithoutFeedbackProps,
  Pressable,
  StyleSheet,
} from 'react-native';
import Animated from 'react-native-reanimated';
import {color, radius} from '../../services/constants';
import {useFocusable} from '../ui/animated/useFocusable';

const AnimatedTouchable = Animated.createAnimatedComponent(Pressable);

export interface PressableGreyProps extends RNTouchableWithoutFeedbackProps {
  notFocusedBackground?: keyof typeof color;
  focusedBackground?: keyof typeof color;
}

export default function PressableGrey({
  style,
  notFocusedBackground = 'buttonDarkBackground',
  focusedBackground = 'buttonLightBackground',
  ...other
}: PressableGreyProps) {
  const [setFocused, animatedStyle] = useFocusable(
    color[notFocusedBackground],
    color[focusedBackground],
    'backgroundColor',
  );

  return (
    <AnimatedTouchable
      {...other}
      style={[styles.root, animatedStyle, style]}
      accessible
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.small,
  },
});
