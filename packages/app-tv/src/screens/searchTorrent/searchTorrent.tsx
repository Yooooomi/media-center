import {useCallback, useState} from 'react';
import Box from '../../components/box/box';
import TextInput from '../../components/textInput/textInput';
import {Beta} from '../../services/api';
import {ScrollView} from 'react-native';
import Section from '../../components/section/section';
import {useBooleanState} from '../../services/useBooleanState';
import {SearchTorrentsQuery} from '@media-center/server/src/domains/torrentIndexer/applicative/searchTorrents.query';
import {TorrentIndexerResult} from '@media-center/server/src/domains/torrentIndexer/domain/torrentIndexerResult';
import TorrentIndexerResultLine from '../../components/torrentIndexerResultLine/torrentIndexerResultLine';
import {AddRawTorrentRequestCommand} from '@media-center/server/src/domains/torrentRequest/applicative/addRawTorrentRequest.command';
import {useAlert} from '../../components/alert/alertProvider';
import {IconButton} from '../../components/ui/pressable/iconButton';

export default function SearchTorrent() {
  const [isFocused, focus, blur] = useBooleanState();
  const [results, setResults] = useState<TorrentIndexerResult[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const doAlert = useAlert();

  const updateSearch = useCallback(async () => {
    setLoading(true);
    const newResults = await Beta.query(
      new SearchTorrentsQuery({
        query: text,
      }),
    );
    setResults(newResults);
    setLoading(false);
  }, [text]);

  const doDownload = useCallback(
    async (item: TorrentIndexerResult, isShow: boolean) => {
      await Beta.command(
        new AddRawTorrentRequestCommand({
          isShow,
          torrentId: item.id,
        }),
      );
    },
    [],
  );

  const askDownload = useCallback(
    async (item: TorrentIndexerResult) => {
      const result = await doAlert({
        title: 'Catégorie',
        text: 'Essayez-vous de télécharger un film ou une série ?',
        buttons: ['film', 'série'],
      });
      if (result) {
        doDownload(item, result === 'série');
      }
    },
    [doAlert, doDownload],
  );

  return (
    <ScrollView>
      <Box mt="S8" mh="S8">
        <Box row gap="S8">
          <TextInput
            autoFocus
            onFocus={focus}
            onBlur={blur}
            numberOfLines={1}
            placeholder="Rechercher"
            value={text}
            onChangeText={setText}
          />
          <IconButton
            icon="magnify"
            loading={loading}
            onPress={updateSearch}
            hasTVPreferredFocus={!isFocused}
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
