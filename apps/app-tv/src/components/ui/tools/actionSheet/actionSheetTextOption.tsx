import {Text} from '../../input/text/text';
import {Pressable} from '../../input/pressable/pressable';
import {Box} from '../../display/box';

interface ActionSheetOptionProps {
  name: string;
  onPress: () => void;
}

export function ActionSheetTextOption({name, onPress}: ActionSheetOptionProps) {
  return (
    <Pressable onPress={onPress}>
      {({focused}) => (
        <Box bg={focused ? 'buttonBackgroundFocused' : 'buttonBackground'}>
          <Text>{name}</Text>
        </Box>
      )}
    </Pressable>
  );
}
