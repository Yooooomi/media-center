import {
  Alert,
  Dimensions,
  StyleSheet,
  NativeSyntheticEvent,
  View,
} from 'react-native';
import {TurboVlc, ProgressEvent, VideoInfoEvent} from '@media-center/turbo-vlc';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useSharedValue} from 'react-native-reanimated';
import {ShowCatalogEntryDatasetFulfilled} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';
import {useToggle} from '../../services/hooks/useToggle';
import {useVideoUri} from '../../services/api';
import {useNavigate, useParams} from '../params';
import {rawColor} from '../../services/constants';
import {FullScreenLoading} from '../../components/ui/display/fullScreenLoading';
import {useSaveCatalogEntryProgress} from './useSaveCatalogEntryProgress';
import {usePreviousNext} from './usePreviousNext';
import {Controls} from './controls';

const {width, height} = Dimensions.get('screen');

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
  const [textTrack, setTextTrack] = useState<string | undefined>(undefined);
  const {goBack} = useNavigate();

  const season =
    dataset instanceof ShowCatalogEntryDatasetFulfilled
      ? dataset.season
      : undefined;
  const episode =
    dataset instanceof ShowCatalogEntryDatasetFulfilled
      ? dataset.episode
      : undefined;

  const [playing, rollPlaying] = useToggle(true);

  useEffect(() => {
    if (!videoInfo) {
      return;
    }
    setSeek(videoInfo.duration * progress);
  }, [progress, videoInfo]);

  const onError = useCallback(() => {
    Alert.alert(
      'Erreur',
      'Erreur lors de la lecture de la vidéo',
      [{isPreferred: true, onPress: goBack, text: 'Ok'}],
      {cancelable: false},
    );
  }, [goBack]);

  const [seek, setSeek] = useState(0);

  const onProgress = useCallback(
    (event: NativeSyntheticEvent<ProgressEvent>) => {
      currentProgress.current = event.nativeEvent;
      currentProgressMs.value = event.nativeEvent.progress;
    },
    [currentProgressMs],
  );

  const onVideoInfo = useCallback(
    (event: NativeSyntheticEvent<VideoInfoEvent>) => {
      console.log('Info');
      setVideoInfo(event.nativeEvent);
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
      setSeek(nextPosition);
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

  const {previousAllowed, previous, nextAllowed, next} = usePreviousNext(
    playlist,
    startingPlaylistIndex,
  );

  console.log('Watch rendered');

  return (
    <>
      <View style={styles.background}>
        {!videoInfo && <FullScreenLoading />}
      </View>
      <TurboVlc
        audioTrack={audioTrack}
        textTrack={textTrack}
        seek={seek}
        play={playing}
        style={styles.video}
        volume={100}
        hwDecode={!hierarchyItem.file.path.endsWith('.avi')}
        forceHwDecode={false}
        onProgress={onProgress}
        onVideoInfo={onVideoInfo}
        uri={videoUri}
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
    width,
    height,
  },
  controls: {
    position: 'absolute',
    width: '100%',
    height: 140,
    bottom: 0,
    borderBottomColor: '#00000001',
    borderBottomWidth: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: rawColor.black,
  },
});
