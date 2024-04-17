import { Alert, Pressable, StyleSheet, View } from "react-native";
import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSharedValue } from "react-native-reanimated";
import { rawColor } from "@media-center/ui/src/constants";
import { GetSubtitlesQuery } from "@media-center/domains/src/hierarchyEntryInformation/applicative/getSubtitles.query";
import { WatchQuery } from "@media-center/domains/src/queries/watch.query";
import { HierarchyItemId } from "@media-center/domains/src/fileWatcher/domain/hierarchyItemId";
import { IntentReturning } from "@media-center/domain-driven";
import {
  ProgressEvent,
  VideoInfoEvent,
  VideoPlayerHandle,
} from "@media-center/web-video-player";
import { useToggle } from "../../services/hooks/useToggle";
import { useAppStateEvent } from "../../services/hooks/useOnBlur";
import { Beta, useVideoUri } from "../../services/api/api";
import { useQuery } from "../../services/api/useQuery";
import { useParams, useNavigate } from "../navigation.dependency";
import { withDependencyWrapper } from "../../services/hocs/withDependencyWrapper";
import { VideoPlayer } from "../../components/ui/display/videoPlayer/videoPlayer";
import { FullScreenLoading } from "../../components/ui/display/fullScreenLoading";
import { Portal, PortalHost } from "../../components/ui/tools/portal";
import { DEFAULT_HOSTNAME } from "../../components/ui/tools/portal/portal";
import { useSaveCatalogEntryProgress } from "./useSaveCatalogEntryProgress";
import { Controls, ControlsHandle } from "./controls";
import { WATCH_PORTAL_NAME } from "./watch.portal";

export const Watch = withDependencyWrapper(WatchWrapped, () => {
  const { hierarchyItemId } = useParams<"Watch">();
  const [{ result }] = useQuery(WatchQuery, {
    actorId: Beta.userId,
    hierarchyItemId: new HierarchyItemId(hierarchyItemId),
  });

  if (!result) {
    return undefined;
  }

  return { watch: result };
});

interface WatchWrappedProps {
  watch: IntentReturning<WatchQuery>;
}

function WatchWrapped({ watch }: WatchWrappedProps) {
  const [playlistIndex, setPlaylistIndex] = useState(watch.index);

  const playlistItem = watch.playlist[playlistIndex]!;

  const videoUri = useVideoUri(playlistItem.hierarchyItem.id);
  const [videoInfo, setVideoInfo] = useState<VideoInfoEvent | undefined>(
    undefined,
  );
  const currentProgress = useRef<ProgressEvent | undefined>(undefined);
  const currentProgressMs = useSharedValue(0);
  const [audioTrack, setAudioTrack] = useState("default");
  const [textTrack, setTextTrack] = useState("default");
  const { goBack } = useNavigate();
  const vlcRef = useRef<VideoPlayerHandle>(null);

  const [{ result: subtitles }] = useQuery(
    GetSubtitlesQuery,
    playlistItem.hierarchyItem.id,
  );

  const additionalTextTracks = useMemo(
    () =>
      subtitles?.map((subtitle) => ({
        id: subtitle.name,
        name: subtitle.name,
      })),
    [subtitles],
  );

  const [playing, rollPlaying, setPlaying] = useToggle(true);

  useEffect(() => {
    if (!videoInfo || playlistItem.progress === 0) {
      return;
    }
    vlcRef.current?.seek(videoInfo.duration * playlistItem.progress);
  }, [playlistItem.progress, videoInfo]);

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
    (event: SyntheticEvent<any, ProgressEvent>) => {
      currentProgress.current = event.nativeEvent;
      currentProgressMs.value = event.nativeEvent.progress;
    },
    [currentProgressMs],
  );

  const onVideoInfo = useCallback(
    (event: SyntheticEvent<any, VideoInfoEvent>) => {
      setVideoInfo(event.nativeEvent);
    },
    [],
  );

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
    watch.tmdb.id,
    playlistItem.season,
    playlistItem.episode,
  );

  const previousAllowed = playlistIndex !== 0;
  const nextAllowed = playlistIndex !== watch.playlist.length - 1;

  const previous = useCallback(
    () => setPlaylistIndex((index) => index - 1),
    [],
  );
  const next = useCallback(() => setPlaylistIndex((index) => index + 1), []);

  useAppStateEvent(
    "blur",
    useCallback(() => {
      setPlaying(false);
    }, [setPlaying]),
  );

  const controlsRef = useRef<ControlsHandle>(null);

  const rollShow = useCallback(() => {
    controlsRef.current?.rollShow();
  }, []);

  const play = useCallback(() => {
    setPlaying(true);
  }, [setPlaying]);

  const pause = useCallback(() => {
    setPlaying(false);
  }, [setPlaying]);

  return (
    <Portal name={DEFAULT_HOSTNAME}>
      <View style={styles.background}>
        {!videoInfo && <FullScreenLoading />}
      </View>
      <Pressable
        isTVSelectable={false}
        hasTVPreferredFocus={false}
        onPress={rollShow}
        style={styles.player}
      >
        <VideoPlayer
          ref={vlcRef}
          uri={videoUri}
          audioTrack={audioTrack}
          textTrack={textTrack}
          play={playing}
          volume={100}
          hwDecode={!playlistItem.hierarchyItem.file.path.endsWith(".avi")}
          forceHwDecode={false}
          onProgress={onProgress}
          onVideoInfo={onVideoInfo}
          onError={onError}
          additionalTextTracks={subtitles}
        />
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { opacity: 0, backgroundColor: "red" },
          ]}
        />
      </Pressable>
      {videoInfo && (
        <Controls
          ref={controlsRef}
          name={watch.tmdb.original_title}
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
          additionalTextTracks={additionalTextTracks}
          onPlay={play}
          onPause={pause}
          onStop={goBack}
        />
      )}
      <PortalHost absoluteFill name={WATCH_PORTAL_NAME} />
    </Portal>
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
    backgroundColor: rawColor.black,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
    backgroundColor: rawColor.black,
  },
});
