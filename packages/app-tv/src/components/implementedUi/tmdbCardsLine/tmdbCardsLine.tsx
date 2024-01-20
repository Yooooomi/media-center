import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import {
  UserTmdbMovieInfo,
  UserTmdbShowInfo,
} from '@media-center/server/src/domains/userTmdbInfo/domain/userTmdbInfo';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import {MovieCard} from '../cards/movieCard/movieCard';
import {
  SectionLine,
  ExtraSectionLineProps,
} from '../../ui/display/sectionLine/sectionLine';
import {ShowCard} from '../cards/showCard';

interface MovieCardsLine extends ExtraSectionLineProps {
  tmdbs: (Movie | Show)[];
  infos?: (UserTmdbMovieInfo | UserTmdbShowInfo)[];
  title: string;
  autoFocusFirst?: boolean;
}

export function TmdbCardsLine({
  tmdbs,
  title,
  autoFocusFirst,
  infos,
  ...other
}: MovieCardsLine) {
  function getProgress(info: UserTmdbMovieInfo | UserTmdbShowInfo | undefined) {
    if (!info) {
      return undefined;
    }
    if (info instanceof UserTmdbMovieInfo) {
      return info.progress;
    }
    if (info instanceof UserTmdbShowInfo) {
      return info.getShowProgress();
    }
    return undefined;
  }

  return (
    <SectionLine
      {...other}
      title={title}
      data={tmdbs}
      keyExtractor={movie => movie.id.toString()}
      renderItem={(item, index) =>
        item instanceof Movie ? (
          <MovieCard
            progress={getProgress(infos?.find(e => e.id.equalsTmdbId(item.id)))}
            focusOnMount={autoFocusFirst && index === 0}
            movie={item}
          />
        ) : item instanceof Show ? (
          <ShowCard
            progress={getProgress(infos?.find(e => e.id.equalsTmdbId(item.id)))}
            focusOnMount={autoFocusFirst && index === 0}
            show={item}
          />
        ) : null
      }
    />
  );
}
