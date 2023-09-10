import {
  StyleSheet,
  PressableProps,
  ActivityIndicator,
  Pressable as RNPressable,
} from 'react-native';
import {color, durations, radius} from '../../services/constants';
import {useEffect, useState} from 'react';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Icon, {IconName} from '../icon/icon';

const Pressable = Animated.createAnimatedComponent(RNPressable);
const AIcon = Animated.createAnimatedComponent(Icon);

type IconButtonType = 'primary' | 'secondary';

interface IconButtonProps extends PressableProps {
  type: IconButtonType;
  icon: IconName;
  loading?: boolean;
}

export default function IconButton({
  type,
  icon,
  loading,
  disabled,
  onFocus,
  isTVSelectable: _isTVSelectable,
  ...other
}: IconButtonProps) {
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
    opacity: loading ? 0 : 1,
    color: interpolateColor(
      value.value,
      [0, 1],
      [textColor[type], textColor[`${type}Focused`]],
    ),
  }));

  return (
    <Pressable
      onFocus={e => {
        onFocus?.(e);
        setFocused(true);
      }}
      isTVSelectable={!disabled && !loading}
      onBlur={() => setFocused(false)}
      disabled={disabled || loading}
      style={style}
      {...other}>
      {loading && <ActivityIndicator size={20} style={styles.loading} />}
      <AIcon style={textStyle} size={20} name={icon} />
    </Pressable>
  );
}

const b = `${color.black}30`;

const backgroundColor: Record<
  IconButtonType | `${IconButtonType}Focused`,
  string
> = {
  primary: b,
  primaryFocused: color.white,
  secondary: color.greyed,
  secondaryFocused: b,
};

const textColor: Record<IconButtonType | `${IconButtonType}Focused`, string> = {
  primary: color.greyed,
  primaryFocused: color.black,
  secondary: color.white,
  secondaryFocused: color.greyed,
};

const styles = StyleSheet.create({
  base: {
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.small,
    flexDirection: 'row',
    flexShrink: 0,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
  },
});
