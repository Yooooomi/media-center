import {Dimensions, StyleSheet} from 'react-native';
import {useParams} from '../params';
import {Vlc, VLCTrackInfoEvent, VLCBaseEvent} from '@media-center/vlc';
import {useVideoUri} from '../../services/api';
import Controls from './controls/controls';
import {useToggle} from '../../services/useToggle';
import {useCallback, useRef, useState} from 'react';
import {useSharedValue} from 'react-native-reanimated';

const {width, height} = Dimensions.get('screen');

export default function Watch() {
  const {hierarchyItem} = useParams<'Watch'>();
  const videoUri = useVideoUri(hierarchyItem.id);
  const [videoInfo, setVideoInfo] = useState<VLCTrackInfoEvent | undefined>(
    undefined,
  );
  const currentProgress = useRef<VLCBaseEvent | undefined>(undefined);
  const currentProgressMs = useSharedValue(0);
  const [audioTrack, setAudioTrack] = useState<number | undefined>(undefined);
  const [textTrack, setTextTrack] = useState<number | undefined>(undefined);

  const [playing, rollPlaying] = useToggle(true);
  const [seek, setSeek] = useState(0);

  const onProgress = useCallback(
    (event: VLCBaseEvent) => {
      currentProgress.current = event;
      currentProgressMs.value = event.progress;
    },
    [currentProgressMs],
  );

  const doSeek = useCallback(
    (added: number) => {
      if (!currentProgress.current) {
        return;
      }

      let nextPosition = currentProgress.current.progress + added;
      currentProgressMs.value = nextPosition;
      setSeek(nextPosition);
    },
    [currentProgressMs],
  );

  return (
    <>
      <Vlc
        audioTrack={audioTrack}
        textTrack={textTrack}
        seek={seek}
        play={playing}
        style={styles.video}
        volume={100}
        hwDecode
        forceHwDecode={false}
        arguments={[
          '--sout-mux-caching=200',
          '--file-caching=200',
          '--cdda-caching=200',
          '--http-caching=200',
          // '--prefetch-buffer-size=10000',
          // '--prefetch-read-size=10000000',
          // '--network-caching=2000',
          // '--sout-mux-caching=2000',
        ]}
        onProgress={onProgress}
        onVideoInfos={setVideoInfo}
        uri={videoUri}
      />
      {videoInfo && (
        <Controls
          progress={currentProgressMs}
          videoInfo={videoInfo}
          style={styles.controls}
          isPlaying={playing}
          onBack={() => {}}
          onNext={() => {}}
          setTextTrack={setTextTrack}
          setAudioTrack={setAudioTrack}
          rollPlay={rollPlaying}
          seek={doSeek}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  video: {
    width,
    height,
  },
  controls: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
  },
});
