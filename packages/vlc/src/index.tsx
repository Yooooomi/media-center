import React, { useEffect, useRef, type RefObject } from 'react';
import {
  requireNativeComponent,
  UIManager,
  Platform,
  DeviceEventEmitter,
  type ViewStyle,
} from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-vlc' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

export interface VLCTrack {
  id: number;
  name: string;
}

export interface VLCBaseEvent {
  progress: number;
  duration: number;
  audioTrack: number;
  textTrack: number;
}

export interface VLCTrackInfoEvent extends VLCBaseEvent {
  audioTrack: number;
  textTrack: number;
  availableAudioTracks: VLCTrack[];
  availableTextTracks: VLCTrack[];
}

type VlcProps = {
  style: ViewStyle;
  uri: string;
  play?: boolean;
  seek?: number;
  autoplay?: boolean;

  audioTrack?: number;
  textTrack?: number;

  onProgress?: (event: VLCBaseEvent) => void;
  onVideoInfos?: (event: VLCTrackInfoEvent) => void;
};

const ComponentName = 'VlcView';

const VlcView =
  UIManager.getViewManagerConfig(ComponentName) != null
    ? requireNativeComponent<
        VlcProps & { ref: RefObject<{ _nativeTag: number }> }
      >(ComponentName)
    : () => {
        throw new Error(LINKING_ERROR);
      };

export function Vlc(props: VlcProps) {
  const ref = useRef<{ _nativeTag: number }>(null);

  useEffect(() => {
    DeviceEventEmitter.addListener('onProgress', (event) => {
      if (event.id === ref.current?._nativeTag) {
        props.onProgress?.(event);
      }
    });
    DeviceEventEmitter.addListener('onVideoInfos', (event) => {
      if (event.id === ref.current?._nativeTag) {
        props.onVideoInfos?.(event);
      }
    });
  }, [props]);

  return <VlcView ref={ref} {...props} />;
}
