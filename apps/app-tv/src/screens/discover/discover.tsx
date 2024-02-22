import {DiscoverPageQuery} from '@media-center/domains/src/queries/discoverPage.query';
import {useState} from 'react';
import {Movie} from '@media-center/domains/src/tmdb/domain/movie';
import {Show} from '@media-center/domains/src/tmdb/domain/show';
import {ScrollView} from 'react-native';
import {Box} from '../../components/ui/display/box';
import {ShowCardsLine} from '../../components/implementedUi/showCardsLine/showCardsLine';
import {MovieCardsLine} from '../../components/implementedUi/movieCardsLine/movieCardsLine';
import {useQuery} from '../../services/hooks/useQuery';
import {FullScreenLoading} from '../../components/ui/display/fullScreenLoading/fullScreenLoading';
import {Text} from '../../components/ui/input/text';
import {TmdbNote} from '../../components/ui/display/tmdbNote';

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
