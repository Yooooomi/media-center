import React, { useRef } from "react";
import { View } from "react-native";
import { TurboVlc, type TurboVlcHandle } from "@media-center/turbo-vlc";

export default function App() {
  const ref = useRef<TurboVlcHandle>(null);

  return (
    <View style={{ flexGrow: 1, borderWidth: 2, borderColor: "red" }}>
      <TurboVlc
        ref={ref}
        play
        arguments={[]}
        hwDecode
        forceHwDecode={false}
        style={{ flexGrow: 1, backgroundColor: "red" }}
        uri="http://192.168.1.153:8080/video/d1f44733-ade9-4076-ab06-42512d4ddcf4"
        volume={100}
        onProgress={(event) =>
          console.log(
            "progress",
            event.nativeEvent.progress,
            event.nativeEvent.duration
          )
        }
        onError={() => console.log("error")}
        onBuffer={(event) => console.log("buffer", event.nativeEvent.buffering)}
        onVideoInfo={(event) => console.log("videoinfo", event.nativeEvent)}
      />
    </View>
  );
}
