import { TextStyle } from "react-native";
import { SharedValue, runOnJS, useDerivedValue } from "react-native-reanimated";
import { useState } from "react";
import { Text } from "../../input/text";

interface RealtimeTextProps {
  value: SharedValue<string>;
  style?: TextStyle;
}

export function RealtimeText({ value, style }: RealtimeTextProps) {
  const [text, setText] = useState(value.value);

  useDerivedValue(() => {
    runOnJS(setText)(value.value);
  });

  return <Text style={style}>{text}</Text>;
}
