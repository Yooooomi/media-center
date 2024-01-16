import LottieView from 'lottie-react-native';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {StyleSheet} from 'react-native';
import Bootsplash from 'react-native-bootsplash';
import animation from './timotex.lottie.json';
import {color} from '../constants';
import Animated, {FadeOut} from 'react-native-reanimated';

export const SplashScreenContext = React.createContext({
  hide: () => {},
});

interface SplashScreenContextProviderProps {
  children: ReactNode;
}

export function SplashScreenContextProvider({
  children,
}: SplashScreenContextProviderProps) {
  const [showLottie, setShowLottie] = useState(true);
  const readyToHide = useRef(false);
  const requestedHide = useRef(false);

  useEffect(() => {
    Bootsplash.hide({fade: false});
  }, []);

  const context = useMemo(
    () => ({
      hide: () => {
        if (readyToHide.current) {
          setShowLottie(false);
        } else {
          requestedHide.current = true;
        }
      },
    }),
    [],
  );

  const checkHide = useCallback(() => {
    readyToHide.current = true;
    if (requestedHide.current) {
      setShowLottie(false);
    }
  }, []);

  return (
    <SplashScreenContext.Provider value={context}>
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
    </SplashScreenContext.Provider>
  );
}

const styles = StyleSheet.create({
  lottieContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: color.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 288,
    height: 288,
  },
});
