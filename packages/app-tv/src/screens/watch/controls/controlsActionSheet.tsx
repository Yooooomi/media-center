import {FlatList} from 'react-native';
import {VLCTrack} from '@media-center/vlc';
import Modal from '../../../components/modal/modal';
import {LineButton} from '../../../components/ui/pressable/lineButton';

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
            <LineButton
              onPress={() => {
                onTextTrack(item.id);
                onClose();
              }}
              text={item.name}
            />
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
            <LineButton
              onPress={() => {
                onAudioTrack(item.id);
                onClose();
              }}
              text={item.name}
            />
          )}
        />
      </Modal>
    </>
  );
}
