import { ScrollView, ScrollViewProps } from "react-native";
import { useHeaderHeight } from "../../../../services/hooks/useHeaderHeight";

export function ScrollViewPadded({ style, ...other }: ScrollViewProps) {
  return (
    <ScrollView
      contentContainerStyle={[style, { paddingTop: useHeaderHeight() }]}
      {...other}
    />
  );
}
