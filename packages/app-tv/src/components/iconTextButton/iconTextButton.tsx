import {
  StyleSheet,
  PressableProps,
  Pressable as RNPressable,
  View,
} from 'react-native';
import {color, durations, radius} from '../../services/constants';
import {useEffect, useState} from 'react';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {AnimatedIcon, IconName} from '../icon/icon';

const Pressable = Animated.createAnimatedComponent(RNPressable);

type IconButtonType = 'primary' | 'secondary';

interface IconTextButtonProps extends PressableProps {
  type: IconButtonType;
  icon: IconName;
  text: string;
}

export default function IconTextButton({
  type,
  icon,
  disabled,
  onFocus,
  text,
  isTVSelectable: _isTVSelectable,
  ...other
}: IconTextButtonProps) {
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

  const colorStyle = useAnimatedStyle(() => ({
    textAlign: 'center',
    transform: [{translateY: -10}],
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
      isTVSelectable={!disabled}
      onBlur={() => setFocused(false)}
      disabled={disabled}
      style={style}
      {...other}>
      <View style={styles.part} />
      <AnimatedIcon style={colorStyle} size={20} name={icon} />
      <Animated.Text style={[styles.part, colorStyle]}>{text}</Animated.Text>
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
  secondary: color.lightgrey,
  secondaryFocused: b,
};

const textColor: Record<IconButtonType | `${IconButtonType}Focused`, string> = {
  primary: color.lightgrey,
  primaryFocused: color.black,
  secondary: color.white,
  secondaryFocused: color.lightgrey,
};

const styles = StyleSheet.create({
  base: {
    height: 100,
    width: 100,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.small,
    flexShrink: 0,
  },
  part: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
