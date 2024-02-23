import MaterialCommunityIconsGlyphs from "react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json";
import React, { ComponentProps } from "react";
import Animated from "react-native-reanimated";
import { color as colors } from "@media-center/ui/src/constants";
// @ts-expect-error
import Icons from "react-native-vector-icons/dist/MaterialCommunityIcons";
// @ts-expect-error
import iconFont from "react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf";

const iconFontStyles = `@font-face {
    src: url(${iconFont});
    font-family: MaterialCommunityIcons;
  }`;

// Create a stylesheet
const fontStyle = document.createElement("style") as any;

// Append the iconFontStyles to the stylesheet
if (fontStyle.styleSheet) {
  fontStyle.styleSheet.cssText = iconFontStyles;
} else {
  fontStyle.appendChild(document.createTextNode(iconFontStyles));
}

// Inject the stylesheet into the document head
document.head.appendChild(fontStyle);

export type IconName = keyof typeof MaterialCommunityIconsGlyphs;

interface IconProps {
  name: IconName;
  color?: keyof typeof colors;
  size?: number;
  style?: ComponentProps<typeof Icons>["style"];
}

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
