import {FlatList, StyleSheet} from 'react-native';
import {TorrentIndexerResult} from '@media-center/domains/src/torrentIndexer/domain/torrentIndexerResult';
import {TorrentIndexerResultLine} from '../torrentIndexerResultLine/torrentIndexerResultLine';
import {Modal} from '../../ui/tools/modal/modal';

interface TorrentsActionSheetProps {
  torrents: TorrentIndexerResult[];
  onTorrentPress: (torrent: TorrentIndexerResult) => void;
  open: boolean;
  onClose: () => void;
}

export function TorrentsActionSheet({
  open,
  torrents,
  onTorrentPress,
  onClose,
}: TorrentsActionSheetProps) {
  return (
    <Modal
      onClose={onClose}
      open={open}
      title="Choisir un fichier à télécharger">
      <FlatList
        style={styles.flatlist}
        data={torrents}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <TorrentIndexerResultLine
            torrentIndexerResult={item}
            onPress={() => onTorrentPress(item)}
          />
        )}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  flatlist: {
    flexGrow: 1,
  },
});
