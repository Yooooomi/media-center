import {StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';
import {color, fontSize, spacing} from '../../../services/constants';
import {useRemote} from '../../../services/useRemote';
import {useBooleanState} from '../../../services/useBooleanState';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import Animated, {
  FadeIn,
  FadeOut,
  SharedValue,
  useDerivedValue,
} from 'react-native-reanimated';
import {useAdditiveThrottle} from '../../../services/useAdditiveThrottle';
import Box from '../../../components/box/box';
import Text from '../../../components/text/text';
import ControlsActionSheet from './controlsActionSheet';
import {VLCTrackInfoEvent} from '@media-center/vlc';
import {formatVideoDuration} from '../../../services/string';
import RealtimeText from '../../../components/realtimeText/realtimeText';
import ProgressBar from '../../../components/progressBar/progressBar';
import {IconButton} from '../../../components/ui/pressable/iconButton';

interface ControlsProps {
  progress: SharedValue<number>;
  isPlaying: boolean;
  rollPlay: () => void;
  onNext: () => void;
  onBack: () => void;
  seek: (diff: number) => void;
  videoInfo: VLCTrackInfoEvent;
  setTextTrack: (id: number) => void;
  setAudioTrack: (id: number) => void;
  style?: ViewStyle;
}

const SHOW_DURATION_MS = 3000;
const REWIND_MS = 10000;
const FORWARD_MS = 30000;

const Controls = ({
  isPlaying,
  onBack,
  onNext,
  rollPlay,
  seek,
  style,
  setAudioTrack,
  setTextTrack,
  videoInfo,
  progress,
}: ControlsProps) => {
  const showTimeout = useRef(0);
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
    playPause: resetShow,
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
          <Box w="100%" ph="S32" row items="center" gap="S16">
            <RealtimeText style={styles.progressText} value={progressString} />
            <Box grow>
              <ProgressBar progress={progressValue} />
            </Box>
            <Text>{formatVideoDuration(videoInfo.duration)}</Text>
          </Box>
          <Box w="100%" row content="space-between" items="center" ph="S32">
            <Box row gap="S16" flex={1}>
              <IconButton
                size={24}
                disabled={videoInfo.availableTextTracks.length === 0}
                onPress={() => setActionSheet('text')}
                icon="subtitles-outline"
              />
              <IconButton
                size={24}
                disabled={videoInfo.availableAudioTracks.length === 0}
                onPress={() => setActionSheet('audio')}
                icon="music"
              />
            </Box>
            <Box flex={3} row grow items="center" content="center" gap="S16">
              <IconButton size={24} onPress={onBack} icon="skip-backward" />
              <IconButton size={24} onPress={rewind} icon="rewind" />
              <IconButton
                size={24}
                focusOnMount
                onPress={rollPlay}
                icon={isPlaying ? 'pause' : 'play'}
              />
              <IconButton size={24} onPress={fastForward} icon="fast-forward" />
              <IconButton size={24} onPress={onNext} icon="skip-forward" />
            </Box>
            <Box flex={1}>
              <View />
            </Box>
          </Box>
        </Animated.View>
      )}
      {!shouldShow && (
        <TouchableOpacity
          hasTVPreferredFocus
          style={styles.unusedTouchable}
          onPress={resetShow}>
          <Text>a</Text>
        </TouchableOpacity>
      )}
      <ControlsActionSheet
        open={actionSheet}
        onClose={() => setActionSheet(undefined)}
        audioTracks={videoInfo.availableAudioTracks}
        textTracks={videoInfo.availableTextTracks}
        onAudioTrack={setAudioTrack}
        onTextTrack={setTextTrack}
      />
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.S16,
    backgroundColor: `${color.background}69`,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexGrow: 1,
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
    display: 'none',
  },
  progressText: {
    color: 'white',
    fontSize: fontSize.default,
  },
});

export default Controls;
