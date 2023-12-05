import {StyleSheet} from 'react-native';
import {cardShadow, hcard, radius} from '../../services/constants';
import {combineStyles} from '../../services/utils';
import Box from '../box';
import LoggedImage from '../loggedImage';
import Pill from '../pill';
import Pressable, {PressableProps} from '../pressable/pressable';
import Text from '../text/text';

export type ExtraInfoCardProps = Omit<PressableProps, 'children'>;

export interface InfoCardProps extends ExtraInfoCardProps {
  imageUri: string | undefined;
  pillText: string;
  title: string;
  subtitle: string;
}

export const InfoCardSize = {
  width: hcard.width,
  height: hcard.height + 30,
};

export default function InfoCard({
  imageUri,
  pillText,
  title,
  subtitle,
  style,
  ...other
}: InfoCardProps) {
  return (
    <Box>
      <Pressable style={combineStyles(styles.root, style)} {...other}>
        <LoggedImage uri={imageUri} style={styles.image} resizeMode="cover" />
      </Pressable>
      <Box
        row
        gap="S8"
        items="flex-start"
        content="space-between"
        shrink
        mt="S8"
        maxw={hcard.width}
        overflow="hidden">
        <Box h={40} shrink>
          <Text size="smaller" color="whiteText" numberOfLines={1}>
            {title}
          </Text>
          <Text size="small" color="text">
            {subtitle}
          </Text>
        </Box>
        <Pill mt="S8">{pillText}</Pill>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.default,
    height: hcard.height,
    width: hcard.width,
    overflow: 'hidden',
    ...cardShadow,
  },
  image: {
    height: hcard.height,
    width: hcard.width,
  },
});
