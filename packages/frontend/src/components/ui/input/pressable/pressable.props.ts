import { ReactNode } from "react";
import { ViewStyle } from "react-native";

export interface PressableProps {
  style?: ViewStyle;
  disabled?: boolean;
  children: ReactNode | ((infos: { focused: boolean }) => ReactNode);
  onPress: () => void;
  onLongPress?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  focusOnMount?: boolean;

  // Used to handle direction without refs
  name?: string;
  up?: (thisName: string) => string;
  down?: (thisName: string) => string;
  left?: (thisName: string) => string;
  right?: (thisName: string) => string;
}
