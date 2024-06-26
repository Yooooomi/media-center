import { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { SearchTorrentsQuery } from "@media-center/domains/src/torrentIndexer/applicative/searchTorrents.query";
import { TorrentIndexerResult } from "@media-center/domains/src/torrentIndexer/domain/torrentIndexerResult";
import { AddRawTorrentRequestCommand } from "@media-center/domains/src/torrentRequest/applicative/addRawTorrentRequest.command";
import { SearchQuery } from "@media-center/domains/src/miscellaneous/tools/searchQuery";
import { Box } from "../../components/ui/display/box/box";
import { useBooleanState } from "../../services/hooks/useBooleanState";
import { useAlert } from "../../components/ui/tools/alert/alertProvider";
import { IconButton } from "../../components/ui/input/pressable/iconButton";
import { TextInput } from "../../components/ui/input/textInput/textInput";
import { handleBasicUserQuery } from "../../components/ui/tools/promptAlert";
import { Beta } from "../../services/api/api";
import { BoxPadded } from "../../components/ui/display/boxPadded";
import { isMobile, isTV } from "../../services/platform";
import { useParams } from "../navigation.dependency";
import { TorrentSearchResults } from "./torrentSearchResults";

export function SearchTorrent() {
  const [isFocused, focus, blur] = useBooleanState();
  const [results, setResults] = useState<TorrentIndexerResult[]>([]);
  const { q, setParam } = useParams<"SearchTorrent">();
  const [loading, setLoading] = useState(false);
  const doAlert = useAlert();

  const [tempSearch, setTempSearch] = useState("");

  const updateSearch = useCallback(() => {
    setParam("q", tempSearch);
  }, [setParam, tempSearch]);

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
    if (q.length > 0) {
      handleSearch().catch(console.error);
    }
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
      <Box grow row gap="S8" items="center" mb="S8">
        <TextInput
          style={styles.input}
          autoFocus
          onFocus={focus}
          onBlur={blur}
          numberOfLines={1}
          placeholder="Rechercher"
          value={tempSearch}
          onChangeText={setTempSearch}
          onSubmitEditing={updateSearch}
          returnKeyType="search"
        />
        {isTV() && (
          <IconButton
            size={24}
            focusOnMount={!isFocused}
            icon="magnify"
            loading={loading}
            onPress={updateSearch}
          />
        )}
      </Box>
      <TorrentSearchResults
        results={results}
        askDownload={askDownload}
        isFocused={isFocused}
        loading={loading}
      />
    </BoxPadded>
  );
}

const styles = StyleSheet.create({
  input: isMobile()
    ? { flexGrow: 1 }
    : {
        width: 300,
      },
});
