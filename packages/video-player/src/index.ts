import { FC, RefObject } from "react";
import { VideoPlayer } from "./player";

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
  (event: T): void;
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

export { VideoPlayer };
