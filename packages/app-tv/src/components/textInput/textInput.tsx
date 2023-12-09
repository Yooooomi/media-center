import {
  TextInputProps as RNTextInputProps,
  TextInput as RNTextInput,
  Pressable,
  StyleSheet,
  View,
  findNodeHandle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import React, {useImperativeHandle, useMemo, useRef} from 'react';
import {color, radius} from '../../services/constants';
import {useFocusable} from '../ui/animated/useFocusable';
import {combineFunction} from '../../services/combineFunctions';

interface TextInputProps extends RNTextInputProps {}
export interface TextInputHandle {
  focus: () => void;
  blur: () => void;
  nodeHandle: () => number | null;
}

const AnimatedTextInput = Animated.createAnimatedComponent(RNTextInput);

const TextInput = React.forwardRef<TextInputHandle, TextInputProps>(
  ({...other}, iref) => {
    const ref = useRef<RNTextInput>(null);
    const pressableRef = useRef<View>(null);

    const handle = useMemo(
      () => ({
        nodeHandle: () =>
          pressableRef.current ? findNodeHandle(pressableRef.current) : null,
        blur: () => {
          ref.current?.blur();
          pressableRef.current?.blur();
        },
        focus: () => {
          ref.current?.focus();
          pressableRef.current?.focus();
        },
      }),
      [],
    );

    useImperativeHandle(iref, () => handle);

    const [setBackgroundFocused, animatedStyle] = useFocusable(
      color.buttonBackground,
      color.buttonBackgroundFocused,
      'backgroundColor',
    );

    const [setTextFocused, animatedTextStyle] = useFocusable(
      color.buttonText,
      color.buttonTextFocused,
      'color',
    );

    const setFocused = combineFunction(setBackgroundFocused, setTextFocused);

    return (
      <>
        <Pressable
          ref={pressableRef}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPress={() => ref.current?.focus()}>
          <AnimatedTextInput
            focusable={false}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect={false}
            ref={ref as any}
            cursorColor={color.whiteText}
            placeholderTextColor={color.whiteText}
            blurOnSubmit
            {...other}
            style={[styles.input, animatedStyle, animatedTextStyle]}
          />
        </Pressable>
      </>
    );
  },
);

export default TextInput;

const styles = StyleSheet.create({
  input: {
    height: 36,
    width: 300,
    borderRadius: radius.default,
  },
});
