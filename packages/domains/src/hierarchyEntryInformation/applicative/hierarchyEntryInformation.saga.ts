import { exec } from "child_process";
import { Saga } from "@media-center/domain-driven";
import { fromPairs } from "@media-center/algorithm";
import {
  HierarchyItemAdded,
  HierarchyItemDeleted,
} from "../../fileWatcher/applicative/fileWatcher.events";
import { HierarchyEntryInformation } from "../domain/hierarchyEntryInformation";
import { HierarchyEntryInformationStore } from "./hierarchyEntryInformation.store";

export class HierarchyEntryInformationSaga extends Saga {
  constructor(
    private readonly hierarchyEntryInformationStore: HierarchyEntryInformationStore,
  ) {
    super();
  }

  @Saga.on(HierarchyItemAdded)
  private async initializeHierarchyEntryInformation(event: HierarchyItemAdded) {
    const { subtitles, audioTracks } = await getSubtitlesFromPath(
      event.item.file.path,
    );
    const entryInformation = new HierarchyEntryInformation({
      id: event.item.id,
      textTracks: subtitles,
      audioTracks: audioTracks.map((track, index) => ({
        name: track.metadata.title ?? `${index + 1}`,
      })),
    });
    await this.hierarchyEntryInformationStore.save(entryInformation);
  }

  @Saga.on(HierarchyItemDeleted)
  private async deleteHierarchyEntryInformation(event: HierarchyItemDeleted) {
    await this.hierarchyEntryInformationStore.delete(event.item.id);
  }
}

interface Stream {
  id: string;
  metadata: Record<string, string>;
  type: string;
  typeParameters: string;
  typeIndex: number;
}

async function getVideoMetadata(path: string) {
  return new Promise<Stream[]>((res, rej) => {
    exec(`ffprobe "${path}"`, (error, _stdout, stderr) => {
      if (error) {
        return rej(error);
      }
      const parts = stderr.split("Stream ");
      parts.shift();
      const typeIndexes: Record<string, number> = {};
      const streams = parts.map((part) => {
        const firstLine = part.split("\n")[0];
        const id = firstLine?.split("(")[0] ?? "";
        const type = firstLine?.split(":")[2]?.trim() ?? "";
        const typeParameters = firstLine?.split(":")[3]?.trim() ?? "";
        const typeIndex = typeIndexes[type] ?? 0;
        typeIndexes[type] = typeIndex + 1;
        const metadata = fromPairs(
          part
            .split("Metadata:\n")[1]
            ?.split("\n")
            .map<[string, string]>((valueLine) => {
              const lineParts = valueLine.split(":");
              const lineName = lineParts[0]?.trim() ?? "";
              const lineValue = lineParts.slice(1).join("").trim();
              return [lineName, lineValue];
            })
            .filter(([lineName]) => lineName) ?? [],
        );
        return { id, metadata, type, typeParameters, typeIndex };
      });
      res(streams);
    });
  });
}

async function getVideoTextTrack(path: string, trackIndex: number) {
  return new Promise<string>((res, rej) => {
    exec(
      `ffmpeg -i "${path}" -map 0:s:${trackIndex} -c:s webvtt -f webvtt -`,
      (error, stdout) => {
        if (error) {
          return rej(error);
        }
        return res(stdout);
      },
    );
  });
}

interface Subtitle {
  name: string;
  content: string;
}

async function getSubtitlesFromPath(path: string) {
  // const path =
  //   "/Users/timothee/perso/media-center/aaa/films/Skyfall (2012) MULTI VFF 2160p 10bit 4KLight HDR BluRay x265 AAC 5.1-QTZ .mkv";
  const streams = await getVideoMetadata(path);
  const subtitleStreams = streams.filter(
    (stream) =>
      stream.type === "Subtitle" && stream.typeParameters.includes("subrip"),
  );
  const subtitlesContent = await Promise.all(
    subtitleStreams.map((stream) => getVideoTextTrack(path, stream.typeIndex)),
  );
  const subtitles: Subtitle[] = [];
  for (let i = 0; i < subtitleStreams.length; i += 1) {
    const stream = subtitleStreams[i];
    const subtitleContent = subtitlesContent[i];
    if (!stream || !subtitleContent) {
      continue;
    }
    subtitles.push({
      name: stream.metadata.title ?? `#${i + 1}`,
      content: subtitleContent,
    });
  }
  return {
    subtitles,
    audioTracks: streams.filter((stream) => stream.type === "Audio"),
  };
}
