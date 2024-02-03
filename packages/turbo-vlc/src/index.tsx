import React, { type FC, type ReactNode } from "react";
import type { StyleProp, ViewProps, ViewStyle } from "react-native";
import TurboVlcViewNativeComponent, {
  type NativeProps,
  type BufferingEvent,
  type ProgressEvent,
  type VideoInfoEvent,
  type Track,
} from "./TurboVlcViewNativeComponent";

export type { BufferingEvent, ProgressEvent, VideoInfoEvent, Track };

type VisibleProps = Omit<NativeProps, keyof ViewProps> & {
  style?: StyleProp<ViewStyle>;
};

function TurboVlc_({
  uri,
  play,
  seek,
  volume,
  audioTrack,
  textTrack,
  arguments: vlcArguments,
  hwDecode,
  forceHwDecode,
  style,
  onProgress,
  onVideoInfo,
  onError,
  onBuffer,
}: VisibleProps): ReactNode {
  return (
    <TurboVlcViewNativeComponent
      style={style}
      uri={uri}
      play={play}
      seek={seek}
      volume={volume}
      audioTrack={audioTrack}
      textTrack={textTrack}
      arguments={vlcArguments}
      hwDecode={hwDecode}
      forceHwDecode={forceHwDecode}
      onProgress={onProgress}
      onBuffer={onBuffer}
      onVideoInfo={onVideoInfo}
      onError={onError}
    />
  );
}

export const TurboVlc = React.memo(TurboVlc_ as any) as FC<VisibleProps>;
