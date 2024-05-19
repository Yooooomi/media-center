import { TorrentIndexerResult } from "@media-center/domains/src/torrentIndexer/domain/torrentIndexerResult";
import { TorrentIndexerResultLine } from "../../components/implementedUi/torrentIndexerResultLine";
import { Box } from "../../components/ui/display/box";
import { Section } from "../../components/ui/display/section";
import { FullScreenLoading } from "../../components/ui/display/fullScreenLoading";

interface TorrentSearchResultsProps {
  results: TorrentIndexerResult[];
  askDownload: (result: TorrentIndexerResult) => void;
  isFocused: boolean;
  loading: boolean;
}

export function TorrentSearchResults({
  results,
  askDownload,
  isFocused,
  loading,
}: TorrentSearchResultsProps) {
  return (
    <Section title="Résultats">
      {!loading &&
        results.map((r, index) => (
          <Box mb="S8" key={r.id.toString()}>
            <TorrentIndexerResultLine
              focusOnMount={!isFocused && index === 0}
              torrentIndexerResult={r}
              onPress={() => askDownload(r)}
            />
          </Box>
        ))}
      {loading && <FullScreenLoading />}
    </Section>
  );
}
