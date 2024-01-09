import {
  Text as RNText,
  TextStyle,
  TextProps as RNTextProps,
  StyleProp,
} from 'react-native';
import {color, fontSize} from '../../services/constants';
import {useMemo} from 'react';

export type Accepted = string | number | undefined;

export interface TextProps extends RNTextProps {
  size?: keyof typeof fontSize;
  bold?: boolean;
  color?: keyof typeof color;
  lineHeight?: TextStyle['lineHeight'];
  children: Accepted | Accepted[];
  align?: TextStyle['textAlign'];
}

export function Text({
  size = 'default',
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
        fontFamily: bold ? 'Rubik-Medium' : 'Rubik',
        fontSize: fontSize[size],
        color: pcolor ? color[pcolor] : color.whiteText,
        textAlign: align,
        lineHeight,
      },
      style,
    ],
    [align, bold, pcolor, size, style, lineHeight],
  );

  return (
    <RNText style={styles} {...other}>
      {children}
    </RNText>
  );
}
