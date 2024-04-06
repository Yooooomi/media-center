import { StyleSheet, View } from "react-native";
import { useMemo } from "react";
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

  const rendered = useMemo(
    () =>
      data.map((e, index) => {
        const isEndOfLine =
          (isHorizontal && index === data.length - 1) ||
          (!isHorizontal && index % itemPerLine === itemPerLine - 1);

        return (
          <Box key={keyExtractor(e)} mr={!isEndOfLine ? "S8" : undefined}>
            {renderItem(e, index)}
          </Box>
        );
      }),
    [data, isHorizontal, itemPerLine, keyExtractor, renderItem],
  );

  return (
    <View
      style={[
        styles.root,
        isHorizontal ? styles.horizontalWrapper : styles.verticalWrapper,
        style,
      ]}
    >
      <View style={isHorizontal ? styles.horizontal : styles.vertical}>
        {rendered}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    zIndex: 100,
  },
  verticalWrapper: {
    overflow: "scroll",
    flexBasis: 0,
  },
  horizontalWrapper: {
    overflow: "scroll",
  },
  horizontal: {
    flexDirection: "row",
    flexWrap: "nowrap",
  },
  vertical: {
    flexDirection: "row",
    flexWrap: "wrap",
    display: "flex",
  },
});
