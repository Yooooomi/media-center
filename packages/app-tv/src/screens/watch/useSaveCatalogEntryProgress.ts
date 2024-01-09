import {TmdbId} from '@media-center/server/src/domains/tmdb/domain/tmdbId';
import {SetUserTmdbInfoProgressCommand} from '@media-center/server/src/domains/userTmdbInfo/applicative/setUserTmdbInfoProgress.command';
import {RefObject, useCallback, useEffect, useRef} from 'react';
import {Beta} from '../../services/api';
import {VLCBaseEvent} from '@media-center/vlc';
import {useAppState} from '../../services/useAppState';

export function useSaveCatalogEntryProgress(
  isPlaying: boolean,
  progress: RefObject<VLCBaseEvent | undefined>,
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

  useEffect(() => {
    if (!progress.current?.progress || !progress.current?.duration) {
      return;
    }
    if (state === 'background') {
      saveProgressRef.current(
        progress.current.progress / progress.current.duration,
      );
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
    saveProgressRef.current(
      progress.current.progress / progress.current.duration,
    );
  }, [saveProgress, isPlaying, progress]);

  useEffect(
    () => () => {
      if (!progress.current?.progress || !progress.current?.duration) {
        return;
      }
      saveProgressRef.current(
        progress.current.progress / progress.current.duration,
      );
    },
    [progress],
  );
}
