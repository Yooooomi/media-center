import {ReactNode} from 'react';
import Box, {BoxProps} from '../box/box';
import Text from '../text/text';

interface SectionProps extends BoxProps {
  title: string;
  titleBox?: Omit<BoxProps, 'children'>;
  children: ReactNode;
}

export default function Section({
  title,
  children,
  titleBox,
  ...other
}: SectionProps) {
  return (
    <Box {...other}>
      <Box mb="S8" {...titleBox}>
        <Text bold size="title">
          {title}
        </Text>
      </Box>
      {children}
    </Box>
  );
}
