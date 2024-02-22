import { TorrentRequest } from "@media-center/domains/src/torrentRequest/domain/torrentRequest";
import { TorrentRequestLine } from "../torrentRequestLine";
import { Box } from "../../ui/display/box";

interface TorrentRequestsProps {
  requests: TorrentRequest[] | undefined;
}

export function TorrentRequests({ requests }: TorrentRequestsProps) {
  return (
    <>
      {requests?.map((request) => (
        <Box grow mb="S8" key={request.id.toString()}>
          <TorrentRequestLine torrentRequest={request} />
        </Box>
      ))}
    </>
  );
}
