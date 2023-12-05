import {TorrentIndexerResult} from '@media-center/server/src/domains/torrentIndexer/domain/torrentIndexerResult';
import Box from '../box';
import PressableGrey from '../pressableGrey';
import {PressableGreyProps} from '../pressableGrey/pressableGrey';
import Text from '../text/text';
import {StyleSheet} from 'react-native';

interface TorrentIndexerResultLineProps extends PressableGreyProps {
  torrentIndexerResult: TorrentIndexerResult;
}

export default function TorrentIndexerResultLine({
  torrentIndexerResult,
  ...other
}: TorrentIndexerResultLineProps) {
  return (
    <PressableGrey {...other}>
      <Box p="S8">
        <Text color="black">{torrentIndexerResult.name}</Text>
        <Box row content="space-between">
          <Text color="darkgrey" style={styles.left}>
            {torrentIndexerResult.toDisplaySize()}
          </Text>
          <Text color="green" style={styles.mid}>
            {torrentIndexerResult.seeders.toString()}
          </Text>
          <Text color="red" style={styles.right}>
            {torrentIndexerResult.leechers.toString()}
          </Text>
        </Box>
      </Box>
    </PressableGrey>
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
