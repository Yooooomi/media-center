import FullScreenLoading from '../../components/fullScreenLoading/fullScreenLoading';
import {useQuery} from '../../services/useQuery';
import {GetShowEntriesQuery} from '@media-center/server/src/domains/catalog/applicative/getShowEntries.query';
import {GetTmdbsQuery} from '@media-center/server/src/domains/tmdb/applicative/getTmdbs.query';
import Box from '../../components/box/box';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import ShowCardsLine from '../../components/showCardsLine/showCardsLine';
import {maxCardsPerLine} from '../../services/constants';

export default function Shows() {
  const [{result: showEntries}] = useQuery(GetShowEntriesQuery, undefined);
  const [{result: tmdbs}] = useQuery(
    GetTmdbsQuery,
    showEntries?.map(e => e.id) ?? [],
    {
      alterResult: r =>
        r.sort((a, b) => a.title.localeCompare(b.title)) as Show[],
      dependsOn: showEntries,
    },
  );

  if (!showEntries || !tmdbs) {
    return <FullScreenLoading />;
  }

  return (
    <Box grow p="S16">
      <ShowCardsLine
        autoFocusFirst
        title="Vos séries"
        shows={tmdbs}
        itemPerLine={maxCardsPerLine}
      />
    </Box>
  );
}
