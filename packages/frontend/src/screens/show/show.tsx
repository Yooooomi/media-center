import { GetShowPageQuery } from "@media-center/domains/src/queries/getShowPage.query";
import { TmdbId } from "@media-center/domains/src/tmdb/domain/tmdbId";
import { useQuery } from "../../services/api/useQuery";
import { Beta } from "../../services/api/api";
import { useParams } from "../navigation.dependency";
import { withDependencyWrapper } from "../../services/hocs/withDependencyWrapper";
import { ShowWrapped } from "./showWrapped";

export const Show = withDependencyWrapper(ShowWrapped, () => {
  const { showId } = useParams<"Show">();

  const [{ result: showPage }, _, reload] = useQuery(
    GetShowPageQuery,
    { actorId: Beta.userId, tmdbId: new TmdbId(showId) },
    {
      reactive: true,
    },
  );

  if (!showPage) {
    return undefined;
  }

  return { showPage, reload };
});
