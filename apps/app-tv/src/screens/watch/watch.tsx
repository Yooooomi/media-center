import {Alert, StyleSheet, NativeSyntheticEvent, View} from 'react-native';
import {
  TurboVlc,
  ProgressEvent,
  VideoInfoEvent,
  TurboVlcHandle,
} from '@media-center/turbo-vlc';
import {createContext, useCallback, useEffect, useRef, useState} from 'react';
import {useSharedValue} from 'react-native-reanimated';
import {ShowCatalogEntryDatasetFulfilled} from '@media-center/domains/src/catalog/applicative/catalogEntryFulfilled.front';
import {useToggle} from '../../services/hooks/useToggle';
import {useVideoUri} from '../../services/api';
import {useNavigate, useParams} from '../params';
import {debugBorder, rawColor} from '../../services/constants';
import {FullScreenLoading} from '../../components/ui/display/fullScreenLoading';
import {useSaveCatalogEntryProgress} from './useSaveCatalogEntryProgress';
import {usePreviousNext} from './usePreviousNext';
import {Controls} from './controls';
import {useAppStateEvent} from '../../services/hooks/useOnBlur';

export function Watch() {
  const {playlist, startingPlaylistIndex} = useParams<'Watch'>();
  const {dataset, progress, name} = playlist.items[startingPlaylistIndex]!;
  const hierarchyItem = dataset.getLatestItem()!;
  const videoUri = useVideoUri(hierarchyItem.id);
  const [videoInfo, setVideoInfo] = useState<VideoInfoEvent | undefined>(
    undefined,
  );
  const currentProgress = useRef<ProgressEvent | undefined>(undefined);
  const currentProgressMs = useSharedValue(0);
  const [audioTrack, setAudioTrack] = useState<string | undefined>(undefined);
  const [textTrack, setTextTrack] = useState('none');
  const {goBack} = useNavigate();
  const vlcRef = useRef<TurboVlcHandle>(null);

  const season =
    dataset instanceof ShowCatalogEntryDatasetFulfilled
      ? dataset.season
      : undefined;
  const episode =
    dataset instanceof ShowCatalogEntryDatasetFulfilled
      ? dataset.episode
      : undefined;

  const [playing, rollPlaying, setPlaying] = useToggle(true);

  useEffect(() => {
    if (!videoInfo || progress === 0) {
      return;
    }
    vlcRef.current?.seek(videoInfo.duration * progress);
  }, [progress, videoInfo]);

  const onError = useCallback(() => {
    Alert.alert(
      'Erreur',
      'Erreur lors de la lecture de la vidéo',
      [{isPreferred: true, onPress: goBack, text: 'Ok'}],
      {cancelable: false},
    );
  }, [goBack]);

  const onProgress = useCallback(
    (event: NativeSyntheticEvent<ProgressEvent>) => {
      currentProgress.current = event.nativeEvent;
      currentProgressMs.value = event.nativeEvent.progress;
    },
    [currentProgressMs],
  );

  const onVideoInfo = useCallback(
    (event: NativeSyntheticEvent<VideoInfoEvent>) => {
      setVideoInfo(event.nativeEvent);
      setAudioTrack(event.nativeEvent.audioTracks[0]?.id);
    },
    [],
  );

  const doSeek = useCallback(
    (added: number) => {
      if (!currentProgress.current) {
        return;
      }

      let nextPosition = currentProgress.current.progress + added;
      currentProgressMs.value = nextPosition;
      vlcRef.current?.seek(nextPosition);
    },
    [currentProgressMs],
  );

  useSaveCatalogEntryProgress(
    playing,
    currentProgress,
    playlist.tmdbId,
    season,
    episode,
  );

  useAppStateEvent(
    'blur',
    useCallback(() => {
      setPlaying(false);
    }, []),
  );

  const {previousAllowed, previous, nextAllowed, next} = usePreviousNext(
    playlist,
    startingPlaylistIndex,
  );

  return (
    <>
      <View style={styles.background}>
        {!videoInfo && <FullScreenLoading />}
      </View>
      <TurboVlc
        ref={vlcRef}
        uri={videoUri}
        audioTrack={audioTrack}
        textTrack={textTrack}
        play={playing}
        style={styles.video}
        volume={100}
        hwDecode={!hierarchyItem.file.path.endsWith('.avi')}
        forceHwDecode={false}
        onProgress={onProgress}
        onVideoInfo={onVideoInfo}
        onError={onError}
      />
      {videoInfo && (
        <Controls
          name={name}
          progress={currentProgressMs}
          videoInfo={videoInfo}
          style={styles.controls}
          isPlaying={playing}
          previousAllowed={previousAllowed}
          onPrevious={previous}
          nextAllowed={nextAllowed}
          onNext={next}
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
    // width: 300,
    // height: 300,
    ...debugBorder('green'),
  },
  controls: {
    position: 'absolute',
    width: '100%',
    height: 140,
    bottom: 0,
    zIndex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: rawColor.black,
  },
});
