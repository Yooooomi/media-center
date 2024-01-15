import {StyleSheet} from 'react-native';
import {radius, card, cardShadow, color} from '../../../services/constants';
import {ScaleButton} from '../pressable/scaleButton';
import {Box} from '../../box';
import {Icon} from '../../icon';
import {DisabledFill} from '../../disabledFill';
import {RateLimitedImage} from '../../rateLimitedImage';
import {ProgressOverlay} from '../../progressOverlay';

interface VerticalCardProps {
  uri: string | undefined;
  focusOnMount?: boolean;
  onPress: () => void;
  disabled?: boolean;
  progress?: number;
  onFocus?: () => void;
}

export function VerticalCard({
  uri,
  onPress,
  focusOnMount,
  disabled,
  progress,
  onFocus,
}: VerticalCardProps) {
  return (
    <ScaleButton
      focusOnMount={focusOnMount}
      onPress={onPress}
      onFocus={onFocus}
      border>
      <ProgressOverlay style={styles.root} progress={progress}>
        {uri ? (
          <RateLimitedImage uri={uri} style={styles.image} resizeMode="cover" />
        ) : (
          <Box
            style={styles.image}
            bg="lightBackground"
            items="center"
            content="center">
            <Icon name="movie" size={36} />
          </Box>
        )}
        {disabled ? <DisabledFill /> : null}
      </ProgressOverlay>
    </ScaleButton>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.default,
    overflow: 'hidden',
    height: card.height,
    width: card.width,
    ...cardShadow,
  },
  image: {
    height: card.height,
    width: card.width,
  },
  progress: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    bottom: 0,
    backgroundColor: color.progress,
  },
});
