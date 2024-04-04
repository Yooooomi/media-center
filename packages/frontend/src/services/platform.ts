import { Platform } from "react-native";

export function isNative() {
  return Platform.OS !== "web";
}

export function isMobile() {
  return Platform.OS === "ios" || Platform.OS === "android";
}

export function isTV() {
  return Platform.isTV;
}
