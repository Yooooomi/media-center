import { ViewStyle } from "react-native";
import { SharedValue } from "react-native-reanimated";

export interface ProgressBarProps {
  // A number between 0 and 1
  progress: SharedValue<number> | number;
  style?: ViewStyle;
  duration: number;
  onSeek: (timeMs: number) => void;
}
