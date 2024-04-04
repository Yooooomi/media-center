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

export const VideoPlayer = forwardRef<VideoPlayerHandle, NativeProps>(
  ({ ...other }, ref) => {
    const innerRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      seek: (ms: number) => Commands.seek(innerRef.current, ms),
    }));

    return <TurboVlc ref={innerRef} style={styles.root} {...other} />;
  }
);

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
  },
});
