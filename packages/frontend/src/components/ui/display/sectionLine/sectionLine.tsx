import { ReactNode } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { spacing } from "@media-center/ui/src/constants";
import { Section, SectionProps } from "../section/section";
import { LineList } from "../lineList";

export interface SectionLineProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  keyExtractor: (data: T) => string;
  renderItem: (data: T, index: number) => ReactNode;
}

export interface ExtraSectionLineProps {
  itemPerLine?: number;
  sectionProps?: Omit<SectionProps, "children" | "title">;
  style?: StyleProp<ViewStyle>;
}

export function SectionLine<T>({
  title,
  subtitle,
  data,
  keyExtractor,
  renderItem,
  itemPerLine,
  sectionProps,
  style,
}: SectionLineProps<T> & ExtraSectionLineProps) {
  const isHorizontal = itemPerLine === undefined;

  return (
    <Section
      title={title}
      subtitle={subtitle}
      grow={isHorizontal ? undefined : true}
      {...sectionProps}
      style={style}
    >
      <LineList
        style={styles.align}
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        itemPerLine={itemPerLine}
      />
    </Section>
  );
}

const styles = StyleSheet.create({
  align: {
    marginLeft: -spacing.S8,
  },
});
