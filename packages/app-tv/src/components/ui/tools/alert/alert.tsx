import {Text} from '../../input/text/text';
import {Modal} from '../modal/modal';
import {Box} from '../../display/box/box';
import {TextButton} from '../../input/pressable/textButton';

interface AlertProps<T extends string> {
  title: string;
  text: string;
  buttons: T[];
  onPress: (pressed: T | undefined) => void;
}

export function Alert<T extends string>({
  title,
  text,
  buttons,
  onPress,
}: AlertProps<T>) {
  return (
    <Modal open onClose={() => onPress(undefined)} title={title}>
      <Text color="text">{text}</Text>
      <Box mt="S8" row gap="S8" content="flex-end">
        {buttons.map(button => (
          <TextButton text={button} onPress={() => onPress(button)} />
        ))}
      </Box>
    </Modal>
  );
}
