import {TorrentResult} from '@media-center/server/src/domains/torrent/domain/torrentResult';
import ActionSheet from '../actionSheet/actionSheet';
import Box from '../box/box';
import Text from '../text/text';
import {Pressable, StyleSheet} from 'react-native';
import {Fragment} from 'react';
import Divider from '../divider/divider';

interface TorrentsActionSheetProps {
  torrents: TorrentResult[];
  onTorrentPress: (torrent: TorrentResult) => void;
  open: boolean;
}

export default function TorrentsActionSheet({
  open,
  torrents,
  onTorrentPress,
}: TorrentsActionSheetProps) {
  return (
    <ActionSheet open={open} title="Choisir un fichier à télécharger">
      {torrents.map((torrent, index) => (
        <Fragment key={torrent.id.toString()}>
          <Pressable onPress={() => onTorrentPress(torrent)}>
            <Box ph="S16">
              <Text>{torrent.name}</Text>
              <Box mt="S8" row content="space-between">
                <Text bold style={styles.left}>
                  {torrent.toDisplaySize()}
                </Text>
                <Text bold color="green" style={styles.mid}>
                  {torrent.seeders.toString()}
                </Text>
                <Text bold color="red" style={styles.right}>
                  {torrent.leechers.toString()}
                </Text>
              </Box>
            </Box>
          </Pressable>
          {index !== torrents.length - 1 && (
            <Box mh="S16" mv="S12">
              <Divider width="100%" />
            </Box>
          )}
        </Fragment>
      ))}
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
});
