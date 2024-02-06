import {FlatList} from 'react-native';
import {Track} from '@media-center/turbo-vlc';
import {Modal} from '../../../components/ui/tools/modal/modal';
import {LineButton} from '../../../components/ui/input/pressable/lineButton';

interface ControlsActionSheetProps {
  open: 'text' | 'audio' | undefined;
  onClose: () => void;
  textTracks: Track[];
  audioTracks: Track[];
  onAudioTrack: (id: string) => void;
  onTextTrack: (id: string) => void;
}

export function ControlsActionSheet({
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
          renderItem={({item, index}) => (
            <LineButton
              focusOnMount={index === 0}
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
          renderItem={({item, index}) => (
            <LineButton
              focusOnMount={index === 0}
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
