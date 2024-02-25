import MaterialCommunityIconsGlyphs from "react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json";
import Icons from "react-native-vector-icons/MaterialCommunityIcons";
import { ComponentProps } from "react";
import { color as colors } from "@media-center/ui/src/constants";

export type IconName = keyof typeof MaterialCommunityIconsGlyphs;

export interface IconProps {
  name: IconName;
  color?: keyof typeof colors;
  size?: number;
  style?: ComponentProps<typeof Icons>["style"];
}
