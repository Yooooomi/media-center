import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TurboVlc } from "@media-center/turbo-vlc";

export default function App() {
  return (
    <View style={{ flexGrow: 1, borderWidth: 2, borderColor: "red" }}>
      <TurboVlc
        play
        arguments={[]}
        hwDecode
        forceHwDecode={false}
        seek={60_000}
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

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
