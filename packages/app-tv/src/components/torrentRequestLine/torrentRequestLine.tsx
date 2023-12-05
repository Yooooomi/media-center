import {TorrentRequest} from '@media-center/server/src/domains/torrentRequest/domain/torrentRequest';
import {StyleSheet, Text} from 'react-native';
import Box from '../box';
import ProgressBar from '../progressBar/progressBar';

interface TorrentRequestLineProps {
  torrentRequest: TorrentRequest;
}

export default function TorrentRequestLine({
  torrentRequest,
}: TorrentRequestLineProps) {
  return (
    <Box
      row
      gap="S8"
      key={torrentRequest.id.toString()}
      content="space-between">
      <Text style={styles.name} ellipsizeMode="tail" numberOfLines={1}>
        {torrentRequest.name}
      </Text>
      <Box gap="S4" row>
        <Text style={styles.sizeProgressText}>
          {torrentRequest.getSizeProgress()}
        </Text>
        <Text style={styles.progressText}>
          {torrentRequest.getPercentage()}%
        </Text>
        <Box items="center" row>
          <ProgressBar
            progress={torrentRequest.getClampedDownloaded()}
            style={styles.bar}
          />
        </Box>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  name: {
    width: '50%',
  },
  sizeProgressText: {
    width: 150,
    textAlign: 'right',
  },
  progressText: {
    width: 50,
    textAlign: 'right',
  },
  bar: {
    width: 100,
  },
});
