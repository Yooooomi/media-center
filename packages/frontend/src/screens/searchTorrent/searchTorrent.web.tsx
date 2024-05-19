import { useCallback, useEffect, useState } from "react";
import { SearchTorrentsQuery } from "@media-center/domains/src/torrentIndexer/applicative/searchTorrents.query";
import { TorrentIndexerResult } from "@media-center/domains/src/torrentIndexer/domain/torrentIndexerResult";
import { AddRawTorrentRequestCommand } from "@media-center/domains/src/torrentRequest/applicative/addRawTorrentRequest.command";
import { SearchQuery } from "@media-center/domains/src/miscellaneous/tools/searchQuery";
import { useAlert } from "../../components/ui/tools/alert/alertProvider";
import { handleBasicUserQuery } from "../../components/ui/tools/promptAlert";
import { Beta } from "../../services/api/api";
import { BoxPadded } from "../../components/ui/display/boxPadded";
import { useParams } from "../navigation.dependency";
import { TorrentSearchResults } from "./torrentSearchResults";

export function SearchTorrent() {
  const [results, setResults] = useState<TorrentIndexerResult[]>([]);
  const { q } = useParams<"SearchTorrent">();
  const [loading, setLoading] = useState(false);
  const doAlert = useAlert();

  useEffect(() => {
    async function handleSearch() {
      setLoading(true);
      const newResults = await Beta.query(
        new SearchTorrentsQuery({
          queries: [SearchQuery.from(q)],
        }),
      );
      setResults(newResults);
      setLoading(false);
    }
    handleSearch().catch(console.error);
  }, [q]);

  const doDownload = useCallback(
    async (item: TorrentIndexerResult, isShow: boolean) => {
      handleBasicUserQuery(
        Beta.command(
          new AddRawTorrentRequestCommand({
            isShow,
            torrentId: item.id,
          }),
        ),
      );
    },
    [],
  );

  const askDownload = useCallback(
    async (item: TorrentIndexerResult) => {
      const result = await doAlert({
        title: "Catégorie",
        text: "Essayez-vous de télécharger un film ou une série ?",
        buttons: ["film", "série"],
      });
      if (result) {
        doDownload(item, result === "série").catch(console.error);
      }
    },
    [doAlert, doDownload],
  );

  return (
    <BoxPadded pt="S8" mh="S8">
      <TorrentSearchResults
        results={results}
        askDownload={askDownload}
        isFocused
        loading={loading}
      />
    </BoxPadded>
  );
}
