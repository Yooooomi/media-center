import {Text} from '../../text/text';
import {Pressable} from './pressable';
import {Box} from '../../box';
import {color} from '../../../services/constants';

type Variants = 'default' | 'selected';

interface TextButtonProps {
  text: string;
  onPress: () => void;
  focusOnMount?: boolean;
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
  selected: [
    ['buttonBackgroundFocused', 'buttonBackgroundFaded'],
    ['buttonTextFocused', 'buttonText'],
  ],
};

export function TextButton({
  text,
  onPress,
  focusOnMount,
  variant = 'default',
}: TextButtonProps) {
  return (
    <Pressable onPress={onPress} focusOnMount={focusOnMount}>
      {({focused}) => (
        <Box
          bg={focused ? variants[variant][0][0] : variants[variant][0][1]}
          p="S8"
          r="default">
          <Text
            color={focused ? variants[variant][1][0] : variants[variant][1][1]}>
            {text}
          </Text>
        </Box>
      )}
    </Pressable>
  );
}
