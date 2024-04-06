import { FlatList } from "react-native";
import { useMemo } from "react";
import { Track } from "@media-center/web-video-player";
import { Modal } from "../../../components/ui/tools/modal/modal";
import { LineButton } from "../../../components/ui/input/pressable/lineButton";
import { WATCH_PORTAL_NAME } from "../watch.portal";

interface ControlsActionSheetProps {
  open: "text" | "audio" | undefined;
  onClose: () => void;
  textTracks: Track[];
  audioTracks: Track[];
  onAudioTrack: (id: string) => void;
  onTextTrack: (id: string) => void;
  additionalTextTracks?: Track[];
}

export function ControlsActionSheet({
  open,
  onClose,
  audioTracks,
  textTracks,
  onAudioTrack,
  onTextTrack,
  additionalTextTracks,
}: ControlsActionSheetProps) {
  const withNoneAudioTracks = useMemo(
    () => [{ id: "none", name: "Aucun" }, ...audioTracks],
    [audioTracks],
  );
  const withNoneTextTracks = useMemo(
    () => [
      { id: "none", name: "Aucun" },
      ...textTracks,
      ...(additionalTextTracks ?? []),
    ],
    [additionalTextTracks, textTracks],
  );

  return (
    <>
      <Modal
        portalHostname={WATCH_PORTAL_NAME}
        open={open === "text"}
        onClose={onClose}
        title="Selectionner des sous-titres"
      >
        <FlatList
          keyExtractor={(item) => item.id.toString()}
          data={withNoneTextTracks}
          renderItem={({ item, index }) => (
            <LineButton
              focusOnMount={index === 0}
              onPress={() => {
                onTextTrack(item.id);
                onClose();
              }}
              text={item.name}
            />
          )}
        />
      </Modal>
      <Modal
        portalHostname={WATCH_PORTAL_NAME}
        open={open === "audio"}
        onClose={onClose}
        title="Selectionner une piste audio"
      >
        <FlatList
          keyExtractor={(item) => item.id.toString()}
          data={withNoneAudioTracks}
          renderItem={({ item, index }) => (
            <LineButton
              focusOnMount={index === 0}
              onPress={() => {
                onAudioTrack(item.id);
                onClose();
              }}
              text={item.name}
            />
          )}
        />
      </Modal>
    </>
  );
}
