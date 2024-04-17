import { Platform } from "react-native";

export function isNative() {
  return Platform.OS !== "web";
}

export function isMobile() {
  return !Platform.isTV && (Platform.OS === "ios" || Platform.OS === "android");
}

export function isTV() {
  return Platform.isTV;
}
