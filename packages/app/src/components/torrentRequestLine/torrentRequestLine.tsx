import {TorrentRequest} from '@media-center/server/src/domains/torrentRequest/domain/torrentRequest';
import {Circle} from 'react-native-progress';
import {Text} from 'react-native';
import Box from '../box';

interface TorrentRequestLineProps {
  torrentRequest: TorrentRequest;
}

export default function TorrentRequestLine({
  torrentRequest,
}: TorrentRequestLineProps) {
  return (
    <Box row gap="S8" key={torrentRequest.id.toString()}>
      <Text>{torrentRequest.downloaded}</Text>
      <Circle
        borderWidth={0}
        progress={torrentRequest.getClampedDownloaded()}
        showsText
      />
      <Text>{torrentRequest.name}</Text>
    </Box>
  );
}
