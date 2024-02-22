import {
  Text as RNText,
  TextStyle,
  TextProps as RNTextProps,
  StyleProp,
} from "react-native";
import { ReactNode, useMemo } from "react";
import { color, fontSize } from "@media-center/ui/src/constants";

export type Accepted = string | number | ReactNode | undefined;

export interface TextProps extends RNTextProps {
  size?: keyof typeof fontSize;
  bold?: boolean;
  color?: keyof typeof color;
  lineHeight?: TextStyle["lineHeight"];
  children: Accepted | Accepted[];
  align?: TextStyle["textAlign"];
}

export function Text({
  size = "default",
  bold,
  children,
  style,
  color: pcolor,
  align,
  lineHeight,
  ...other
}: TextProps) {
  const styles = useMemo<StyleProp<TextStyle>>(
    () => [
      {
        fontFamily: bold ? "Montserrat-Bold" : "Montserrat",
        fontSize: fontSize[size],
        color: pcolor ? color[pcolor] : color.whiteText,
        textAlign: align,
        lineHeight,
      },
      style,
    ],
    [bold, size, pcolor, align, lineHeight, style],
  );

  return (
    <RNText style={styles} {...other}>
      {children}
    </RNText>
  );
}
