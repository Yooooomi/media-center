import {View, StyleSheet} from 'react-native';
import {radius, card, cardShadow} from '../../../services/constants';
import LoggedImage from '../../loggedImage';
import {ScaleButton} from '../pressable/scaleButton';

interface VerticalCardProps {
  uri: string | undefined;
  focusOnMount?: boolean;
  onPress: () => void;
}

export function VerticalCard({uri, onPress, focusOnMount}: VerticalCardProps) {
  return (
    <ScaleButton focusOnMount={focusOnMount} onPress={onPress} border>
      <View style={styles.root}>
        <LoggedImage uri={uri} style={styles.image} resizeMode="cover" />
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
});
