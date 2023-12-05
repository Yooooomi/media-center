import {ReactNode} from 'react';
import {FlatList, FlatListProps, StyleSheet} from 'react-native';
import Section, {SectionProps} from '../section/section';
import {spacing} from '../../services/constants';
import Box from '../box/box';

export interface SectionLineProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  keyExtractor: (data: T) => string;
  renderItem: (data: T, index: number) => ReactNode;
}

export interface ExtraSectionLineProps<T> {
  itemPerLine?: number;
  sectionProps?: Omit<SectionProps, 'children' | 'title'>;
  scrollViewProps?: Omit<FlatListProps<T>, 'renderItem' | 'data'>;
}

export default function SectionLine<T>({
  title,
  subtitle,
  data,
  keyExtractor,
  renderItem,
  itemPerLine,
  sectionProps,
  scrollViewProps,
}: SectionLineProps<T> & ExtraSectionLineProps<T>) {
  const isHorizontal = itemPerLine === undefined;

  return (
    <Section
      title={title}
      subtitle={subtitle}
      grow={isHorizontal ? undefined : true}
      {...sectionProps}>
      <FlatList
        // removeClippedSubviews
        keyExtractor={keyExtractor}
        data={data}
        renderItem={({item, index}) => (
          <Box p="S8">{renderItem(item, index)}</Box>
        )}
        numColumns={itemPerLine}
        {...scrollViewProps}
        style={[
          styles.root,
          isHorizontal ? undefined : styles.verticalScrollView,
        ]}
        horizontal={isHorizontal}
        showsHorizontalScrollIndicator={false}
      />
    </Section>
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
