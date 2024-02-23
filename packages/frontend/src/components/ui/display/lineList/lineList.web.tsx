import { StyleSheet, View } from "react-native";
import { spacing } from "@media-center/ui/src/constants";
import { useMemo } from "react";
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
      data.map((e, index) => (
        <div key={keyExtractor(e)}>{renderItem(e, index)}</div>
      )),
    [data, keyExtractor, renderItem],
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
    padding: spacing.S8,
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
    gap: 8,
  },
  vertical: {
    flexDirection: "row",
    flexWrap: "wrap",
    display: "flex",
    gap: 8,
  },
});
