import {
  Keyboard,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import {useCallback, useRef} from 'react';
import {Pressable} from '../pressable/pressable';
import {color, opacify, radius} from '../../../../services/constants';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  style?: ViewStyle;
}

export function TextInput({style, ...other}: TextInputProps) {
  const pressableInput = useRef<View>(null);
  const input = useRef<RNTextInput>(null);

  const focus = useCallback(() => {
    input.current?.focus();
  }, []);

  return (
    <Pressable onPress={focus} style={style} ref={pressableInput}>
      {({focused}) => (
        <RNTextInput
          placeholderTextColor={
            focused
              ? opacify('buttonTextFocused', 0.7)
              : opacify('buttonText', 0.7)
          }
          style={{
            backgroundColor: focused
              ? color.buttonBackgroundFocused
              : color.buttonBackground,
            color: focused ? color.buttonTextFocused : color.buttonText,
            borderRadius: radius.default,
          }}
          ref={input}
          blurOnSubmit={false}
          onSubmitEditing={() => {
            pressableInput.current?.requestTVFocus();
            Keyboard.dismiss();
          }}
          {...other}
        />
      )}
    </Pressable>
  );
}
