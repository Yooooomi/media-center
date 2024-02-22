import { useRef } from "react";
import { useLocation } from "react-router-native";

export function useFocused() {
  const l = useLocation();
  const first = useRef(l.hash);

  return l.hash === first.current;
}
