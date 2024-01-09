import {Text} from '../text/text';
import {Pressable} from '../ui/pressable/pressable';
import {Box} from '../box';

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
