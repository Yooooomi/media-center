import { useEffect } from "react";
import { UseControlInteractionProps } from "./useControlInteraction.props";

export function useControlInteraction({
  resetShow,
  rollPlay,
}: UseControlInteractionProps) {
  useEffect(() => {
    function analyzeSpace(event: KeyboardEvent) {
      if (event.key === " ") {
        rollPlay();
      }
    }

    document.addEventListener("mousemove", resetShow);
    document.addEventListener("keypress", analyzeSpace);
    return () => {
      document.removeEventListener("mousemove", resetShow);
      document.removeEventListener("keypress", analyzeSpace);
    };
  }, [resetShow, rollPlay]);
}
