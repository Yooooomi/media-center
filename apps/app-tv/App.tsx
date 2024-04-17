import "./src/services/injection/navigation.injected";
import { Platform, StyleSheet, View } from "react-native";
import { color } from "@media-center/ui/src/constants";
import { Navigation } from "@media-center/frontend/src/screens";
import { useListenToUpdate } from "./src/services/listenToUpdate";

// SplashScreen.preventAutoHideAsync().catch(console.error);

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

export function App() {
  useListenToUpdate();

  return (
    // <SplashScreenProxy>
    <View style={styles.root}>
      <Navigation />
    </View>
    // </SplashScreenProxy>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: color.background,
  },
});
