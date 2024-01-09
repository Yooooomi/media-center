import {FullScreenLoading} from '../../components/fullScreenLoading/fullScreenLoading';
import {useQuery} from '../../services/useQuery';
import {GetShowsPageQuery} from '@media-center/server/src/queries/getShowsPage.query';
import {Box} from '../../components/box/box';
import {ShowCardsLine} from '../../components/showCardsLine/showCardsLine';
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
