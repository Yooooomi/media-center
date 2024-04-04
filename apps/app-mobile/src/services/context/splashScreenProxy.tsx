import LottieView from "lottie-react-native";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, { FadeOut } from "react-native-reanimated";
import * as SplashScreen from "expo-splash-screen";
import { color } from "@media-center/ui/src/constants";
import animation from "@media-center/frontend/src/assets/splash.lottie.json";
import { DI_HOOKS } from "@media-center/frontend/src/services/di/injectHook";

interface SplashScreenProxyProps {
  children: ReactNode;
}

export function SplashScreenProxy({ children }: SplashScreenProxyProps) {
  const [showLottie, setShowLottie] = useState(!__DEV__);
  const readyToHide = useRef(false);
  const requestedHide = useRef(false);

  useEffect(() => {
    SplashScreen.hideAsync().catch(console.error);
  }, []);

  const hide = useCallback(() => {
    if (readyToHide.current) {
      setShowLottie(false);
    } else {
      requestedHide.current = true;
    }
  }, []);

  useEffect(() => {
    DI_HOOKS.register("OnFirstAddedRecently", hide);
    return DI_HOOKS.unregister("OnFirstAddedRecently", hide);
  }, [hide]);

  const checkHide = useCallback(() => {
    readyToHide.current = true;
    if (requestedHide.current) {
      setShowLottie(false);
    }
  }, []);

  return (
    <>
      {children}
      {showLottie ? (
        <Animated.View style={styles.lottieContainer} exiting={FadeOut}>
          <LottieView
            onAnimationFinish={checkHide}
            autoPlay
            loop={false}
            source={animation}
            style={styles.lottie}
          />
        </Animated.View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  lottieContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: color.background,
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: 288,
    height: 288,
  },
});
