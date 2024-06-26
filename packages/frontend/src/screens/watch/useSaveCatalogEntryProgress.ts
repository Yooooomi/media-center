import { TmdbId } from "@media-center/domains/src/tmdb/domain/tmdbId";
import { SetUserTmdbInfoProgressCommand } from "@media-center/domains/src/userTmdbInfo/applicative/setUserTmdbInfoProgress.command";
import { RefObject, useCallback, useEffect, useRef } from "react";
import { ProgressEvent } from "@media-center/web-video-player";
import { useAppState } from "../../services/hooks/useAppState";
import { Beta } from "../../services/api/api";
import { Interval } from "../../services/types";
import { isNative } from "../../services/platform";

export function useSaveCatalogEntryProgress(
  isPlaying: boolean,
  progress: RefObject<ProgressEvent | undefined>,
  tmdbId: TmdbId,
  season?: number,
  episode?: number,
) {
  const saveProgress = useCallback(
    async (newProgress: number) => {
      try {
        await Beta.command(
          new SetUserTmdbInfoProgressCommand({
            actorId: Beta.userId,
            progress: newProgress,
            tmdbId,
            episode,
            season,
          }),
        );
      } catch (e) {
        console.warn(e);
      }
    },
    [episode, season, tmdbId],
  );

  const saveProgressRef = useRef(saveProgress);
  saveProgressRef.current = saveProgress;

  const state = useAppState();

  const intervalRef = useRef<Interval>();

  useEffect(() => {
    if (!isNative() && state === "active") {
      intervalRef.current = setInterval(() => {
        if (!progress.current?.progress || !progress.current?.duration) {
          return;
        }
        saveProgressRef
          .current(progress.current.progress / progress.current.duration)
          .catch(console.error);
      }, 10_000);
    }
    return () => clearInterval(intervalRef.current);
  }, [progress, state]);

  useEffect(() => {
    if (!progress.current?.progress || !progress.current?.duration) {
      return;
    }
    if (state === "background") {
      saveProgressRef
        .current(progress.current.progress / progress.current.duration)
        .catch(console.error);
    }
  }, [progress, state]);

  useEffect(() => {
    if (
      !progress.current?.progress ||
      !progress.current?.duration ||
      isPlaying
    ) {
      return;
    }
    saveProgressRef
      .current(progress.current.progress / progress.current.duration)
      .catch(console.error);
  }, [saveProgress, isPlaying, progress]);

  useEffect(
    () => () => {
      if (!progress.current?.progress || !progress.current?.duration) {
        return;
      }
      saveProgressRef
        .current(progress.current.progress / progress.current.duration)
        .catch(console.error);
    },
    [progress],
  );
}
