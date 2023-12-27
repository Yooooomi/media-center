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
        <Box
          bg={focused ? 'buttonBackgroundFocused' : 'buttonBackground'}
          p="S8"
          r="default">
          <Text color={focused ? 'buttonTextFocused' : 'buttonText'}>
            {text}
          </Text>
        </Box>
      )}
    </Pressable>
  );
}
