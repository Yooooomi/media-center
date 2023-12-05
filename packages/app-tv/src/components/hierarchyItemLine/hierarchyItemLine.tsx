import {HierarchyItem} from '@media-center/server/src/domains/fileWatcher/domain/hierarchyItem';
import PressableGrey, {
  PressableGreyProps,
} from '../pressableGrey/pressableGrey';
import {useNavigate} from '../../screens/params';
import Text from '../text/text';
import Box from '../box/box';

interface HierarchyItemLineProps extends PressableGreyProps {
  item: HierarchyItem;
}

export default function HierarchyItemLine({item}: HierarchyItemLineProps) {
  const navigate = useNavigate();

  return (
    <PressableGrey
      focusedBackground="t_greyed"
      notFocusedBackground="transparent"
      onPress={() => navigate('Watch', {hierarchyItem: item})}>
      <Box p="S8">
        <Text color="white">{item.file.getFilename()}</Text>
      </Box>
    </PressableGrey>
  );
}
