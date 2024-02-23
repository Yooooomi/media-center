import { useCallback, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SearchTorrentsQuery } from "@media-center/domains/src/torrentIndexer/applicative/searchTorrents.query";
import { TorrentIndexerResult } from "@media-center/domains/src/torrentIndexer/domain/torrentIndexerResult";
import { AddRawTorrentRequestCommand } from "@media-center/domains/src/torrentRequest/applicative/addRawTorrentRequest.command";
import { SearchQuery } from "@media-center/domains/src/miscellaneous/tools/searchQuery";
import { Box } from "../../components/ui/display/box/box";
import { Section } from "../../components/ui/display/section/section";
import { useBooleanState } from "../../services/hooks/useBooleanState";
import { TorrentIndexerResultLine } from "../../components/implementedUi/torrentIndexerResultLine/torrentIndexerResultLine";
import { useAlert } from "../../components/ui/tools/alert/alertProvider";
import { IconButton } from "../../components/ui/input/pressable/iconButton";
import { TextInput } from "../../components/ui/input/textInput/textInput";
import { handleBasicUserQuery } from "../../components/ui/tools/promptAlert";
import { Beta } from "../../services/api/api";

export function SearchTorrent() {
  const [isFocused, focus, blur] = useBooleanState();
  const [results, setResults] = useState<TorrentIndexerResult[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const doAlert = useAlert();

  const updateSearch = useCallback(async () => {
    setLoading(true);
    const newResults = await Beta.query(
      new SearchTorrentsQuery({
        queries: [SearchQuery.from(text)],
      }),
    );
    setResults(newResults);
    setLoading(false);
  }, [text]);

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
        doDownload(item, result === "série");
      }
    },
    [doAlert, doDownload],
  );

  return (
    <ScrollView>
      <Box mt="S8" mh="S8">
        <Box row gap="S8" items="center">
          <TextInput
            style={styles.input}
            autoFocus
            onFocus={focus}
            onBlur={blur}
            numberOfLines={1}
            placeholder="Rechercher"
            value={text}
            onChangeText={setText}
            onSubmitEditing={updateSearch}
          />
          <IconButton
            focusOnMount={!isFocused}
            icon="magnify"
            loading={loading}
            onPress={updateSearch}
          />
        </Box>
        <Section title="Résultats" mt="S24">
          {results.map((r, index) => (
            <Box mb="S8" key={r.id.toString()}>
              <TorrentIndexerResultLine
                focusOnMount={!isFocused && index === 0}
                torrentIndexerResult={r}
                onPress={() => askDownload(r)}
              />
            </Box>
          ))}
        </Section>
      </Box>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    width: 300,
  },
});
