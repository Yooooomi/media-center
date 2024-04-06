import React, { useImperativeHandle, useRef } from 'react';
import { forwardRef } from 'react';
import {
  type NativeProps,
  default as TurboVlc,
  Commands,
} from './TurboVlcViewNativeComponent';
import { StyleSheet } from 'react-native';

export * from './TurboVlcViewNativeComponent';

export interface VideoPlayerHandle {
  seek: (ms: number) => void;
}

interface UserlandProps extends Omit<NativeProps, "play" | "audioTrack" | "textTrack"> {
  audioTrack?: string;
  textTrack?: string;
  play?: boolean;
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, UserlandProps>(
  ({ audioTrack, textTrack, play, ...other }, ref) => {
    const innerRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      seek: (ms: number) => Commands.seek(innerRef.current, ms),
    }));

    return <TurboVlc pointerEvents='none' ref={innerRef} style={styles.root} audioTrack={audioTrack ?? "default"} textTrack={textTrack ?? "default"} play={play ?? false} {...other} />;
  }
);

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    pointerEvents: "none"
  },
});
