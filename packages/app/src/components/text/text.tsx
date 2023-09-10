import {
  Text as RNText,
  TextStyle,
  TextProps as RNTextProps,
  StyleProp,
} from 'react-native';
import {color, fontSize} from '../../services/constants';
import {useMemo} from 'react';

type Accepted = string | number;

export interface TextProps extends RNTextProps {
  size?: keyof typeof fontSize;
  bold?: boolean;
  color?: keyof typeof color;
  children: Accepted | Accepted[];
}

export default function Text({
  size = 'default',
  bold,
  children,
  style,
  color: pcolor,
  ...other
}: TextProps) {
  const styles = useMemo<StyleProp<TextStyle>>(
    () => [
      {
        fontSize: fontSize[size],
        fontWeight: bold ? 'bold' : undefined,
        color: pcolor ? color[pcolor] : color.white,
      },
      style,
    ],
    [bold, pcolor, size, style],
  );

  return (
    <RNText style={styles} {...other}>
      {children}
    </RNText>
  );
}
