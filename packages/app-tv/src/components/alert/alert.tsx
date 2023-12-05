import Text from '../text/text';
import Button from '../button/button';
import Modal from '../modal/modal';
import Box from '../box/box';

interface AlertProps<T extends string> {
  title: string;
  text: string;
  buttons: T[];
  onPress: (pressed: T | undefined) => void;
}

export default function Alert<T extends string>({
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
          <Button
            text={button}
            type="primary"
            onPress={() => onPress(button)}
          />
        ))}
      </Box>
    </Modal>
  );
}
