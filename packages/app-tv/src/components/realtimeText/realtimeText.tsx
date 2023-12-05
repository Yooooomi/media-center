import {TextInput, TextStyle} from 'react-native';
import Animated, {SharedValue, useAnimatedProps} from 'react-native-reanimated';

interface RealtimeTextProps {
  value: SharedValue<string>;
  style?: TextStyle;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function RealtimeText({value, style}: RealtimeTextProps) {
  const props = useAnimatedProps(
    () =>
      ({
        text: value.value,
      } as any),
  );

  return <AnimatedTextInput style={[style]} animatedProps={props} />;
}
