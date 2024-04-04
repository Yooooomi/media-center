import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  ViewStyle,
} from "react-native";
import {
  color,
  opacify,
  radius,
  spacing,
} from "@media-center/ui/src/constants";

interface TextInputProps extends Omit<RNTextInputProps, "style"> {
  style?: ViewStyle;
}

export function TextInput({ style, ...other }: TextInputProps) {
  return (
    <RNTextInput
      placeholderTextColor={
        true ? opacify("buttonTextFocused", 0.7) : opacify("buttonText", 0.7)
      }
      style={[
        styles.root,
        {
          backgroundColor: true
            ? color.buttonBackgroundFocused
            : color.buttonBackground,
          color: true ? color.buttonTextFocused : color.buttonText,
          borderRadius: radius.default,
        },
        style,
      ]}
      blurOnSubmit={false}
      {...other}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    padding: spacing.S8,
  },
});
