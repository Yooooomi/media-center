import {
  FlatList,
  StyleSheet,
  TVFocusGuideView,
  ViewStyle,
} from "react-native";
import { ReactNode } from "react";
import { spacing } from "@media-center/ui/src/constants";
import { Box } from "../box";
import { MovieCardSize } from "../../../implementedUi/cards/movieCard";

interface LineListProps<T> {
  data: T[];
  keyExtractor: (data: T) => string;
  renderItem: (data: T, index: number) => ReactNode;
  itemPerLine?: number;
  style?: ViewStyle;
}

export function LineList<T>({
  data,
  keyExtractor,
  renderItem,
  itemPerLine,
  style,
}: LineListProps<T>) {
  const isHorizontal = itemPerLine === undefined;

  return (
    <TVFocusGuideView
      trapFocusRight
      style={[
        styles.root,
        isHorizontal ? undefined : styles.verticalScrollView,
        style,
      ]}
    >
      <FlatList
        keyExtractor={keyExtractor}
        data={data}
        renderItem={({ item, index }) => (
          <Box p="S8">{renderItem(item, index)}</Box>
        )}
        getItemLayout={(_, index) => ({
          index,
          length: data.length,
          offset: index * MovieCardSize.height,
        })}
        numColumns={itemPerLine}
        horizontal={isHorizontal}
        showsHorizontalScrollIndicator={false}
        windowSize={3}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
      />
    </TVFocusGuideView>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
  },
  verticalScrollView: {
    flexBasis: 0,
  },
  verticalLine: {
    flexDirection: "row",
    gap: spacing.S16,
  },
});
