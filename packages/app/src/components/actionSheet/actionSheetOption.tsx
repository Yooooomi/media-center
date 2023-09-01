import {Pressable} from 'react-native';
import Box from '../box/box';
import Text from '../text/text';

interface ActionSheetOptionProps {
  name: string;
  onPress: () => void;
}

export default function ActionSheetOption({
  name,
  onPress,
}: ActionSheetOptionProps) {
  return (
    <Pressable onPress={onPress}>
      <Box ph="S16" pv="S8">
        <Text>{name}</Text>
      </Box>
    </Pressable>
  );
}
