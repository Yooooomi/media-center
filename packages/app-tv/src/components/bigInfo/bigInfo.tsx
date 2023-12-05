import {BlurView} from '@react-native-community/blur';
import Box from '../box';
import Text, {Accepted} from '../text/text';
import {StyleSheet} from 'react-native';

interface BigInfoProps {
  info: Accepted | Accepted[];
}

export function BigInfo({info}: BigInfoProps) {
  return (
    <Box r="big" overflow="hidden" style={styles.bigInfo}>
      <BlurView overlayColor="transparent" style={styles.grow}>
        <Box grow bg={['text', 0.1]} items="center" content="center">
          <Text bold size="big">
            {info}
          </Text>
        </Box>
      </BlurView>
    </Box>
  );
}

const BUTTON_SIZE = {
  width: (190 * 2) / 3,
  height: (120 * 2) / 3,
};

const styles = StyleSheet.create({
  bigInfo: {
    ...BUTTON_SIZE,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  grow: {
    flexGrow: 1,
  },
});
