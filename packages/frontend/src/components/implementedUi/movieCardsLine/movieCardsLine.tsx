import { Movie } from "@media-center/domains/src/tmdb/domain/movie";
import { UserTmdbMovieInfo } from "@media-center/domains/src/userTmdbInfo/domain/userTmdbInfo";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { MovieCard } from "../cards/movieCard/movieCard";
import { SectionLine } from "../../ui/display/sectionLine/sectionLine";

interface MovieCardsLine {
  movies: Movie[];
  infos?: UserTmdbMovieInfo[];
  title: string;
  autoFocusFirst?: boolean;
  onFocus?: (movie: Movie) => void;
  itemPerLine?: number;
  style?: StyleProp<ViewStyle>;
}

function MovieCardsLine_({
  movies,
  title,
  autoFocusFirst,
  infos,
  onFocus,
  itemPerLine,
  style,
}: MovieCardsLine) {
  return (
    <SectionLine
      style={style}
      title={title}
      data={movies}
      keyExtractor={(movie) => movie.id.toString()}
      itemPerLine={itemPerLine}
      renderItem={(item, index) => (
        <MovieCard
          onFocus={onFocus}
          progress={infos?.find((e) => e.id.equalsTmdbId(item.id))?.progress}
          focusOnMount={autoFocusFirst && index === 0}
          movie={item}
        />
      )}
    />
  );
}

export const MovieCardsLine = React.memo(MovieCardsLine_);
