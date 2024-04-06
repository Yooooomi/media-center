import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Animated, {
  FadeIn,
  FadeOut,
  useDerivedValue,
  SharedValue,
} from "react-native-reanimated";
import { color, fontSize, spacing } from "@media-center/ui/src/constants";
import { Track, VideoInfoEvent } from "@media-center/web-video-player";
import { useBooleanState } from "../../../services/hooks/useBooleanState";
import { useAdditiveThrottle } from "../../../services/hooks/useAdditiveThrottle";
import { Box } from "../../../components/ui/display/box/box";
import { Text } from "../../../components/ui/input/text/text";
import { formatVideoDuration } from "../../../services/string";
import { RealtimeText } from "../../../components/ui/display/realtimeText/realtimeText";
import { ProgressBar } from "../../../components/ui/display/progressBar/progressBar";
import { IconButton } from "../../../components/ui/input/pressable/iconButton";
import { isMobile, isNative } from "../../../services/platform";
import { Timeout } from "../../../services/types";
import { useNavigate } from "../../navigation.dependency";
import { Portal } from "../../../components/ui/tools/portal";
import { WATCH_PORTAL_NAME } from "../watch.portal";
import { ControlsActionSheet } from "./controlsActionSheet";
import { useControlInteraction } from "./useControlInteraction";

export interface ControlsProps {
  name: string;
  progress: SharedValue<number>;
  isPlaying: boolean;
  rollPlay: () => void;
  previousAllowed: boolean;
  onPrevious: () => void;
  nextAllowed: boolean;
  onNext: () => void;
  seekAdd: (diff: number) => void;
  seek: (ms: number) => void;
  videoInfo: VideoInfoEvent;
  setTextTrack: (id: string) => void;
  setAudioTrack: (id: string) => void;
  onFullscreen: () => void;
  style?: StyleProp<ViewStyle>;
  additionalTextTracks?: Track[];
}

export interface ControlsHandle {
  rollShow: () => void;
}

export const SHOW_DURATION_MS = 3_000;
export const REWIND_MS = 10_000;
export const FORWARD_MS = 30_000;

