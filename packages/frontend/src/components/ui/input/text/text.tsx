import {
  Text as RNText,
  TextStyle,
  TextProps as RNTextProps,
  StyleProp,
  Platform,
} from "react-native";
import { ReactNode, useMemo } from "react";
import { color, fontSize } from "@media-center/ui/src/constants";

export type Accepted = string | number | ReactNode | undefined;

export interface TextProps extends RNTextProps {
  size?: keyof typeof fontSize;
  bold?: boolean;
  bolder?: boolean;
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
  bolder,
  ...other
}: TextProps) {
  const styles = useMemo<StyleProp<TextStyle>>(
    () => [
      {
        fontFamily: Platform.select({
          default: bold ? "Montserrat-Bold" : "Montserrat",
          web: "Montserrat",
        }),
        fontWeight: Platform.select<TextStyle["fontWeight"]>({
          default: undefined,
          web: bold ? "bold" : bolder ? "500" : "normal",
        }),
        fontSize: fontSize[size],
        color: pcolor ? color[pcolor] : color.whiteText,
        textAlign: align,
        lineHeight,
      },
      style,
    ],
    [bold, bolder, size, pcolor, align, lineHeight, style],
  );

  return (
    <RNText style={styles} {...other}>
      {children}
    </RNText>
  );
}
