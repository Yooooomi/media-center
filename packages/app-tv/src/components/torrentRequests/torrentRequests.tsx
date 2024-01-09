import {TorrentRequest} from '@media-center/server/src/domains/torrentRequest/domain/torrentRequest';
import {TorrentRequestLine} from '../torrentRequestLine';
import {Box} from '../box';

interface TorrentRequestsProps {
  requests: TorrentRequest[] | undefined;
}

export function TorrentRequests({requests}: TorrentRequestsProps) {
  return (
    <>
      {requests?.map(request => (
        <Box mb="S8" key={request.id.toString()}>
          <TorrentRequestLine torrentRequest={request} />
        </Box>
      ))}
    </>
  );
}
