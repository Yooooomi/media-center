import { ReactNode } from "react";
import { ViewStyle } from "react-native";

export interface LineListProps<T> {
  data: T[];
  keyExtractor: (data: T) => string;
  renderItem: (data: T, index: number) => ReactNode;
  itemPerLine?: number;
  style?: ViewStyle;
}
