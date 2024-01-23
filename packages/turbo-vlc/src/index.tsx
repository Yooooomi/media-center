import React, { useEffect } from "react";
import type { NativeMethods } from "react-native";
import TurboVlcViewNativeComponent, {
  type NativeProps,
  type BufferingEvent,
  type ProgressEvent,
  type VideoInfoEvent,
  type Track,
} from "./TurboVlcViewNativeComponent";

export type { BufferingEvent, ProgressEvent, VideoInfoEvent, Track };

export function TurboVlc({
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
}: NativeProps) {
  const ref = React.useRef<
    React.Component<NativeProps, {}, any> & Readonly<NativeMethods>
  >(null);

  useEffect(() => {
    ref.current?.setNativeProps({ uri });
  }, [uri]);

  return (
    <TurboVlcViewNativeComponent
      style={style}
      ref={ref}
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
