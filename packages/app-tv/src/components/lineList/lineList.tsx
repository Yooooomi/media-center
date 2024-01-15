import {FlatList, StyleSheet, ViewStyle} from 'react-native';
import {Box} from '../box';
import {ReactNode} from 'react';
import {spacing} from '../../services/constants';
import {MovieCardSize} from '../implementedUi/cards/movieCard';

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
    <FlatList
      keyExtractor={keyExtractor}
      data={data}
      renderItem={({item, index}) => (
        <Box p="S8">{renderItem(item, index)}</Box>
      )}
      getItemLayout={(_, index) => ({
        index,
        length: data.length,
        offset: index * MovieCardSize.height,
      })}
      numColumns={itemPerLine}
      style={[
        styles.root,
        isHorizontal ? undefined : styles.verticalScrollView,
        style,
      ]}
      horizontal={isHorizontal}
      showsHorizontalScrollIndicator={false}
      windowSize={3}
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