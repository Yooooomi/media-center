import { useEffect } from "react";
import { useTVEventHandler, TVEventControl } from "react-native";

type RemoteProps = Record<
  | "up"
  | "down"
  | "right"
  | "left"
  | "longUp"
  | "longDown"
  | "longRight"
  | "longLeft"
  | "blur"
  | "focus"
  | "pan"
  | "playPause"
  | "select"
  | "stop"
  | "next"
  | "previous"
  | "rewind"
  | "fastForward"
  | "pause"
  | "play",
  () => void
>;

export function useRemote(props: Partial<RemoteProps>) {
  useEffect(() => {
    TVEventControl.disableGestureHandlersCancelTouches();
    return () => TVEventControl.enableGestureHandlersCancelTouches();
  }, []);

  useTVEventHandler((event) => {
    (({ ...props }) as Record<string, () => void>)[event.eventType]?.();
  });
}
