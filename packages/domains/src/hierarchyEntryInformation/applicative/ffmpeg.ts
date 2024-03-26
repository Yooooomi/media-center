import { spawn } from "child_process";
import { Resolution } from "../domain/hierarchyEntryInformation";
import { FFProbe, Track, VideoTrack } from "./ffmpeg.types";

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
    const probe: FFProbe = JSON.parse(out);
    return probe;
  } catch (e) {
    return undefined;
  }
}

async function extractVttFromFile(
  path: string,
  textTrackIndexes: number[],
  generateFileNameForIndex: (index: number) => string,
) {
  try {
    await spawnAndGetOutput("ffmpeg", [
      "-i",
      path,
      ...textTrackIndexes
        .map((trackIndex, index) => [
          "-map",
          `0:s:${trackIndex}`,
          "-f",
          "webvtt",
          generateFileNameForIndex(index),
        ])
        .flat(),
      "-y",
    ]);
  } catch (e) {
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
  const subtitleStreams = ffprobe.streams.reduce<
    { track: Track; typeIndex: number }[]
  >((acc, track, index) => {
    if (track.codec_type === "subtitle" && track.codec_name === "subrip") {
      acc.push({ typeIndex: index, track });
    }
    return acc;
  }, []);

  const audioTracks = ffprobe.streams
    .filter((stream) => stream.codec_type === "audio")
    .map((stream, index) => ({
      index,
      name: stream.tags?.title ?? `#${index + 1}`,
    }));

  const textTracks = subtitleStreams.map((stream, index) => ({
    index,
    name: stream.track.tags?.title ?? `#${index + 1}`,
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
    subtitleStreams.map((e) => e.typeIndex),
    generateFileNameForIndex,
  );
  return {
    audioTracks,
    textTracks,
    videoTrack,
  };
}
