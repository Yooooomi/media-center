import codegenNativeComponent from "react-native/Libraries/Utilities/codegenNativeComponent";
import type { ViewProps } from "react-native";
import type {
  Int32,
  Double,
  DirectEventHandler,
} from "react-native/Libraries/Types/CodegenTypes";

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

  duration: Int32;
}

export interface Track {
  id: string;
  name: string;
}

export interface ProgressEvent {
  progress: Int32;
  duration: Int32;
}

export interface BufferingEvent {
  buffering: Double;
}

export interface NativeProps extends ViewProps {
  uri: string;
  play?: boolean;
  seek?: Double;
  volume: Int32;

  audioTrack?: string;
  textTrack?: string;

  // Arguments passed to the creation of the libvlc instance
  arguments?: string[];

  hwDecode?: boolean;
  forceHwDecode?: boolean;

  onProgress?: DirectEventHandler<ProgressEvent>;
  onVideoInfo?: DirectEventHandler<VideoInfoEvent>;
  onError?: DirectEventHandler<{}>;
  onBuffer?: DirectEventHandler<BufferingEvent>;
}

export default codegenNativeComponent<NativeProps>("TurboVlcView");
