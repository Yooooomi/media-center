import { useEffect } from "react";
import { AppState, AppStateEvent } from "react-native";

export function useAppStateEvent(event: AppStateEvent, onEvent: () => void) {
  useEffect(() => {
    const sub = AppState.addEventListener("change", (event) =>
      console.log("event", event),
    );
    return sub.remove;
  }, []);
}
