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
}: NativeProps) {
  const ref = React.useRef<
    React.Component<NativeProps, {}, any> & Readonly<NativeMethods>
  >(null);

  console.log("Rendered vlc js");

  // useEffect(() => {
  //   ref.current?.setNativeProps({ uri });
  // }, [uri]);

  return (
    <TurboVlcViewNativeComponent
      style={style}
      uri={uri}
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

function debugIsEqual(a: any, b: any) {
  const notMatchingKeys = new Set<string>();

  for (const akey of Object.keys(a)) {
    if (a[akey] !== b[akey]) {
      notMatchingKeys.add(akey);
    }
  }
  for (const bkey of Object.keys(b)) {
    if (a[bkey] !== b[bkey]) {
      notMatchingKeys.add(bkey);
    }
  }

  if (notMatchingKeys.size > 0) {
    console.log(`Not equal: ${[...notMatchingKeys.keys()].join(", ")}`);
  }

  return notMatchingKeys.size === 0;
}

export const TurboVlc = React.memo(TurboVlc_, debugIsEqual);
