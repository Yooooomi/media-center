import { useRemote } from "../../../services/hooks/useRemote";
import { UseControlInteractionProps } from "./useControlInteraction.props";

export function useControlInteraction({
  resetShow,
  rollPlay,
  rewind,
  fastForward,
  pause,
  play,
  stop,
}: UseControlInteractionProps) {
  useRemote({
    pan: () => console.log("PAN!"),
    playPause: rollPlay,
    select: resetShow,
    left: resetShow,
    right: resetShow,
    up: resetShow,
    down: resetShow,
    rewind,
    fastForward,
    pause,
    play,
    stop,
  });
}
