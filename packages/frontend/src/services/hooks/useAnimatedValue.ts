import { useEffect } from "react";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export function useAnimatedValue(value: number) {
  const animatedValue = useSharedValue(value);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration: 150,
      easing: Easing.ease,
    });
  }, [animatedValue, value]);

  return useAnimatedStyle(() => ({
    width: animatedValue.value,
  }));
}
