import {View, StyleSheet} from 'react-native';
import {radius, card, cardShadow, color} from '../../../services/constants';
import LoggedImage from '../../loggedImage';
import {ScaleButton} from '../pressable/scaleButton';
import Box from '../../box';
import Icon from '../../icon';
import {DisabledFill} from '../../disabledFill';

interface VerticalCardProps {
  uri: string | undefined;
  focusOnMount?: boolean;
  onPress: () => void;
  disabled?: boolean;
  progress?: number;
}

export function VerticalCard({
  uri,
  onPress,
  focusOnMount,
  disabled,
  progress,
}: VerticalCardProps) {
  return (
    <ScaleButton focusOnMount={focusOnMount} onPress={onPress} border>
      <View style={styles.root}>
        {uri ? (
          <LoggedImage uri={uri} style={styles.image} resizeMode="cover" />
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
        {progress && progress < 1 ? (
          <View
            style={[styles.progress, {width: `${Math.floor(progress * 100)}%`}]}
          />
        ) : null}
        {progress && progress === 1 ? (
          <View style={styles.finished}>
            <Icon name="check" />
          </View>
        ) : null}
      </View>
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
    height: 3,
    bottom: 0,
    backgroundColor: color.progress,
  },
  finished: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