export const Controls = forwardRef<ControlsHandle, ControlsProps>(
  (
    {
      name,
      isPlaying,
      previousAllowed,
      onPrevious,
      nextAllowed,
      onNext,
      rollPlay,
      seek,
      seekAdd,
      setAudioTrack,
      setTextTrack,
      onFullscreen,
      videoInfo,
      progress,
      style,
      additionalTextTracks,
    },
    ref,
  ) => {
    const { goBack } = useNavigate();
    const showTimeout = useRef<Timeout | undefined>(undefined);
    const [isShowing, show, hide, setShow] = useBooleanState(true);
    const [actionSheet, setActionSheet] = useState<
      "text" | "audio" | undefined
    >(undefined);
    const {
      add,
      value: seekValue,
      active: seekActive,
    } = useAdditiveThrottle<number>(0, 1000, seekAdd);

    useImperativeHandle(ref, () => ({
      rollShow: () => {
        clearTimeout(showTimeout.current);
        setShow((showing) => {
          const newValue = !showing;
          if (newValue) {
            showTimeout.current = setTimeout(hide, SHOW_DURATION_MS);
          }
          return newValue;
        });
      },
    }));

    const resetShow = useCallback(() => {
      clearTimeout(showTimeout.current);
      show();
      showTimeout.current = setTimeout(hide, SHOW_DURATION_MS);
    }, [hide, show]);

    useEffect(() => {
      setTimeout(resetShow, 0);
    }, [resetShow]);

    const rewind = () => {
      add((old) => Math.min(old - REWIND_MS, 0));
      resetShow();
    };
    const fastForward = () => {
      add((old) => Math.min(old + FORWARD_MS, videoInfo.duration));
      resetShow();
    };

    const internRollPlay = () => {
      rollPlay();
      resetShow();
    };

    const internOnPrevious = () => {
      onPrevious();
      resetShow();
    };

    const internOnNext = () => {
      onNext();
      resetShow();
    };

    const shouldShow = !isPlaying || isShowing || actionSheet !== undefined;

    useEffect(() => {
      resetShow();
    }, [actionSheet, resetShow]);

    useControlInteraction({
      resetShow,
      fastForward,
      rewind,
      rollPlay,
    });

    const progressString = useDerivedValue(() =>
      formatVideoDuration(progress.value),
    );

    const duration = videoInfo.duration;
    const progressValue = useDerivedValue(() => progress.value / duration);

    const audioTrackCount = videoInfo.audioTracks.length;
    const textTrackCount =
      videoInfo.textTracks.length + (additionalTextTracks?.length ?? 0);

    return (
      <>
        {seekActive && (
          <Animated.View
            style={styles.overlay}
            entering={FadeIn}
            exiting={FadeOut}
          >
            <View style={styles.overlayContent}>
              <Text>
                {Math.sign(seekValue) < 0 ? "-" : "+"}
                {Math.abs(seekValue) / 1000}s
              </Text>
            </View>
          </Animated.View>
        )}
        {shouldShow && (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={[styles.root, style]}
          >
            <Box>
              <Text>{name}</Text>
            </Box>
            <Box w="100%" row items="center" gap="S16">
              <Box>
                <RealtimeText
                  style={styles.progressText}
                  value={progressString}
                />
              </Box>
              <Box grow>
                <ProgressBar
                  progress={progressValue}
                  duration={videoInfo.duration}
                  onSeek={seek}
                />
              </Box>
              <Text>{formatVideoDuration(videoInfo.duration)}</Text>
            </Box>
            <Box w="100%" row content="space-between" items="center">
              <Box row gap="S16" flex={1}>
                <IconButton
                  size={24}
                  disabled={textTrackCount === 0}
                  onPress={() => setActionSheet("text")}
                  icon="subtitles-outline"
                />
                {!isMobile() ? (
                  <IconButton
                    size={24}
                    disabled={audioTrackCount === 0}
                    onPress={() => setActionSheet("audio")}
                    icon="music"
                  />
                ) : null}
              </Box>
              <Box flex={3} row grow items="center" content="center" gap="S16">
                <IconButton
                  size={24}
                  disabled={!previousAllowed}
                  onPress={internOnPrevious}
                  icon="skip-backward"
                />
                <IconButton
                  size={24}
                  onPress={rewind}
                  onLongPress={rewind}
                  icon="rewind"
                />
                <IconButton
                  size={24}
                  focusOnMount
                  onPress={internRollPlay}
                  icon={isPlaying ? "pause" : "play"}
                />
                <IconButton
                  size={24}
                  onPress={fastForward}
                  onLongPress={fastForward}
                  icon="fast-forward"
                />
                <IconButton
                  size={24}
                  disabled={!nextAllowed}
                  onPress={internOnNext}
                  icon="skip-forward"
                />
              </Box>
              <Box flex={1} row items="center" content="flex-end">
                {!isNative() ? (
                  <IconButton
                    size={24}
                    onPress={onFullscreen}
                    icon="fullscreen"
                  />
                ) : null}
                {isMobile() ? (
                  <IconButton
                    size={24}
                    disabled={audioTrackCount === 0}
                    onPress={() => setActionSheet("audio")}
                    icon="music"
                  />
                ) : null}
              </Box>
            </Box>
          </Animated.View>
        )}
        {/* {!shouldShow && (
          <Pressable
            hasTVPreferredFocus
            style={styles.unusedTouchable}
            onPress={resetShow}
          >
            <Text>a</Text>
          </Pressable>
        )} */}
        <ControlsActionSheet
          open={actionSheet}
          onClose={() => setActionSheet(undefined)}
          audioTracks={videoInfo.audioTracks}
          textTracks={videoInfo.textTracks}
          onAudioTrack={setAudioTrack}
          onTextTrack={setTextTrack}
          additionalTextTracks={additionalTextTracks}
        />
        {Platform.OS === "ios" || Platform.OS === "web" ? (
          <Portal name={WATCH_PORTAL_NAME}>
            <SafeAreaView style={styles.close}>
              <IconButton size={24} icon="arrow-left" onPress={goBack} />
            </SafeAreaView>
          </Portal>
        ) : null}
      </>
    );
  },
);

const styles = StyleSheet.create({
  root: {
    width: "100%",
    backgroundColor: `${color.background}69`,
    padding: isMobile() ? spacing.S8 : spacing.S32,
  },
  close: {
    position: "absolute",
    zIndex: 1,
    top: spacing.S16,
    left: spacing.S16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayContent: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 1000,
    backgroundColor: `${color.background}69`,
  },
  progressBar: {
    width: "100%",
    marginHorizontal: spacing.S32,
  },
  unusedTouchable: {
    position: "absolute",
    backgroundColor: "red",
    top: -50,
    left: -50,
  },
  progressText: {
    color: "white",
    fontSize: fontSize.default,
  },
});
