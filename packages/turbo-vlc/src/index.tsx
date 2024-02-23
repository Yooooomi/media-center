import React, { type FC, useImperativeHandle, useRef } from "react";
import type {
  VideoPlayerComponent,
  VideoPlayerHandle,
  VideoPlayerProps,
} from "@media-center/video-player";
import { StyleSheet } from "react-native";
import TurboVlcViewNativeComponent, {
  type BufferingEvent,
  type ProgressEvent,
  type VideoInfoEvent,
  type Track,
  Commands,
  type NativeViewType,
} from "./TurboVlcViewNativeComponent";

export type { BufferingEvent, ProgressEvent, VideoInfoEvent, Track };

const TurboVlc_ = React.forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  (
    {
      uri,
      play,
      volume,
      audioTrack,
      textTrack,
      arguments: vlcArguments,
      hwDecode,
      forceHwDecode,
      onProgress,
      onVideoInfo,
      onError,
      onBuffer,
    },
    ref,
  ) => {
    const nativeRef = useRef<React.ElementRef<NativeViewType>>(null);

    useImperativeHandle(ref, () => ({
      seek: (ms: number) => {
        if (!nativeRef.current) {
          return;
        }
        Commands.seek(nativeRef.current, ms);
      },
      fullscreen: () => {},
    }));

    return (
      <TurboVlcViewNativeComponent
        ref={nativeRef}
        style={styles.root}
        uri={uri}
        play={play}
        volume={volume}
        audioTrack={audioTrack}
        textTrack={textTrack}
        arguments={vlcArguments}
        hwDecode={hwDecode}
        forceHwDecode={forceHwDecode}
        onProgress={(event) => onProgress?.(event.nativeEvent)}
        onBuffer={(event) => onBuffer?.(event.nativeEvent)}
        onVideoInfo={(event) => onVideoInfo?.(event.nativeEvent)}
        onError={(event) => onError?.(event.nativeEvent)}
      />
    );
  },
);

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
  },
});

export const TurboVlc = React.memo(
  TurboVlc_ as any,
) as FC<VideoPlayerComponent>;
