import {Pressable, StyleSheet, View, ViewStyle} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import Animated, {
  FadeIn,
  FadeOut,
  SharedValue,
  useDerivedValue,
} from 'react-native-reanimated';
import {VideoInfoEvent} from '@media-center/turbo-vlc';
import {color, fontSize, spacing} from '../../../services/constants';
import {useRemote} from '../../../services/hooks/useRemote';
import {useBooleanState} from '../../../services/hooks/useBooleanState';
import {useAdditiveThrottle} from '../../../services/hooks/useAdditiveThrottle';
import {Box} from '../../../components/ui/display/box/box';
import {Text} from '../../../components/ui/input/text/text';
import {formatVideoDuration} from '../../../services/string';
import {RealtimeText} from '../../../components/ui/display/realtimeText/realtimeText';
import {ProgressBar} from '../../../components/ui/display/progressBar/progressBar';
import {IconButton} from '../../../components/ui/input/pressable/iconButton';
import {ControlsActionSheet} from './controlsActionSheet';

interface ControlsProps {
  name: string;
  progress: SharedValue<number>;
  isPlaying: boolean;
  rollPlay: () => void;
  previousAllowed: boolean;
  onPrevious: () => void;
  nextAllowed: boolean;
  onNext: () => void;
  seek: (diff: number) => void;
  videoInfo: VideoInfoEvent;
  setTextTrack: (id: string) => void;
  setAudioTrack: (id: string) => void;
  style?: ViewStyle;
}

const SHOW_DURATION_MS = 3_000;
const REWIND_MS = 10_000;
const FORWARD_MS = 30_000;

export const Controls = ({
  name,
  isPlaying,
  previousAllowed,
  onPrevious,
  nextAllowed,
  onNext,
  rollPlay,
  seek,
  style,
  setAudioTrack,
  setTextTrack,
  videoInfo,
  progress,
}: ControlsProps) => {
  const showTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const currentCallback = useRef<(() => void) | undefined>(undefined);
  const [isShowing, show, hide] = useBooleanState(true);
  const [actionSheet, setActionSheet] = useState<'text' | 'audio' | undefined>(
    undefined,
  );
  const {
    add,
    value: seekValue,
    active: seekActive,
  } = useAdditiveThrottle<number>(0, 1000, seek);

  const resetShow = useCallback(() => {
    clearTimeout(showTimeout.current);
    show();
    showTimeout.current = setTimeout(hide, SHOW_DURATION_MS);
  }, [hide, show]);

  useEffect(() => {
    setTimeout(resetShow, 0);
  }, [resetShow]);

  const rewind = () => {
    add(old => Math.min(old - REWIND_MS, 0));
    resetShow();
  };
  const fastForward = () => {
    add(old => Math.min(old + FORWARD_MS, videoInfo.duration));
    resetShow();
  };

  const shouldShow = !isPlaying || isShowing || actionSheet !== undefined;

  useEffect(() => {
    resetShow();
  }, [actionSheet, resetShow]);

  useRemote({
    pan: () => console.log('PAN!'),
    playPause: rollPlay,
    select: () => {
      resetShow();
      if (shouldShow) {
        currentCallback.current?.();
      }
    },
    left: resetShow,
    right: resetShow,
    up: resetShow,
    down: resetShow,
    rewind,
    fastForward,
  });

  const progressString = useDerivedValue(() =>
    formatVideoDuration(progress.value),
  );

  const duration = videoInfo.duration;
  const progressValue = useDerivedValue(() => progress.value / duration);

  return (
    <>
      {seekActive && (
        <Animated.View
          style={styles.overlay}
          entering={FadeIn}
          exiting={FadeOut}>
          <View style={styles.overlayContent}>
            <Text>
              {Math.sign(seekValue) < 0 ? '-' : '+'}
              {Math.abs(seekValue) / 1000}s
            </Text>
          </View>
        </Animated.View>
      )}
      {shouldShow && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={[styles.root, style]}>
          <Box mt="S16" ml="S32">
            <Text>{name}</Text>
          </Box>
          <Box w="100%" ph="S32" row items="center" gap="S16">
            <Box w={200}>
              <RealtimeText
                style={styles.progressText}
                value={progressString}
              />
            </Box>
            <Box grow>
              <ProgressBar progress={progressValue} />
            </Box>
            <Text>{formatVideoDuration(videoInfo.duration)}</Text>
          </Box>
          <Box w="100%" row content="space-between" items="center" ph="S32">
            <Box row gap="S16" flex={1}>
              <IconButton
                size={24}
                disabled={videoInfo.textTracks.length === 0}
                onPress={() => setActionSheet('text')}
                icon="subtitles-outline"
              />
              <IconButton
                size={24}
                disabled={videoInfo.textTracks.length === 0}
                onPress={() => setActionSheet('audio')}
                icon="music"
              />
            </Box>
            <Box flex={3} row grow items="center" content="center" gap="S16">
              <IconButton
                size={24}
                disabled={!previousAllowed}
                onPress={onPrevious}
                icon="skip-backward"
              />
              <IconButton size={24} onPress={rewind} icon="rewind" />
              <IconButton
                size={24}
                focusOnMount
                onPress={rollPlay}
                icon={isPlaying ? 'pause' : 'play'}
              />
              <IconButton size={24} onPress={fastForward} icon="fast-forward" />
              <IconButton
                size={24}
                disabled={!nextAllowed}
                onPress={onNext}
                icon="skip-forward"
              />
            </Box>
            <Box flex={1}>
              <View />
            </Box>
          </Box>
        </Animated.View>
      )}
      {!shouldShow && (
        <Pressable
          hasTVPreferredFocus
          style={styles.unusedTouchable}
          onPress={resetShow}>
          <Text>a</Text>
        </Pressable>
      )}
      <ControlsActionSheet
        open={actionSheet}
        onClose={() => setActionSheet(undefined)}
        audioTracks={videoInfo.audioTracks}
        textTracks={videoInfo.textTracks}
        onAudioTrack={setAudioTrack}
        onTextTrack={setTextTrack}
      />
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    backgroundColor: `${color.background}69`,
    paddingBottom: spacing.S16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContent: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 1000,
    backgroundColor: `${color.background}69`,
  },
  progressBar: {
    width: '100%',
    marginHorizontal: spacing.S32,
  },
  unusedTouchable: {
    position: 'absolute',
    backgroundColor: 'red',
    top: -50,
    left: -50,
  },
  progressText: {
    color: 'white',
    fontSize: fontSize.default,
  },
});
