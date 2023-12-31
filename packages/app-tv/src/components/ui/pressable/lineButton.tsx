import {color} from '../../../services/constants';
import Box from '../../box';
import Text from '../../text';
import {Pressable} from './pressable';

type Variants = 'default' | 'delete';

interface LineButtonProps {
  text: string;
  onPress: () => void;
  variant?: Variants;
}

const variants: Record<
  Variants,
  [
    [keyof typeof color, keyof typeof color],
    [keyof typeof color, keyof typeof color],
  ]
> = {
  default: [
    ['buttonBackgroundFocused', 'buttonBackground'],
    ['buttonTextFocused', 'buttonText'],
  ],
  delete: [
    ['error', 'buttonBackground'],
    ['whiteText', 'error'],
  ],
};

export function LineButton({
  text,
  onPress,
  variant = 'default',
}: LineButtonProps) {
  return (
    <Pressable onPress={onPress}>
      {({focused}) => (
        <Box
          r="default"
          p="S8"
          grow
          bg={focused ? variants[variant][0][0] : variants[variant][0][1]}>
          <Text
            color={focused ? variants[variant][1][0] : variants[variant][1][1]}>
            {text}
          </Text>
        </Box>
      )}
    </Pressable>
  );
}
