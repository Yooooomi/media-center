import Box from '../../box';
import Text from '../../text';
import {Pressable} from './pressable';

interface LineButtonProps {
  text: string;
  onPress: () => void;
}

export function LineButton({text, onPress}: LineButtonProps) {
  return (
    <Pressable onPress={onPress}>
      {({focused}) => (
        <Box
          r="default"
          p="S8"
          grow
          bg={focused ? 'buttonBackgroundFocused' : 'buttonBackground'}>
          <Text color={focused ? 'buttonTextFocused' : 'buttonText'}>
            {text}
          </Text>
        </Box>
      )}
    </Pressable>
  );
}
