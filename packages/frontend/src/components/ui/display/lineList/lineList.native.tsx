import { FlatList, StyleSheet, TVFocusGuideView } from "react-native";
import { Box } from "../box";
import { LineListProps } from "./lineList.props";

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
      ]}
    >
      <FlatList
        style={[isHorizontal ? undefined : styles.vertical, style]}
        keyExtractor={keyExtractor}
        data={data}
        renderItem={({ item, index }) => {
          const isEndOfLine =
            (isHorizontal && index === data.length - 1) ||
            (!isHorizontal && index % itemPerLine === itemPerLine - 1);
          return (
            <Box mr={!isEndOfLine ? "S8" : undefined}>
              {renderItem(item, index)}
            </Box>
          );
        }}
        // getItemLayout={(_, index) => ({
        //   index,
        //   length: data.length,
        //   offset: index * MovieCardSize.height,
        // })}
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
  vertical: {
    height: "100%",
  },
});
