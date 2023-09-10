import {ReactNode} from 'react';
import Box, {BoxProps} from '../box/box';
import Text, {TextProps} from '../text/text';

interface SectionProps extends BoxProps {
  title: string;
  titleBox?: Omit<BoxProps, 'children'>;
  textProps?: Omit<TextProps, 'children'>;
  children: ReactNode;
}

export default function Section({
  title,
  children,
  titleBox,
  textProps,
  ...other
}: SectionProps) {
  return (
    <Box {...other}>
      <Box mb="S8" {...titleBox}>
        <Text bold size="title" {...textProps}>
          {title}
        </Text>
      </Box>
      {children}
    </Box>
  );
}
