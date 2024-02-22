import { useContext, useEffect } from "react";
import { HomepageQuery } from "@media-center/domains/src/queries/homepage.query";
import { ScrollView } from "react-native";
import { useQuery } from "@media-center/frontend/src/services/api/useQuery";
import { Beta } from "@media-center/frontend/src/services/api/api";
import { ShowCardsLine } from "../../components/implementedUi/showCardsLine/showCardsLine";
import { MovieCardsLine } from "../../components/implementedUi/movieCardsLine/movieCardsLine";
import { Box } from "../../components/ui/display/box/box";
import { FullScreenLoading } from "../../components/ui/display/fullScreenLoading/fullScreenLoading";
import { StatusContext } from "../../services/contexts/status.context";
import { DownloadingCardLine } from "../../components/implementedUi/downloadingCardLine";
import { TmdbCardsLine } from "../../components/implementedUi/tmdbCardsLine/tmdbCardsLine";
import { Text } from "../../components/ui/input/text";
import { useMeshContext } from "../../services/contexts/mesh.context";
import { SplashScreenContext } from "../../services/contexts/splashScreen.context";

export function AddedRecently() {
  const { hide } = useContext(SplashScreenContext);
  const { initStatus } = useMeshContext(StatusContext);
  const [{ result: homepage }] = useQuery(HomepageQuery, Beta.userId, {
    reactive: true,
  });

  useEffect(() => {
    initStatus();
  }, [initStatus]);

  useEffect(() => {
    if (homepage) {
      setTimeout(hide, 0);
    }
  }, [hide, homepage]);

  if (!homepage) {
    return <FullScreenLoading />;
  }

  const downloading = homepage.downloading
    .filter((e) => e.torrent.getClampedDownloaded() !== 1)
    .map((e) => ({
      request: e.torrent,
      tmdb: e.tmdb,
    }));

  const hasNoContent =
    homepage.continue.length +
      homepage.catalog.shows.length +
      homepage.catalog.movies.length +
      downloading.length ===
    0;

  return (
    <ScrollView>
      <Box row grow>
        <Box gap="S16" ml="S16" mt="S16">
          {hasNoContent ? <Text>Vous n'avez aucun média</Text> : null}
          {homepage.continue.length > 0 ? (
            <TmdbCardsLine
              autoFocusFirst
              title="Continuer à regarder"
              tmdbs={homepage.continue.map((e) => e.tmdb)}
              infos={homepage.continue.map((e) => e.userInfo)}
            />
          ) : null}
          {homepage.catalog.shows.length > 0 ? (
            <ShowCardsLine
              autoFocusFirst={homepage.continue.length === 0}
              title="Séries récemment ajoutées"
              shows={homepage.catalog.shows.map((e) => e.tmdb)}
            />
          ) : null}
          {homepage.catalog.movies.length > 0 ? (
            <MovieCardsLine
              autoFocusFirst={
                homepage.continue.length + homepage.catalog.shows.length === 0
              }
              title="Films récemment ajoutés"
              infos={homepage.catalog.movies.map((e) => e.userInfo)}
              movies={homepage.catalog.movies.map((e) => e.tmdb)}
            />
          ) : null}
          {downloading.length > 0 ? (
            <DownloadingCardLine
              title="En téléchargement"
              entries={downloading}
              autoFocusFirst={
                homepage.continue.length +
                  homepage.catalog.shows.length +
                  homepage.catalog.movies.length ===
                0
              }
            />
          ) : null}
        </Box>
      </Box>
    </ScrollView>
  );
}