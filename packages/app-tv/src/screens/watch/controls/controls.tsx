import {StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';
import IconButton from '../../../components/iconButton/iconButton';
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

const SHOW_DURATION = 3000;
const REWIND_SECONDS = 10000;
const FORWARD_SECONDS = 30000;

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
  } = useAdditiveThrottle(0 as number, 1000, seek);

  const setCurrentFocus = useCallback(
    (fn: () => void) => (currentCallback.current = fn),
    [],
  );

  const resetShow = useCallback(() => {
    clearTimeout(showTimeout.current);
    show();
    showTimeout.current = setTimeout(hide, SHOW_DURATION);
  }, [hide, show]);

  useEffect(() => {
    setTimeout(resetShow, 0);
  }, [resetShow]);

  const rewind = () => {
    add(old => old - REWIND_SECONDS);
    resetShow();
  };
  const fastForward = () => {
    add(old => old + FORWARD_SECONDS);
    resetShow();
  };

  const shouldShow = !isPlaying || isShowing;

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
            <Box row gap="S16">
              <IconButton
                disabled={videoInfo.availableTextTracks.length === 0}
                type="primary"
                onPress={() => {}}
                onFocus={() => setCurrentFocus(() => setActionSheet('text'))}
                icon="subtitles"
              />
              <IconButton
                disabled={videoInfo.availableAudioTracks.length === 0}
                type="primary"
                onPress={() => {}}
                onFocus={() => setCurrentFocus(() => setActionSheet('audio'))}
                icon="cast-audio"
              />
            </Box>
            <Box row gap="S16">
              <IconButton
                type="primary"
                onPress={() => {}}
                onFocus={() => setCurrentFocus(onBack)}
                icon="skip-backward"
              />
              <IconButton
                type="primary"
                onPress={() => {}}
                onFocus={() => setCurrentFocus(rewind)}
                icon="rewind"
              />
              <IconButton
                type="primary"
                hasTVPreferredFocus
                onPress={() => {}}
                onFocus={() => setCurrentFocus(rollPlay)}
                icon={isPlaying ? 'pause' : 'play'}
              />
              <IconButton
                type="primary"
                onPress={() => {}}
                onFocus={() => setCurrentFocus(fastForward)}
                icon="fast-forward"
              />
              <IconButton
                type="primary"
                onPress={() => {}}
                onFocus={() => setCurrentFocus(onNext)}
                icon="skip-forward"
              />
            </Box>
            <Box>
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
