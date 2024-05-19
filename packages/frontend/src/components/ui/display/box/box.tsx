import { CSSProperties, ComponentType, ReactNode, useMemo } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import {
  AutoSpacing,
  Spacing,
  color,
  debugBorder,
  getSpacing,
  opacify,
  radius,
  spacing,
} from "@media-center/ui/src/constants";
import { Pressable } from "../../input/pressable/pressable";
import { ScrollViewPadded } from "../scrollViewPadded";

export interface BoxProps {
  m?: AutoSpacing;
  mh?: AutoSpacing;
  mv?: AutoSpacing;
  mt?: AutoSpacing;
  mb?: AutoSpacing;
  ml?: AutoSpacing;
  mr?: AutoSpacing;
  p?: AutoSpacing;
  ph?: AutoSpacing;
  pv?: AutoSpacing;
  pt?: AutoSpacing;
  pb?: AutoSpacing;
  pl?: AutoSpacing;
  pr?: AutoSpacing;
  gap?: Spacing;
  maxh?: ViewStyle["maxHeight"];
  maxw?: ViewStyle["maxWidth"];
  minw?: ViewStyle["minWidth"];
  basis?: ViewStyle["flexBasis"];
  overflow?: ViewStyle["overflow"];
  h?: ViewStyle["height"] | CSSProperties["height"];
  w?: ViewStyle["width"] | CSSProperties["width"];
  r?: keyof typeof radius;
  shrink?: boolean;
  grow?: boolean;
  items?: ViewStyle["alignItems"];
  content?: ViewStyle["justifyContent"];
  bg?: keyof typeof color | [keyof typeof color, number];
  row?: boolean;
  debug?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  flex?: number;
  opacity?: number;
  ratio?: ViewStyle["aspectRatio"];
}

function getComputedColor(
  c: keyof typeof color | [keyof typeof color, number],
) {
  if (Array.isArray(c)) {
    return opacify(...c);
  }
  return color[c];
}

function useBoxStyle({
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
  shrink,
  grow,
  bg,
  debug,
  flex,
  opacity,
  ratio,
  minw,
}: BoxProps) {
  return useMemo<ViewStyle>(
    () => ({
      margin: getSpacing(m),
      marginVertical: getSpacing(mv),
      marginHorizontal: getSpacing(mh),
      marginTop: getSpacing(mt),
      marginBottom: getSpacing(mb),
      marginLeft: getSpacing(ml),
      marginRight: getSpacing(mr),
      padding: getSpacing(p),
      paddingVertical: getSpacing(pv),
      paddingHorizontal: getSpacing(ph),
      paddingTop: getSpacing(pt),
      paddingBottom: getSpacing(pb),
      paddingLeft: getSpacing(pl),
      paddingRight: getSpacing(pr),
      flexDirection: row ? "row" : undefined,
      gap: gap && spacing[gap],
      alignItems: items,
      justifyContent: content,
      flexShrink: shrink === undefined ? undefined : shrink ? 1 : 0,
      flexGrow: grow === undefined ? undefined : grow ? 1 : 0,
      width: w !== undefined ? (w as any) : undefined,
      height: h !== undefined ? (h as any) : undefined,
      backgroundColor: bg ? getComputedColor(bg) : undefined,
      maxWidth: maxw !== undefined ? maxw : undefined,
      minWidth: minw !== undefined ? minw : undefined,
      maxHeight: maxh !== undefined ? maxh : undefined,
      borderRadius: r && radius[r],
      overflow,
      basis,
      flex: flex !== undefined ? flex : undefined,
      opacity: opacity !== undefined ? opacity : undefined,
      aspectRatio: ratio,
      ...(debug && debugBorder("red")),
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
      minw,
      maxh,
      r,
      overflow,
      basis,
      flex,
      opacity,
      ratio,
      debug,
    ],
  );
}

function withBox<T extends { style?: StyleProp<ViewStyle> }>(
  Component: ComponentType<T>,
) {
  return ({
    basis,
    bg,
    content,
    debug,
    flex,
    gap,
    grow,
    h,
    items,
    m,
    maxh,
    maxw,
    mb,
    mh,
    ml,
    mr,
    mt,
    mv,
    opacity,
    overflow,
    p,
    pb,
    ph,
    pl,
    pr,
    pt,
    pv,
    r,
    row,
    shrink,
    style,
    w,
    ratio,
    minw,
    ...props
  }: T & BoxProps) => {
    const styles = useBoxStyle({
      basis,
      bg,
      content,
      debug,
      flex,
      gap,
      grow,
      h,
      items,
      m,
      maxh,
      maxw,
      mb,
      mh,
      ml,
      mr,
      mt,
      mv,
      opacity,
      overflow,
      p,
      pb,
      ph,
      pl,
      pr,
      pt,
      pv,
      r,
      row,
      shrink,
      w,
      ratio,
      minw,
    });
    return (
      <Component
        {...(props as T)}
        style={StyleSheet.flatten([
          { pointerEvents: "box-none" },
          styles,
          style,
        ])}
      />
    );
  };
}

export const Box = withBox(View);
export const SafeAreaBox = withBox(SafeAreaView);
export const PressableBox = withBox(Pressable);
export const ScrollViewBox = withBox(ScrollView);
export const ScrollViewPaddedBox = withBox(ScrollViewPadded);
