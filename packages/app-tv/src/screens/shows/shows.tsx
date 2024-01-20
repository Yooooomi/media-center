import {GetShowsPageQuery} from '@media-center/server/src/queries/getShowsPage.query';
import {FullScreenLoading} from '../../components/ui/display/fullScreenLoading/fullScreenLoading';
import {useQuery} from '../../services/hooks/useQuery';
import {Box} from '../../components/ui/display/box/box';
import {ShowCardsLine} from '../../components/implementedUi/showCardsLine/showCardsLine';
import {maxCardsPerLine} from '../../services/constants';

export function Shows() {
  const [{result: shows}] = useQuery(GetShowsPageQuery, undefined);

  if (!shows) {
    return <FullScreenLoading />;
  }

  return (
    <Box grow p="S16">
      <ShowCardsLine
        autoFocusFirst
        title="Vos séries"
        shows={shows}
        itemPerLine={maxCardsPerLine}
      />
    </Box>
  );
}
