import { GetMoviePageQuery } from "@media-center/domains/src/queries/getMoviePage.query";
import { TmdbId } from "@media-center/domains/src/tmdb/domain/tmdbId";
import { FullScreenLoading } from "../../components/ui/display/fullScreenLoading/fullScreenLoading";
import { Beta } from "../../services/api/api";
import { useQuery } from "../../services/api/useQuery";
import { useParams } from "../navigation.dependency";
import { withDependencyWrapper } from "../../services/hocs/withDependencyWrapper";
import { MovieWrapped } from "./movieWrapped";

export const Movie = withDependencyWrapper(
  MovieWrapped,
  () => {
    const { movieId } = useParams<"Movie">();
    const [{ result }, _, reload] = useQuery(
      GetMoviePageQuery,
      {
        actorId: Beta.userId,
        tmdbId: new TmdbId(movieId),
      },
      { reactive: true },
    );

    if (!result) {
      return undefined;
    }

    return { moviePage: result, reload };
  },
  {
    Fallback: FullScreenLoading,
  },
);
