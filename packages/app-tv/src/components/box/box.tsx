import {ReactNode, useMemo} from 'react';
import {
  color,
  debugBorder,
  opacify,
  radius,
  spacing,
} from '../../services/constants';
import {View, ViewStyle} from 'react-native';

export interface BoxProps {
  m?: keyof typeof spacing;
  mh?: keyof typeof spacing;
  mv?: keyof typeof spacing;
  mt?: keyof typeof spacing;
  mb?: keyof typeof spacing;
  ml?: keyof typeof spacing;
  mr?: keyof typeof spacing;
  p?: keyof typeof spacing;
  ph?: keyof typeof spacing;
  pv?: keyof typeof spacing;
  pt?: keyof typeof spacing;
  pb?: keyof typeof spacing;
  pl?: keyof typeof spacing;
  pr?: keyof typeof spacing;
  gap?: keyof typeof spacing;
  maxh?: ViewStyle['maxHeight'];
  maxw?: ViewStyle['maxWidth'];
  basis?: ViewStyle['flexBasis'];
  overflow?: ViewStyle['overflow'];
  h?: ViewStyle['height'];
  w?: ViewStyle['width'];
  r?: keyof typeof radius;
  shrink?: boolean;
  grow?: boolean;
  items?: ViewStyle['alignItems'];
  content?: ViewStyle['justifyContent'];
  bg?: keyof typeof color | [keyof typeof color, number];
  row?: boolean;
  debug?: boolean;
  children?: ReactNode;
  style?: ViewStyle;
  flex?: number;
  opacity?: number;
}

function getComputedColor(
  c: keyof typeof color | [keyof typeof color, number],
) {
  if (Array.isArray(c)) {
    return opacify(...c);
  }
  return color[c];
}

export function Box({
  mb,
  ml,
  mr,
  mt,
  pb,
  pl,
  pr,
  pt,
  p,
  m,
  mh,
  mv,
  ph,
  pv,
  h,
  w,
  r,
  basis,
  overflow,
  row,
  gap,
  maxh,
  maxw,
  items,
  content,
  children,
  shrink,
  grow,
  bg,
  style,
  debug,
  flex,
  opacity,
}: BoxProps) {
  const styles = useMemo<ViewStyle>(
    () => ({
      margin: m && spacing[m],
      marginVertical: mv && spacing[mv],
      marginHorizontal: mh && spacing[mh],
      marginTop: mt && spacing[mt],
      marginBottom: mb && spacing[mb],
      marginLeft: ml && spacing[ml],
      marginRight: mr && spacing[mr],
      padding: p && spacing[p],
      paddingVertical: pv && spacing[pv],
      paddingHorizontal: ph && spacing[ph],
      paddingTop: pt && spacing[pt],
      paddingBottom: pb && spacing[pb],
      paddingLeft: pl && spacing[pl],
      paddingRight: pr && spacing[pr],
      flexDirection: row ? 'row' : undefined,
      gap: gap && spacing[gap],
      alignItems: items,
      justifyContent: content,
      flexShrink: shrink === undefined ? undefined : shrink ? 1 : 0,
      flexGrow: grow === undefined ? undefined : grow ? 1 : 0,
      width: w !== undefined ? w : undefined,
      height: h !== undefined ? h : undefined,
      backgroundColor: bg ? getComputedColor(bg) : undefined,
      maxWidth: maxw !== undefined ? maxw : undefined,
      maxHeight: maxh !== undefined ? maxh : undefined,
      borderRadius: r && radius[r],
      overflow,
      basis,
      flex: flex !== undefined ? flex : undefined,
      opacity: opacity !== undefined ? opacity : undefined,
      ...(debug && debugBorder('red')),
      ...style,
    }),
    [
      m,
      mv,
      mh,
      mt,
      mb,
      ml,
      mr,
      p,
      pv,
      ph,
      pt,
      pb,
      pl,
      pr,
      row,
      gap,
      items,
      content,
      shrink,
      grow,
      w,
      h,
      bg,
      maxw,
      maxh,
      r,
      overflow,
      basis,
      flex,
      opacity,
      debug,
      style,
    ],
  );

  return <View style={styles}>{children}</View>;
}
