import {
  TextInput as RNTextInput,
  TextInputProps as Props,
  StyleSheet,
  View,
  findNodeHandle,
} from 'react-native';
import React, {useImperativeHandle, useMemo, useRef} from 'react';
import {Pressable} from '../ui/pressable/pressable';
import {color, opacify, radius} from '../../services/constants';

interface TextInputProps {
  value: string;
  onChangeText: (newText: string) => void;
  placeholder?: string;
  type?: Props['textContentType'];
}
export interface TextInputHandle {
  focus: () => void;
  blur: () => void;
  nodeHandle: () => number | null;
}

const TextInput = React.forwardRef<TextInputHandle, TextInputProps>(
  ({onChangeText, value, placeholder, type}, iref) => {
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

    return (
      <Pressable onPress={handle.focus}>
        {({focused}) => (
          <RNTextInput
            ref={ref}
            textContentType={type}
            placeholder={placeholder}
            placeholderTextColor={opacify(
              focused ? 'textInputTextFocused' : 'textInputText',
              0.5,
            )}
            value={value}
            onChangeText={onChangeText}
            style={[
              styles.input,
              {
                backgroundColor: focused
                  ? color.textInputBackgroundFocused
                  : color.textInputBackground,
                color: focused
                  ? color.textInputTextFocused
                  : color.textInputText,
              },
            ]}
          />
        )}
      </Pressable>
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
