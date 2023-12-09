import {TorrentRequest} from '@media-center/server/src/domains/torrentRequest/domain/torrentRequest';
import {StyleSheet, Text} from 'react-native';
import Box from '../box';
import ProgressBar from '../progressBar';

interface TorrentRequestLineProps {
  torrentRequest: TorrentRequest;
}

export function TorrentRequestLine({torrentRequest}: TorrentRequestLineProps) {
  return (
    <Box gap="S4" key={torrentRequest.id.toString()} shrink items="flex-end">
      <Text ellipsizeMode="tail" numberOfLines={1}>
        {torrentRequest.name}
      </Text>
      <Box gap="S4" row items="center">
        <Text>{torrentRequest.getSizeProgress()}</Text>
        <Text>{torrentRequest.getPercentage()}%</Text>
        <ProgressBar
          progress={torrentRequest.getClampedDownloaded()}
          style={styles.bar}
        />
        <Text>{torrentRequest.getSpeed()}</Text>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: 100,
  },
});
