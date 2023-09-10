import {FlatList} from 'react-native';
import ActionSheet from '../../../components/actionSheet';
import PressableGrey from '../../../components/pressableGrey';
import Text from '../../../components/text/text';
import Box from '../../../components/box/box';
import {VLCTrack} from '@media-center/vlc';

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
      <ActionSheet
        open={open === 'text'}
        onClose={onClose}
        title="Selectionner des sous-titres">
        <FlatList
          keyExtractor={item => item.id.toString()}
          data={textTracks}
          renderItem={({item}) => (
            <PressableGrey
              onPress={() => {
                onTextTrack(item.id);
                onClose();
              }}>
              <Box p="S8">
                <Text color="black">{item.name}</Text>
              </Box>
            </PressableGrey>
          )}
        />
      </ActionSheet>
      <ActionSheet
        open={open === 'audio'}
        onClose={onClose}
        title="Selectionner une piste audio">
        <FlatList
          keyExtractor={item => item.id.toString()}
          data={audioTracks}
          renderItem={({item}) => (
            <PressableGrey
              onPress={() => {
                onAudioTrack(item.id);
                onClose();
              }}>
              <Box p="S8">
                <Text color="black">{item.name}</Text>
              </Box>
            </PressableGrey>
          )}
        />
      </ActionSheet>
    </>
  );
}
