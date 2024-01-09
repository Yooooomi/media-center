import {ReactNode} from 'react';
import {Section, SectionProps} from '../section/section';
import {LineList} from '../lineList';

export interface SectionLineProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  keyExtractor: (data: T) => string;
  renderItem: (data: T, index: number) => ReactNode;
}

export interface ExtraSectionLineProps {
  itemPerLine?: number;
  sectionProps?: Omit<SectionProps, 'children' | 'title'>;
}

export function SectionLine<T>({
  title,
  subtitle,
  data,
  keyExtractor,
  renderItem,
  itemPerLine,
  sectionProps,
}: SectionLineProps<T> & ExtraSectionLineProps) {
  const isHorizontal = itemPerLine === undefined;

  return (
    <Section
      title={title}
      subtitle={subtitle}
      grow={isHorizontal ? undefined : true}
      {...sectionProps}>
      <LineList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        itemPerLine={itemPerLine}
      />
    </Section>
  );
}
