import { Platform } from "react-native";

export function isNative() {
  return Platform.OS !== "web";
}
