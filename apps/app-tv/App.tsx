import { Platform, StyleSheet, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { color } from "@media-center/ui/src/constants";
import { Navigation } from "@media-center/frontend/src/screens";
import { useListenToUpdate } from "./src/services/listenToUpdate";
import { SplashScreenProxy } from "./src/services/context/splashScreenProxy";
import { NavigationContext, useNavigate } from "@media-center/frontend/src/screens/params";
import { InjectUnderContext } from "@media-center/frontend/src/services/di/injectableContext";
import { useBack } from "@media-center/frontend/src/services/hooks/useBack";
import { useCallback } from "react";

SplashScreen.preventAutoHideAsync().catch(console.error);

const fonts = Platform.select<Record<string, string>>({
  default: {
    Rubik: "Rubik",
    "Rubik-Medium": "Rubik-Medium",
    "Rubik-Bold": "Rubik-Bold",
    "Rubik-SemiBold": "Rubik-SemiBold",
    "Rubik-Light": "Rubik-Light",
  },
  android: {
    Rubik: "rubik-regular",
    "Rubik-Medium": "rubik-medium",
    "Rubik-Bold": "rubik-bold",
    "Rubik-SemiBold": "rubik-semibold",
    "Rubik-Light": "rubik-light",
  },
});

StyleSheet.setStyleAttributePreprocessor("fontFamily", (next) => {
  return fonts[next] ?? next;
});

InjectUnderContext(NavigationContext.Provider, () => {
  const { goBack } = useNavigate();

  useBack(
    useCallback(() => {
      goBack();
      return true;
    }, [goBack]),
  );

  return null;
});

export function App() {
  useListenToUpdate();

  return (
    <SplashScreenProxy>
      <View style={styles.root}>
        <Navigation />
      </View>
    </SplashScreenProxy>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: color.background,
  },
});
