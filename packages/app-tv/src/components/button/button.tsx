import {
  StyleSheet,
  TouchableOpacityProps,
  ActivityIndicator,
  Pressable as RNPressable,
} from 'react-native';
import {color, radius, spacing} from '../../services/constants';
import Animated from 'react-native-reanimated';
import {useFocusable} from '../ui/animated/useFocusable';

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
  style,
  ...other
}: ButtonProps) {
  const [bgSetFocused, backgroundStyle] = useFocusable(
    backgroundColor[type],
    backgroundColor[`${type}Focused`],
    'backgroundColor',
  );
  const [textSetFocused, textStyle] = useFocusable(
    textColor[type],
    textColor[`${type}Focused`],
    'color',
  );

  const setFocused = (value: boolean) => {
    bgSetFocused(value);
    textSetFocused(value);
  };

  return (
    <Pressable
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      activeOpacity={0.7}
      disabled={disabled || loading}
      style={[backgroundStyle, style, styles.base]}
      {...other}>
      {loading && <ActivityIndicator style={styles.loading} />}
      <Animated.Text style={[textStyle, styles.text]}>{text}</Animated.Text>
    </Pressable>
  );
}

const b = `${color.black}30`;

const backgroundColor: Record<ButtonType | `${ButtonType}Focused`, string> = {
  primary: b,
  primaryFocused: color.white,
  secondary: color.lightgrey,
  secondaryFocused: color.black,
};

const textColor: Record<ButtonType | `${ButtonType}Focused`, string> = {
  primary: color.lightgrey,
  primaryFocused: color.black,
  secondary: color.black,
  secondaryFocused: color.white,
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
  text: {
    fontWeight: 'bold',
  },
});
