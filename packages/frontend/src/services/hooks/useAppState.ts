import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

export function useAppState() {
  const [state, setState] = useState<AppStateStatus>("active");

  useEffect(() => {
    const sub = AppState.addEventListener("change", setState);
    return sub.remove;
  }, []);

  return state;
}
