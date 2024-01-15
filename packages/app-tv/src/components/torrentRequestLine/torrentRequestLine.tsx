import {TorrentRequest} from '@media-center/server/src/domains/torrentRequest/domain/torrentRequest';
import {StyleSheet} from 'react-native';
import {Box} from '../box';
import {ProgressBar} from '../progressBar';
import {Text} from '../text';

interface TorrentRequestLineProps {
  torrentRequest: TorrentRequest;
}

export function TorrentRequestLine({torrentRequest}: TorrentRequestLineProps) {
  return (
    <Box>
      <Box
        gap="S4"
        key={torrentRequest.id.toString()}
        row
        items="center"
        content="space-between">
        <Text
          size="small"
          ellipsizeMode="tail"
          numberOfLines={1}
          style={styles.name}>
          {torrentRequest.name}
        </Text>
        <Text size="small">{torrentRequest.getSizeProgress()}</Text>
      </Box>
      <Box row items="center" gap="S8" content="flex-end">
        <Text size="small">{torrentRequest.getPercentage()}%</Text>
        <Text size="small">{torrentRequest.getSpeed()}</Text>
        <ProgressBar
          progress={torrentRequest.getClampedDownloaded()}
          style={styles.bar}
        />
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: 100,
  },
  name: {
    flexShrink: 1,
  },
});
