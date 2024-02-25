import { spawn } from "child_process";
import { mapNumber } from "@media-center/algorithm";
import { Resolution } from "../domain/hierarchyEntryInformation";
import { FFProbe, VideoTrack } from "./ffmpeg.types";

async function spawnAndGetOutput(command: string, args: string[]) {
  return new Promise<{ out: string; err: string }>((res, rej) => {
    const bufferOut: string[] = [];
    const bufferErr: string[] = [];
    const spawned = spawn(command, args, { stdio: "pipe" });

    spawned.on("exit", (code) => {
      if (code === 0) {
        const out = bufferOut.join("");
        const err = bufferErr.join("");
        return res({ out, err });
      }
      return rej();
    });
    spawned.stderr.on("data", (data) => {
      bufferErr.push(data.toString());
    });
    spawned.stdout.on("data", (data) => {
      bufferOut.push(data.toString());
    });
  });
}

async function ffprobeFile(path: string) {
  let out: string;
  try {
    ({ out } = await spawnAndGetOutput("ffprobe", [
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      path,
    ]));
    console.log("OUT", out);
    const probe: FFProbe = JSON.parse(out);
    return probe;
  } catch (e) {
    return undefined;
  }
}

async function extractVttFromFile(
  path: string,
  trackCount: number,
  generateFileNameForIndex: (index: number) => string,
) {
  try {
    await spawnAndGetOutput("ffmpeg", [
      "-i",
      path,
      ...mapNumber(trackCount, (index) => [
        "-map",
        `0:s:${index}`,
        "-f",
        "webvtt",
        generateFileNameForIndex(index),
      ]).flat(),
      "-y",
    ]);
  } catch (e) {
    console.error("ERROR LA", e);
    return undefined;
  }
}

export async function extractTracksFromPath(
  path: string,
  generateFileNameForIndex: (index: number) => string,
) {
  const ffprobe = await ffprobeFile(path);
  const defaultVideoTrack = {
    type: "",
    resolution: Resolution.none(),
  };
  if (!ffprobe) {
    return {
      videoTrack: defaultVideoTrack,
      audioTracks: [],
      textTracks: [],
    };
  }
  const subtitleStreams = ffprobe.streams.filter(
    (stream) =>
      stream.codec_type === "subtitle" && stream.codec_name === "subrip",
  );

  const audioTracks = ffprobe.streams
    .filter((stream) => stream.codec_type === "audio")
    .map((stream, index) => ({
      index,
      name: stream.tags.title ?? "",
    }));

  const textTracks = subtitleStreams.map((stream, index) => ({
    index,
    name: stream.tags.title ?? "",
  }));

  const probeVideoTrack = ffprobe.streams.filter(
    (stream): stream is VideoTrack => stream.codec_type === "video",
  )[0];

  const videoTrack = probeVideoTrack
    ? {
        type: probeVideoTrack.codec_name,
        resolution: new Resolution({
          x: probeVideoTrack.width,
          y: probeVideoTrack.height,
        }),
      }
    : defaultVideoTrack;

  if (subtitleStreams.length === 0) {
    return {
      audioTracks,
      textTracks,
      videoTrack,
    };
  }
  await extractVttFromFile(
    path,
    subtitleStreams.length,
    generateFileNameForIndex,
  );
  return {
    audioTracks,
    textTracks,
    videoTrack,
  };
}
