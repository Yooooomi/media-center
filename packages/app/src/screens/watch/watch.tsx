import {StyleSheet} from 'react-native';
import {useParams} from '../params';
import {Vlc, VLCTrackInfoEvent, VLCBaseEvent} from '@media-center/vlc';
import {useVideoUri} from '../../services/api';
import Controls, {ControlsHandle} from './controls/controls';
import {useToggle} from '../../services/useToggle';
import {useCallback, useRef, useState} from 'react';

export default function Watch() {
  const {hierarchyItem} = useParams<'Watch'>();
  const videoUri = useVideoUri(hierarchyItem.id);
  const [videoInfo, setVideoInfo] = useState<VLCTrackInfoEvent | undefined>(
    undefined,
  );
  const currentProgress = useRef<VLCBaseEvent | undefined>(undefined);
  const controlsRef = useRef<ControlsHandle>(null);
  const [audioTrack, setAudioTrack] = useState<number | undefined>(undefined);
  const [textTrack, setTextTrack] = useState<number | undefined>(undefined);

  const [playing, rollPlaying] = useToggle(true);
  const [seek, setSeek] = useState(0);

  const onProgress = useCallback((event: VLCBaseEvent) => {
    currentProgress.current = event;
    controlsRef.current?.setProgress(
      currentProgress.current.progress,
      currentProgress.current.duration,
    );
  }, []);

  const doSeek = useCallback((added: number) => {
    if (!currentProgress.current) {
      return;
    }

    let nextPosition = currentProgress.current.progress + added;
    controlsRef.current?.setProgress(
      nextPosition,
      currentProgress.current.duration,
    );
    setSeek(nextPosition);
  }, []);

  return (
    <>
      <Vlc
        audioTrack={audioTrack}
        textTrack={textTrack}
        seek={seek}
        play={playing}
        style={styles.video}
        onProgress={onProgress}
        onVideoInfos={setVideoInfo}
        uri="http://10.0.2.2:8080/video/1.mkv"
      />
      {videoInfo && (
        <Controls
          ref={controlsRef}
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
    flexGrow: 1,
  },
  controls: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
  },
});
