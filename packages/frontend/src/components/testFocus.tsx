import { View } from "react-native";
import { Pressable } from "./ui/input/pressable/pressable";
import { Text } from "./ui/input/text";

export function TestFocus() {
  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <Pressable
        focusOnMount
        style={{ padding: 50 }}
        onPress={() => console.log("1")}
      >
        {({ focused }) => (
          <Text style={{ color: "white" }}>1 {focused.toString()}</Text>
        )}
      </Pressable>
      <Pressable style={{ padding: 50 }} onPress={() => console.log("2")}>
        {({ focused }) => (
          <Text style={{ color: "white" }}>2 {focused.toString()}</Text>
        )}
      </Pressable>
    </View>
  );
}
