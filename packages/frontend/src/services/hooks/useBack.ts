import { useEffect } from "react";
import { BackHandler, TVEventControl } from "react-native";

export function useBack(callback: () => boolean) {
  useEffect(() => {
    TVEventControl.enableTVMenuKey();
    BackHandler.addEventListener("hardwareBackPress", callback);
    return () => {
      TVEventControl.disableTVMenuKey();
      BackHandler.removeEventListener("hardwareBackPress", callback);
    };
  }, [callback]);
}
