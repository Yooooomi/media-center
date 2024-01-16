import {Box} from '../../components/box';
import {DiscoverPageQuery} from '@media-center/server/src/queries/discoverPage.query';
import {ShowCardsLine} from '../../components/showCardsLine/showCardsLine';
import {MovieCardsLine} from '../../components/movieCardsLine/movieCardsLine';
import {useQuery} from '../../services/useQuery';
import {FullScreenLoading} from '../../components/fullScreenLoading/fullScreenLoading';
import {useState} from 'react';
import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import {Text} from '../../components/text';
import {ScrollView} from 'react-native';
import {TmdbNote} from '../../components/tmdbNote';

export function Discover() {
  const [{result: discoverPage}] = useQuery(DiscoverPageQuery, undefined);
  const [focused, setFocused] = useState<Movie | Show | undefined>(undefined);

  if (!discoverPage) {
    return <FullScreenLoading />;
  }

  return (
    <ScrollView>
      <Box ml="S8" mt="S8" grow>
        <MovieCardsLine
          onFocus={setFocused}
          autoFocusFirst
          title="Découvrir des films"
          movies={discoverPage.movies}
        />
        <ShowCardsLine
          onFocus={setFocused}
          title="Découvrir des séries"
          shows={discoverPage.shows}
        />
        <Box grow ph="S4">
          {focused ? (
            <>
              <Text size="small">
                <TmdbNote size="small" note={focused.getRoundedNote()} />
                <Text size="small">・{focused.getYear()}</Text>
              </Text>
              <Text size="small">{focused.overview}</Text>
            </>
          ) : null}
        </Box>
      </Box>
    </ScrollView>
  );
}
