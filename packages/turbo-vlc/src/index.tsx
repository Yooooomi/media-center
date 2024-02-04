import React, {
  type FC,
  useImperativeHandle,
  type RefObject,
  useRef,
} from "react";
import type { StyleProp, ViewProps, ViewStyle } from "react-native";
import TurboVlcViewNativeComponent, {
  type NativeProps,
  type BufferingEvent,
  type ProgressEvent,
  type VideoInfoEvent,
  type Track,
  Commands,
  type NativeViewType,
} from "./TurboVlcViewNativeComponent";

export type { BufferingEvent, ProgressEvent, VideoInfoEvent, Track };

export interface TurboVlcHandle {
  seek: (ms: number) => void;
}

type VisibleProps = Omit<NativeProps, keyof ViewProps> & {
  style?: StyleProp<ViewStyle>;
  ref?: RefObject<TurboVlcHandle>;
};

const TurboVlc_ = React.forwardRef<TurboVlcHandle, VisibleProps>(
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
      style,
      onProgress,
      onVideoInfo,
      onError,
      onBuffer,
    },
    ref
  ) => {
    const nativeRef = useRef<React.ElementRef<NativeViewType>>(null);

    useImperativeHandle(ref, () => ({
      seek: (ms: number) => {
        if (!nativeRef.current) {
          return;
        }
        Commands.seek(nativeRef.current, ms);
      },
    }));

    return (
      <TurboVlcViewNativeComponent
        ref={nativeRef}
        style={style}
        uri={uri}
        play={play}
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
);

export const TurboVlc = React.memo(TurboVlc_ as any) as FC<VisibleProps>;
