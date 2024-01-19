import React, { useRef, type RefObject, useEffect } from 'react';
import {
  requireNativeComponent,
  UIManager,
  Platform,
  NativeEventEmitter,
  NativeModules,
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
  volume: number;

  audioTrack?: number;
  textTrack?: number;

  // Arguments passed to the creation of the libvlc instance
  arguments?: string[];

  hwDecode?: boolean;
  forceHwDecode?: boolean;

  onProgress?: (event: VLCBaseEvent) => void;
  onError?: (event: VLCBaseEvent) => void;
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
const VlcEventEmitter = new NativeEventEmitter(NativeModules.VlcEventEmitter);

function createListener<T>(path: string) {
  const listeners: Record<string, ((args: T) => void)[]> = {};

  VlcEventEmitter.addListener(path, (a) => {
    console.log('Triggered!!', path, a);
    listeners[a.id]?.forEach((fn) => fn(a));
  });

  function register(id: number, cb: (args: T) => void) {
    const listener = listeners[id] ?? [];
    listener.push(cb);
    listeners[id] = listener;

    return () => {
      const index = listener.indexOf(cb);
      if (index < 0) {
        return;
      }
      listener.splice(index, 1);
    };
  }

  return { register };
}

const videoInfoListener = createListener<VLCTrackInfoEvent>('onVideoInfos');
const onProgressListener = createListener<VLCBaseEvent>('onProgress');
const onErrorListener = createListener<VLCBaseEvent>('onError');

export function Vlc(props: VlcProps) {
  const ref = useRef<{ _nativeTag: number }>(null);

  useEffect(() => {
    if (!ref.current || !props.onVideoInfos) {
      return;
    }
    return videoInfoListener.register(
      ref.current._nativeTag,
      props.onVideoInfos
    );
  }, [props.onVideoInfos]);

  useEffect(() => {
    if (!ref.current || !props.onProgress) {
      return;
    }
    return onProgressListener.register(
      ref.current._nativeTag,
      props.onProgress
    );
  }, [props.onProgress]);

  useEffect(() => {
    if (!ref.current || !props.onError) {
      return;
    }
    return onErrorListener.register(ref.current._nativeTag, props.onError);
  }, [props.onError]);

  return <VlcView ref={ref} {...props} />;
}
