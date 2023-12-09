import {FlatList} from 'react-native';
import Text from '../../../components/text/text';
import Box from '../../../components/box/box';
import {VLCTrack} from '@media-center/vlc';
import Modal from '../../../components/modal/modal';
import {Pressable} from '../../../components/ui/pressable/pressable';

interface ControlsActionSheetProps {
  open: 'text' | 'audio' | undefined;
  onClose: () => void;
  textTracks: VLCTrack[];
  audioTracks: VLCTrack[];
  onAudioTrack: (id: number) => void;
  onTextTrack: (id: number) => void;
}

export default function ControlsActionSheet({
  open,
  onClose,
  audioTracks,
  textTracks,
  onAudioTrack,
  onTextTrack,
}: ControlsActionSheetProps) {
  return (
    <>
      <Modal
        open={open === 'text'}
        onClose={onClose}
        title="Selectionner des sous-titres">
        <FlatList
          keyExtractor={item => item.id.toString()}
          data={textTracks}
          renderItem={({item}) => (
            <Pressable
              onPress={() => {
                onTextTrack(item.id);
                onClose();
              }}>
              <Box p="S8">
                <Text color="darkText">{item.name}</Text>
              </Box>
            </Pressable>
          )}
        />
      </Modal>
      <Modal
        open={open === 'audio'}
        onClose={onClose}
        title="Selectionner une piste audio">
        <FlatList
          keyExtractor={item => item.id.toString()}
          data={audioTracks}
          renderItem={({item}) => (
            <Pressable
              onPress={() => {
                onAudioTrack(item.id);
                onClose();
              }}>
              <Box p="S8">
                <Text color="darkText">{item.name}</Text>
              </Box>
            </Pressable>
          )}
        />
      </Modal>
    </>
  );
}
