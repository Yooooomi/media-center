import {
  CatalogEntryMovieSpecificationFulFilled,
  CatalogEntryShowSpecificationFulFilled,
  MovieCatalogEntryFulfilled,
  ShowCatalogEntryFulfilled,
} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';
import {useNavigate} from '../screens/params';
import {useCallback, useMemo, useState} from 'react';
import {FlatList, ListRenderItem, Modal} from 'react-native';
import Box from '../components/box';
import Text from '../components/text';
import {HierarchyItem} from '@media-center/server/src/domains/fileWatcher/domain/hierarchyItem';
import {Pressable} from '../components/ui/pressable/pressable';

export function usePlayCatalogEntry<
  T extends MovieCatalogEntryFulfilled | ShowCatalogEntryFulfilled,
>(
  entry: T,
  filter?: (
    item: T extends MovieCatalogEntryFulfilled
      ? CatalogEntryMovieSpecificationFulFilled
      : CatalogEntryShowSpecificationFulFilled,
  ) => boolean,
) {
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const navigate = useNavigate();

  const filteredItems = useMemo(
    () => (filter ? entry.items.filter(filter as any) : entry.items),
    [entry.items, filter],
  );
  const hasManyItems = filteredItems.length > 1;

  const doPlay = useCallback(
    (hierarchyItem: HierarchyItem) => {
      return navigate('Watch', {hierarchyItem});
    },
    [navigate],
  );

  const play = useCallback(() => {
    const [item] = filteredItems;
    if (!item) {
      return;
    }
    if (hasManyItems) {
      return setActionSheetOpen(true);
    }
    return doPlay(item.item);
  }, [doPlay, filteredItems, hasManyItems]);

  const renderHierarchyItem = useCallback<
    ListRenderItem<
      | CatalogEntryMovieSpecificationFulFilled
      | CatalogEntryShowSpecificationFulFilled
    >
  >(
    ({item}) => {
      return (
        <Pressable onPress={() => doPlay(item.item)}>
          {({focused}) => (
            <Box
              p="S8"
              bg={focused ? 'buttonBackgroundFocused' : 'buttonBackground'}>
              <Text color={focused ? 'buttonTextFocused' : 'buttonText'}>
                {item.item.file.getFilename()}
              </Text>
            </Box>
          )}
        </Pressable>
      );
    },
    [doPlay],
  );

  const actionSheet = useMemo(() => {
    if (!hasManyItems) {
      return null;
    }
    return (
      <Modal visible={actionSheetOpen}>
        <FlatList data={entry.items} renderItem={renderHierarchyItem} />
      </Modal>
    );
  }, [actionSheetOpen, entry.items, hasManyItems, renderHierarchyItem]);

  return {play, actionSheet};
}
