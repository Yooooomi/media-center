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
import {Pressable} from '../components/ui/pressable/pressable';
import {
  UserTmdbMovieInfo,
  UserTmdbShowInfo,
} from '@media-center/server/src/domains/userTmdbInfo/domain/userTmdbInfo';

export function usePlayCatalogEntry<
  T extends MovieCatalogEntryFulfilled | ShowCatalogEntryFulfilled,
>(
  entry: T,
  userInfo: UserTmdbMovieInfo | UserTmdbShowInfo,
  filter?: (
    item: T extends ShowCatalogEntryFulfilled
      ? CatalogEntryShowSpecificationFulFilled
      : CatalogEntryMovieSpecificationFulFilled,
  ) => boolean,
) {
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const {navigate} = useNavigate();

  const filteredItems = useMemo(
    () => (filter ? entry.items.filter(filter as any) : entry.items),
    [entry.items, filter],
  );
  const hasManyItems = filteredItems.length > 1;

  const doPlay = useCallback(
    (
      specification:
        | CatalogEntryShowSpecificationFulFilled
        | CatalogEntryMovieSpecificationFulFilled,
    ) => {
      return navigate('Watch', {tmdbId: entry.id, specification, userInfo});
    },
    [entry.id, navigate, userInfo],
  );

  const play = useCallback(() => {
    const [item] = filteredItems;
    if (!item) {
      return;
    }
    if (hasManyItems) {
      return setActionSheetOpen(true);
    }
    return doPlay(item);
  }, [doPlay, filteredItems, hasManyItems]);

  const renderHierarchyItem = useCallback<
    ListRenderItem<
      | CatalogEntryMovieSpecificationFulFilled
      | CatalogEntryShowSpecificationFulFilled
    >
  >(
    ({item}) => {
      return (
        <Pressable onPress={() => doPlay(item)}>
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
