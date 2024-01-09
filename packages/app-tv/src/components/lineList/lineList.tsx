import {FlatList, StyleSheet} from 'react-native';
import {Box} from '../box';
import {ReactNode} from 'react';
import {spacing} from '../../services/constants';

interface LineListProps<T> {
  data: T[];
  keyExtractor: (data: T) => string;
  renderItem: (data: T, index: number) => ReactNode;
  itemPerLine?: number;
}

export function LineList<T>({
  data,
  keyExtractor,
  renderItem,
  itemPerLine,
}: LineListProps<T>) {
  const isHorizontal = itemPerLine === undefined;

  return (
    <FlatList
      // removeClippedSubviews
      keyExtractor={keyExtractor}
      data={data}
      renderItem={({item, index}) => (
        <Box p="S8">{renderItem(item, index)}</Box>
      )}
      numColumns={itemPerLine}
      style={[
        styles.root,
        isHorizontal ? undefined : styles.verticalScrollView,
      ]}
      horizontal={isHorizontal}
      showsHorizontalScrollIndicator={false}
    />
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
    flexDirection: 'row',
    gap: spacing.S16,
  },
});
