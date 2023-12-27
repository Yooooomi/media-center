import {HierarchyItem} from '@media-center/server/src/domains/fileWatcher/domain/hierarchyItem';
import {useNavigate} from '../../screens/params';
import Text from '../text/text';
import Box from '../box/box';
import {Pressable} from '../ui/pressable/pressable';

interface HierarchyItemLineProps {
  item: HierarchyItem;
}

export default function HierarchyItemLine({item}: HierarchyItemLineProps) {
  const {navigate} = useNavigate();

  return (
    <Pressable onPress={() => navigate('Watch', {hierarchyItem: item})}>
      <Box p="S8">
        <Text color="whiteText">{item.file.getFilename()}</Text>
      </Box>
    </Pressable>
  );
}
