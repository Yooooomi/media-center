import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeOrPaddingProps {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export function SafeOrPadding({
  bottom,
  left,
  right,
  top,
}: SafeOrPaddingProps) {
  const {
    bottom: safeBottom,
    left: safeLeft,
    right: safeRight,
    top: safeTop,
  } = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: top !== undefined ? Math.max(safeTop, top) : undefined,
        paddingBottom:
          bottom !== undefined ? Math.max(safeBottom, bottom) : undefined,
        paddingLeft: left !== undefined ? Math.max(safeLeft, left) : undefined,
        paddingRight:
          right !== undefined ? Math.max(safeRight, right) : undefined,
      }}
    />
  );
}
