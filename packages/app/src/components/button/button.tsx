import {
  StyleSheet,
  TouchableOpacityProps,
  ActivityIndicator,
  Pressable as RNPressable,
} from 'react-native';
import {color, durations, radius, spacing} from '../../services/constants';
import {useEffect, useState} from 'react';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const Pressable = Animated.createAnimatedComponent(RNPressable);

type ButtonType = 'primary' | 'secondary';

interface ButtonProps extends TouchableOpacityProps {
  type: ButtonType;
  text: string;
  loading?: boolean;
}

export default function Button({
  type,
  text,
  loading,
  disabled,
  ...other
}: ButtonProps) {
  const [focused, setFocused] = useState(false);
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withTiming(focused ? 1 : 0, {
      duration: durations.default,
    });
  }, [focused, value]);

  const style = useAnimatedStyle(() => ({
    ...styles.base,
    backgroundColor: interpolateColor(
      value.value,
      [0, 1],
      [backgroundColor[type], backgroundColor[`${type}Focused`]],
    ),
  }));

  const textStyle = useAnimatedStyle(() => ({
    fontWeight: 'bold',
    color: interpolateColor(
      value.value,
      [0, 1],
      [textColor[type], textColor[`${type}Focused`]],
    ),
  }));

  return (
    <Pressable
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      activeOpacity={0.7}
      disabled={disabled || loading}
      style={style}
      {...other}>
      {loading && <ActivityIndicator style={styles.loading} />}
      <Animated.Text style={textStyle}>{text}</Animated.Text>
    </Pressable>
  );
}

const b = `${color.black}30`;

const backgroundColor: Record<ButtonType | `${ButtonType}Focused`, string> = {
  primary: b,
  primaryFocused: color.white,
  secondary: color.greyed,
  secondaryFocused: b,
};

const textColor: Record<ButtonType | `${ButtonType}Focused`, string> = {
  primary: color.greyed,
  primaryFocused: color.black,
  secondary: color.white,
  secondaryFocused: color.greyed,
};

const styles = StyleSheet.create({
  base: {
    height: 36,
    paddingHorizontal: spacing.S16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.small,
    flexDirection: 'row',
    flexShrink: 0,
  },
  loading: {
    marginRight: spacing.S4,
  },
});
