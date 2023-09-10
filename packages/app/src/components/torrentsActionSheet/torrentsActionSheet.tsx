import ActionSheet from '../actionSheet/actionSheet';
import Box from '../box/box';
import Text from '../text/text';
import {FlatList, StyleSheet} from 'react-native';
import {TorrentIndexerResult} from '@media-center/server/src/domains/torrentIndexer/domain/torrentIndexerResult';
import PressableGrey from '../pressableGrey/pressableGrey';

interface TorrentsActionSheetProps {
  torrents: TorrentIndexerResult[];
  onTorrentPress: (torrent: TorrentIndexerResult) => void;
  open: boolean;
  onClose: () => void;
}

export default function TorrentsActionSheet({
  open,
  torrents,
  onTorrentPress,
  onClose,
}: TorrentsActionSheetProps) {
  return (
    <ActionSheet
      onClose={onClose}
      open={open}
      title="Choisir un fichier à télécharger">
      <FlatList
        style={styles.flatlist}
        data={torrents}
        keyExtractor={item => item.id.toString()}
        renderItem={({item, index}) => (
          <PressableGrey
            hasTVPreferredFocus={index === 0}
            key={item.id.toString()}
            onPress={() => onTorrentPress(item)}>
            <Box p="S8">
              <Text color="black">{item.name}</Text>
              <Box row content="space-between">
                <Text color="darkgrey" style={styles.left}>
                  {item.toDisplaySize()}
                </Text>
                <Text color="green" style={styles.mid}>
                  {item.seeders.toString()}
                </Text>
                <Text color="red" style={styles.right}>
                  {item.leechers.toString()}
                </Text>
              </Box>
            </Box>
          </PressableGrey>
        )}
      />
    </ActionSheet>
  );
}

const styles = StyleSheet.create({
  left: {
    flex: 1,
  },
  mid: {
    flex: 1,
    textAlign: 'center',
  },
  right: {
    flex: 1,
    textAlign: 'right',
  },
  flatlist: {
    flexGrow: 1,
  },
});
