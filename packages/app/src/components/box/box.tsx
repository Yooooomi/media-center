import {ReactNode, useMemo} from 'react';
import {spacing} from '../../services/constants';
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
  items?: ViewStyle['alignItems'];
  content?: ViewStyle['justifyContent'];
  row?: boolean;
  children: ReactNode;
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
    }),
    [
      content,
      gap,
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
    ],
  );

  return <View style={styles}>{children}</View>;
}
