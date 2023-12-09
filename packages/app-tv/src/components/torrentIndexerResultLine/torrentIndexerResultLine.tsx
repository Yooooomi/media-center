import {TorrentIndexerResult} from '@media-center/server/src/domains/torrentIndexer/domain/torrentIndexerResult';
import Box from '../box';
import Text from '../text/text';
import {StyleSheet} from 'react-native';
import {Pressable} from '../ui/pressable/pressable';

interface TorrentIndexerResultLineProps {
  torrentIndexerResult: TorrentIndexerResult;
  onPress: () => void;
  focusOnMount?: boolean;
}

export default function TorrentIndexerResultLine({
  torrentIndexerResult,
  onPress,
  focusOnMount,
}: TorrentIndexerResultLineProps) {
  return (
    <Pressable onPress={onPress} focusOnMount={focusOnMount}>
      {({focused}) => (
        <Box p="S8">
          <Text color={focused ? 'buttonTextFocused' : 'buttonText'}>
            {torrentIndexerResult.name}
          </Text>
          <Box row content="space-between">
            <Text
              color={focused ? 'buttonTextFocused' : 'buttonText'}
              style={styles.left}>
              {torrentIndexerResult.toDisplaySize()}
            </Text>
            <Text color={'ctaGreen'} style={styles.mid}>
              {torrentIndexerResult.seeders.toString()}
            </Text>
            <Text color={'ctaGreen'} style={styles.right}>
              {torrentIndexerResult.leechers.toString()}
            </Text>
          </Box>
        </Box>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  left: {
    flex: 1,
  },
  mid: {
    flex: 1,
    textAlign: 'center',
  },
  right: {
    flex: 1,
    textAlign: 'right',
  },
});
