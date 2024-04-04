import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  FC,
  RefObject,
  SyntheticEvent,
} from "react";
import s from "./index.module.css";

export interface VideoInfoEvent {
  currentVideoTrackId?: string;
  currentAudioTrackId?: string;
  currentTextTrackId?: string;

  audioTracks: {
    id: string;
    name: string;
  }[];
  textTracks: {
    id: string;
    name: string;
  }[];
  videoTracks: {
    id: string;
    name: string;
  }[];

  duration: number;
}

export interface Track {
  id: string;
  name: string;
}

export interface ProgressEvent {
  progress: number;
  duration: number;
}

export interface BufferingEvent {
  buffering: number;
}

interface EventHandler<T> {
  (event: SyntheticEvent<any, T>): void;
}

export interface VideoPlayerProps {
  ref?: RefObject<VideoPlayerHandle>;

  uri: string;
  play?: boolean;
  volume: number;

  audioTrack?: string;
  textTrack?: string;

  // Arguments passed to the creation of the libvlc instance
  arguments?: string[];

  hwDecode?: boolean;
  forceHwDecode?: boolean;

  onProgress?: EventHandler<ProgressEvent>;
  onVideoInfo?: EventHandler<VideoInfoEvent>;
  onError?: EventHandler<{}>;
  onBuffer?: EventHandler<BufferingEvent>;

  additionalTextTracks?: { name: string; content: string }[];
}

export interface VideoPlayerHandle {
  seek: (ms: number) => void;
  fullscreen: () => void;
}

export interface VideoPlayerComponent extends FC<VideoPlayerProps> {}

interface WebTrack {
  id: string;
  label: string;
  enabled: boolean;
}

function getSelectedTrack(tracks: Iterable<WebTrack>) {
  for (const track of tracks) {
    if (track.enabled) {
      return track;
    }
  }
  return undefined;
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  (
    {
      uri,
      play,
      onVideoInfo,
      onProgress,
      audioTrack,
      textTrack,
      additionalTextTracks,
    },
    ref,
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
      seek: (ms) => {
        if (!videoRef.current) {
          return;
        }
        videoRef.current.currentTime = ms / 1000;
      },
      fullscreen: () => videoRef.current?.requestFullscreen(),
    }));

    useEffect(() => {
      if (!videoRef.current) {
        return;
      }
      const webAudioTracks: WebTrack[] = (videoRef.current as any).audioTracks;
      for (const track of webAudioTracks) {
        track.enabled = track.id === audioTrack;
      }
      videoRef.current.currentTime = videoRef.current.currentTime;
    }, [audioTrack]);

    useEffect(() => {
      if (!videoRef.current) {
        return;
      }
      const webTextTracks: WebTrack[] = (videoRef.current as any).textTracks;
      for (const track of webTextTracks) {
        track.enabled = track.label === textTrack;
      }
    }, [textTrack]);

    const handleOnProgress = useCallback(() => {
      if (!videoRef.current) {
        return;
      }
      onProgress?.({
        duration: videoRef.current.duration * 1000,
        progress: videoRef.current.currentTime * 1000,
      });
    }, [onProgress]);

    const handleLoadedMetadata = useCallback(() => {
      if (!videoRef.current) {
        return;
      }

      const webAudioTracks: WebTrack[] = (videoRef.current as any).audioTracks;
      const webVideoTracks: WebTrack[] = (videoRef.current as any).videoTracks;
      const webDuration: number = videoRef.current.duration;

      const audioTracks: Track[] = [];
      for (const track of webAudioTracks) {
        audioTracks.push({
          id: track.id,
          name: track.label,
        });
      }
      const videoTracks: Track[] = [];
      for (const track of webVideoTracks) {
        videoTracks.push({
          id: track.id,
          name: track.label,
        });
      }
      onVideoInfo?.({
        audioTracks: audioTracks,
        videoTracks,
        duration: webDuration * 1000,
        textTracks: [],
        currentVideoTrackId: getSelectedTrack(webVideoTracks)?.id,
        currentAudioTrackId: getSelectedTrack(webAudioTracks)?.id,
        currentTextTrackId: undefined,
      });
    }, [onVideoInfo]);

    useEffect(() => {
      if (play) {
        videoRef.current?.play().catch(console.error);
      } else {
        videoRef.current?.pause();
      }
    }, [play]);

    const blobs = useMemo(
      () =>
        additionalTextTracks?.map((additionalTextTrack) =>
          URL.createObjectURL(new Blob([additionalTextTrack.content])),
        ) ?? [],
      [additionalTextTracks],
    );

    return (
      <div className={s.root}>
        <video
          ref={videoRef}
          className={s.video}
          id="video"
          onTimeUpdate={handleOnProgress}
          onLoadedMetadata={handleLoadedMetadata}
        >
          <source src={uri} />
          {blobs.map((blob, index) =>
            additionalTextTracks?.[index].name === textTrack ? (
              <track
                key={blob}
                default
                kind="subtitles"
                label={additionalTextTracks?.[index].name ?? `#${index + 1}`}
                src={blob}
              />
            ) : null,
          )}
        </video>
      </div>
    );
  },
) as VideoPlayerComponent;
