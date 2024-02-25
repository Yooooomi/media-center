import Icons from "react-native-vector-icons/MaterialCommunityIcons";
import React from "react";
import Animated from "react-native-reanimated";
import { color as colors } from "@media-center/ui/src/constants";
import { IconProps } from "./icon.props";

export const Icon = React.forwardRef<Icons, IconProps>(
  ({ name, size, color, style }, ref) => {
    return (
      <Icons
        style={style}
        ref={ref}
        name={name}
        size={size}
        color={colors[color ?? "whiteText"]}
      />
    );
  },
);

export const AnimatedIcon = Animated.createAnimatedComponent(Icon);
