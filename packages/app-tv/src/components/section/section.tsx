import {ReactNode} from 'react';
import Box, {BoxProps} from '../box/box';
import Text, {TextProps} from '../text/text';
import {StyleSheet} from 'react-native';

export interface SectionProps extends BoxProps {
  title: string;
  subtitle?: string;
  titleBox?: Omit<BoxProps, 'children'>;
  textProps?: Omit<TextProps, 'children'>;
  children: ReactNode;
  right?: ReactNode;
}

export default function Section({
  title,
  subtitle,
  children,
  titleBox,
  textProps,
  right,
  ...other
}: SectionProps) {
  return (
    <Box {...other}>
      <Box mb="S8" row {...titleBox}>
        <Box>
          <Text bold size="title" {...textProps}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.closeSubtitles} color="text">
              {subtitle}
            </Text>
          )}
        </Box>
        {right}
      </Box>
      <Box grow>{children}</Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  closeSubtitles: {
    marginTop: -2,
  },
});
