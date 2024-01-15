import {Text} from '../../text/text';
import {Pressable} from './pressable';
import {Box} from '../../box';
import {color} from '../../../services/constants';
import {ViewStyle} from 'react-native';

type Variants = 'default';

interface TextButtonProps {
  text: string;
  onPress: () => void;
  focusOnMount?: boolean;
  variant?: Variants;
  style?: ViewStyle;
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
};

export function TextButton({
  text,
  onPress,
  focusOnMount,
  variant = 'default',
  style,
}: TextButtonProps) {
  return (
    <Pressable onPress={onPress} focusOnMount={focusOnMount} style={style}>
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
