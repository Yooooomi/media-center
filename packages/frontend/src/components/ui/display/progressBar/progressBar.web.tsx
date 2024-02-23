import { StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
} from "react-native-reanimated";
import { color, radius } from "@media-center/ui/src/constants";
import { MouseEventHandler, useCallback, useRef, useState } from "react";
import { formatVideoDuration } from "../../../../services/string";
import { ProgressBarProps } from "./progressBar.props";
import s from "./index.module.css";

export function ProgressBar({
  progress,
  style,
  duration,
  onSeek,
}: ProgressBarProps) {
  const [position, setPosition] = useState<
    | {
        x: number;
        y: number;
        text: string;
      }
    | undefined
  >(undefined);
  const ratio = useRef(0);

  const bar = useAnimatedStyle(() => ({
    backgroundColor: "white",
    flexGrow: 1,
    width: `${
      (typeof progress === "number" ? progress : progress.value) * 100
    }%`,
  }));

  const handleMouseMove = useCallback<MouseEventHandler<HTMLDivElement>>(
    (event) => {
      const divRect = event.currentTarget.getBoundingClientRect();
      ratio.current = (event.clientX - divRect.x) / divRect.width;
      setPosition({
        x: event.clientX,
        y: divRect.y,
        text: formatVideoDuration(ratio.current * duration),
      });
    },
    [duration],
  );

  const handleMouseLeave = useCallback(() => {
    setPosition(undefined);
  }, []);

  const handleClick = useCallback(() => {
    onSeek(ratio.current * duration);
  }, [duration, onSeek]);

  return (
    <>
      {position ? (
        <Animated.View entering={FadeIn} exiting={FadeOut}>
          <div
            className={s.tooltip}
            style={{
              top: position.y,
              left: position.x,
            }}
          >
            {position.text}
          </div>
        </Animated.View>
      ) : null}
      <View style={[styles.root, style]}>
        <Animated.View style={bar} />
        <div
          className={s.mouse}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.whiteText,
    height: 10,
    borderRadius: radius.small,
    width: "100%",
  },
});
