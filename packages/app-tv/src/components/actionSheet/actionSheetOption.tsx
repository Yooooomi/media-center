import Box from '../box/box';
import PressableGrey from '../pressableGrey/pressableGrey';
import Text from '../text/text';

interface ActionSheetOptionProps {
  name: string;
  onPress: () => void;
}

export default function ActionSheetOption({
  name,
  onPress,
}: ActionSheetOptionProps) {
  return (
    <PressableGrey onPress={onPress} hasTVPreferredFocus>
      <Box>
        <Text>{name}</Text>
      </Box>
    </PressableGrey>
  );
}
