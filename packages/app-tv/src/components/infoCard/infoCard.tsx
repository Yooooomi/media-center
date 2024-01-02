import {StyleSheet} from 'react-native';
import {cardShadow, hcard, radius} from '../../services/constants';
import Box from '../box';
import Pill from '../pill';
import Text from '../text/text';
import {ScaleButton} from '../ui/pressable/scaleButton';
import {noop} from '@media-center/algorithm';
import {DisabledFill} from '../disabledFill';
import {RateLimitedImage} from '../rateLimitedImage';
import {ProgressOverlay} from '../progressOverlay';

export interface InfoCardProps {
  imageUri: string | undefined;
  pillText: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  focusOnMount?: boolean;
  disabled?: boolean;
  progress?: number;
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
  onPress,
  focusOnMount,
  disabled,
  progress,
}: InfoCardProps) {
  return (
    <Box>
      <ScaleButton
        onPress={disabled ? noop : onPress}
        focusOnMount={focusOnMount}
        border>
        <ProgressOverlay style={styles.root} progress={progress}>
          <RateLimitedImage
            uri={imageUri}
            style={styles.image}
            resizeMode="cover"
          />
          {disabled ? <DisabledFill /> : null}
        </ProgressOverlay>
      </ScaleButton>
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
