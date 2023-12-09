import Text from '../../text/text';
import {Pressable} from './pressable';
import Box from '../../box';

interface TextButtonProps {
  text: string;
  onPress: () => void;
}

export function TextButton({text, onPress}: TextButtonProps) {
  return (
    <Pressable onPress={onPress}>
      {({focused}) => (
        <Box bg={focused ? 'buttonBackgroundFocused' : 'buttonBackground'}>
          <Text>{text}</Text>
        </Box>
      )}
    </Pressable>
  );
}
