import { IntentReturning } from "@media-center/domain-driven";
import { GetMoviePageQuery } from "@media-center/domains/src/queries/getMoviePage.query";

export interface MovieWrappedProps {
  moviePage: IntentReturning<GetMoviePageQuery>;
  reload: () => void;
}
