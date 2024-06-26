import { Movie } from "@media-center/domains/src/tmdb/domain/movie";
import {
  UserTmdbMovieInfo,
  UserTmdbShowInfo,
} from "@media-center/domains/src/userTmdbInfo/domain/userTmdbInfo";
import { Show } from "@media-center/domains/src/tmdb/domain/show";
import { assertNever } from "@media-center/algorithm";
import { MovieCard } from "../cards/movieCard/movieCard";
import {
  SectionLine,
  ExtraSectionLineProps,
} from "../../ui/display/sectionLine/sectionLine";
import { ShowCard } from "../cards/showCard";

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
    if (!info || info instanceof UserTmdbShowInfo) {
      return undefined;
    }
    if (info instanceof UserTmdbMovieInfo) {
      return info.progress;
    }
    assertNever(info);
  }

  return (
    <SectionLine
      {...other}
      title={title}
      data={tmdbs}
      keyExtractor={(movie) => movie.id.toString()}
      renderItem={(item, index) =>
        item instanceof Movie ? (
          <MovieCard
            progress={getProgress(
              infos?.find((e) => e.id.equalsTmdbId(item.id)),
            )}
            focusOnMount={autoFocusFirst && index === 0}
            movie={item}
          />
        ) : item instanceof Show ? (
          <ShowCard
            progress={getProgress(
              infos?.find((e) => e.id.equalsTmdbId(item.id)),
            )}
            focusOnMount={autoFocusFirst && index === 0}
            show={item}
          />
        ) : null
      }
    />
  );
}
