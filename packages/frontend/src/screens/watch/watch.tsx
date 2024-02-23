import { Alert, StyleSheet, View } from "react-native";
import {
  VideoPlayer,
  ProgressEvent,
  VideoInfoEvent,
  VideoPlayerHandle,
} from "@media-center/video-player";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSharedValue } from "react-native-reanimated";
import { ShowCatalogEntryDatasetFulfilled } from "@media-center/domains/src/catalog/applicative/catalogEntryFulfilled.front";
import { rawColor } from "@media-center/ui/src/constants";
import { useToggle } from "../../services/hooks/useToggle";
import { useNavigate, useParams } from "../params";
import { FullScreenLoading } from "../../components/ui/display/fullScreenLoading";
import { useAppStateEvent } from "../../services/hooks/useOnBlur";
import { useVideoUri } from "../../services/api/api";
import { useSaveCatalogEntryProgress } from "./useSaveCatalogEntryProgress";
import { usePreviousNext } from "./usePreviousNext";
import { Controls } from "./controls";

export function Watch() {
  const { playlist, startingPlaylistIndex } = useParams<"Watch">();
  const { dataset, progress, name } = playlist.items[startingPlaylistIndex]!;
  const hierarchyItem = dataset.getLatestItem()!;
  const videoUri = useVideoUri(hierarchyItem.id);
  const [videoInfo, setVideoInfo] = useState<VideoInfoEvent | undefined>(
    undefined,
  );
  const currentProgress = useRef<ProgressEvent | undefined>(undefined);
  const currentProgressMs = useSharedValue(0);
  const [audioTrack, setAudioTrack] = useState<string | undefined>(undefined);
  const [textTrack, setTextTrack] = useState("none");
  const { goBack } = useNavigate();
  const vlcRef = useRef<VideoPlayerHandle>(null);

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

  const handleFullscreen = useCallback(() => {
    vlcRef.current?.fullscreen();
  }, []);

  const onError = useCallback(() => {
    Alert.alert(
      "Erreur",
      "Erreur lors de la lecture de la vidéo",
      [{ isPreferred: true, onPress: goBack, text: "Ok" }],
      { cancelable: false },
    );
  }, [goBack]);

  const onProgress = useCallback(
    (event: ProgressEvent) => {
      currentProgress.current = event;
      currentProgressMs.value = event.progress;
    },
    [currentProgressMs],
  );

  const onVideoInfo = useCallback((event: VideoInfoEvent) => {
    setVideoInfo(event);
    setAudioTrack(event.audioTracks[0]?.id);
  }, []);

  const addSeek = useCallback(
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

  const seek = useCallback((ms: number) => {
    vlcRef.current?.seek(ms);
  }, []);

  useSaveCatalogEntryProgress(
    playing,
    currentProgress,
    playlist.tmdbId,
    season,
    episode,
  );

  useAppStateEvent(
    "blur",
    useCallback(() => {
      setPlaying(false);
    }, [setPlaying]),
  );

  const { previousAllowed, previous, nextAllowed, next } = usePreviousNext(
    playlist,
    startingPlaylistIndex,
  );

  return (
    <>
      <View style={styles.background}>
        {!videoInfo && <FullScreenLoading />}
      </View>
      <View style={styles.player}>
        <VideoPlayer
          ref={vlcRef}
          uri={videoUri}
          audioTrack={audioTrack}
          textTrack={textTrack}
          play={playing}
          volume={100}
          hwDecode={!hierarchyItem.file.path.endsWith(".avi")}
          forceHwDecode={false}
          onProgress={onProgress}
          onVideoInfo={onVideoInfo}
          onError={onError}
        />
      </View>
      {videoInfo && (
        <Controls
          name={name}
          onFullscreen={handleFullscreen}
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
          seekAdd={addSeek}
          seek={seek}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  controls: {
    position: "absolute",
    width: "100%",
    height: 140,
    bottom: 0,
    zIndex: 1,
  },
  player: {
    zIndex: 1,
    flexGrow: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: rawColor.black,
  },
});
