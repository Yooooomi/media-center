import {ReactNode, useMemo} from 'react';
import {color, spacing} from '../../services/constants';
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
  shrink?: boolean;
  grow?: boolean;
  width?: ViewStyle['width'];
  items?: ViewStyle['alignItems'];
  content?: ViewStyle['justifyContent'];
  bg?: keyof typeof color;
  row?: boolean;
  children: ReactNode;
  style?: ViewStyle;
}

export default function Box({
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
  row,
  gap,
  items,
  content,
  children,
  shrink,
  grow,
  width,
  bg,
  style,
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
      width,
      backgroundColor: bg && color[bg],
      ...style,
    }),
    [
      bg,
      content,
      gap,
      grow,
      items,
      m,
      mb,
      mh,
      ml,
      mr,
      mt,
      mv,
      p,
      pb,
      ph,
      pl,
      pr,
      pt,
      pv,
      row,
      shrink,
      style,
      width,
    ],
  );

  return <View style={styles}>{children}</View>;
}
