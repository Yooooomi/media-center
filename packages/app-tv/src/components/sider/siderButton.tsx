import Animated from 'react-native-reanimated';
import {color, radius, spacing} from '../../services/constants';
import {AnimatedIcon, IconName} from '../icon/icon';
import {useFocusable} from '../ui/animated/useFocusable';
import {
  Pressable as RNPressable,
  StyleSheet,
  findNodeHandle,
} from 'react-native';

interface SiderButtonProps {
  text: string;
  icon: IconName;
  onFocus: () => void;
  onBlur: () => void;
  onPress: () => void;
  getKey: (key: number | null) => void;
  nextFocusUp: number | null;
  nextFocusDown: number | null;
}

const b = `${color.buttonDarkBackground}30`;

const Pressable = Animated.createAnimatedComponent(RNPressable);

export default function SiderButton({
  text,
  icon,
  onBlur,
  onFocus,
  onPress,
  getKey,
  nextFocusDown,
  nextFocusUp,
}: SiderButtonProps) {
  const [bgSetFocused, backgroundStyle] = useFocusable(
    b,
    color.buttonLightBackground,
    'backgroundColor',
  );
  const [textSetFocused, textStyle] = useFocusable(
    color.buttonDarkText,
    color.buttonLightText,
    'color',
  );

  const setFocused = (value: boolean) => {
    bgSetFocused(value);
    textSetFocused(value);
  };

  return (
    <Animated.View style={[styles.root, backgroundStyle]}>
      <Pressable
        ref={r => {
          if (!r) {
            return;
          }
          getKey(findNodeHandle(r));
        }}
        onFocus={() => {
          setFocused(true);
          onFocus();
        }}
        onBlur={() => {
          setFocused(false);
          onBlur();
        }}
        onPress={onPress}
        style={styles.pressable}
        nextFocusDown={nextFocusDown ?? undefined}
        nextFocusUp={nextFocusUp ?? undefined}
      />
      <AnimatedIcon size={24} style={textStyle} name={icon} />
      <Animated.Text style={[textStyle, styles.text]} numberOfLines={1}>
        {text}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.S8,
    padding: spacing.S8,
    borderRadius: radius.default,
    overflow: 'hidden',
  },
  pressable: {
    position: 'absolute',
    height: 30,
    width: 30,
    top: 0,
    left: -500,
  },
  text: {
    fontFamily: 'Rubik',
  },
});
