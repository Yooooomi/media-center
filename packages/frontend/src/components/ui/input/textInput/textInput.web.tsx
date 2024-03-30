import { color, radius, spacing } from "@media-center/ui/src/constants";
import {
  TextInputProps as RNTextInputProps,
  ViewStyle,
  TextInput as RNTextInput,
  StyleSheet,
} from "react-native";
import { classnameAsStyle } from "@media-center/ui/src/utils";
import s from "./index.module.css";

interface TextInputProps extends Omit<RNTextInputProps, "style"> {
  style?: ViewStyle;
}

export function TextInput({ style, ...other }: TextInputProps) {
  return (
    <RNTextInput
      style={[styles.root, classnameAsStyle(s.root), style]}
      {...other}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    padding: spacing.S8,
    backgroundColor: color.textInputBackgroundFocused,
    borderRadius: radius.default,
    color: color.textInputTextFocused,
  },
});
