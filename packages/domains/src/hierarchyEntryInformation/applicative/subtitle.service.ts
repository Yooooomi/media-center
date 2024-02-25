import { spawn } from "child_process";
import { fromPairs, mapNumber } from "@media-center/algorithm";
import { Transaction, useLog } from "@media-center/domain-driven";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { HierarchyEntryInformation } from "../domain/hierarchyEntryInformation";
import { HierarchyItem } from "../../fileWatcher/domain/hierarchyItem";
import { HierarchyEntryInformationStore } from "./hierarchyEntryInformation.store";
import { SubtitleStore } from "./subtitle.store";

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

export class SubtitleService {
  constructor(
    private readonly hierarchyEntryInformationStore: HierarchyEntryInformationStore,
    private readonly subtitleStore: SubtitleStore,
  ) {}

  static logger = useLog(SubtitleService.name);

  static generateFileNameForIndex(
    hierarchyItemId: HierarchyItemId,
    index: number,
  ) {
    return `${hierarchyItemId.toString()}-${index}.vtt`;
  }

  public async extractFor(
    hierarchyItem: HierarchyItem,
    transaction?: Transaction,
  ) {
    SubtitleService.logger.info(
      `Extracting subtitles for ${hierarchyItem.file.getFilenameWithExtension()}`,
    );
    const { subtitles, audioTracks } = await getSubtitlesFromPath(
      hierarchyItem.file.path,
      (index) =>
        SubtitleService.generateFileNameForIndex(hierarchyItem.id, index),
    );
    await Promise.all(
      subtitles.map((subtitle, index) =>
        this.subtitleStore.fromLocalFile(
          hierarchyItem.id,
          index,
          subtitle.filepath,
        ),
      ),
    );
    const entryInformation = new HierarchyEntryInformation({
      id: hierarchyItem.id,
      textTracks: subtitles.map((subtitle, index) => ({
        index,
        name: subtitle.name,
      })),
      audioTracks: audioTracks.map((track, index) => ({
        index,
        name: track.name,
      })),
    });
    await this.hierarchyEntryInformationStore.save(
      entryInformation,
      transaction,
    );
    SubtitleService.logger.info(
      `Extracted subtitles for ${hierarchyItem.file.getFilenameWithExtension()} ${audioTracks.length} audio tracks, ${subtitles.length} text tracks`,
    );
  }

  async deleteFor(hierarchyItemId: HierarchyItemId, transaction?: Transaction) {
    const hierarchyEntryInformation =
      await this.hierarchyEntryInformationStore.load(
        hierarchyItemId,
        transaction,
      );
    if (!hierarchyEntryInformation) {
      SubtitleService.logger.warn(
        "Could not find hierarchy entry information, some subtitles might still exist",
      );
      return;
    }
    await Promise.all(
      hierarchyEntryInformation.textTracks.map((_, index) =>
        this.subtitleStore.delete(hierarchyItemId, index),
      ),
    );
    await this.hierarchyEntryInformationStore.delete(
      hierarchyItemId,
      transaction,
    );
  }
}

async function getVideoMetadata(path: string) {
  let out: string;
  try {
    ({ err: out } = await spawnAndGetOutput("ffprobe", [path]));
  } catch (e) {
    return undefined;
  }
  const parts = out.split("Stream ");
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
  return streams;
}

async function getVideoTextTrack(
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
    ]);
    return mapNumber(trackCount, generateFileNameForIndex);
  } catch (e) {
    return undefined;
  }
}

interface Subtitle {
  name: string;
  filepath: string;
}

async function getSubtitlesFromPath(
  path: string,
  generateFileNameForIndex: (index: number) => string,
) {
  const streams = await getVideoMetadata(path);
  if (!streams) {
    return { subtitles: [], audioTracks: [] };
  }
  const subtitleStreams = streams.filter(
    (stream) =>
      stream.type === "Subtitle" && stream.typeParameters.includes("subrip"),
  );
  const filepaths = await getVideoTextTrack(
    path,
    subtitleStreams.length,
    generateFileNameForIndex,
  );
  if (!filepaths) {
    return { subtitles: [], audioTracks: [] };
  }
  const subtitles: Subtitle[] = [];
  for (let i = 0; i < subtitleStreams.length; i += 1) {
    const stream = subtitleStreams[i];
    const subtitleFilepath = filepaths[i];
    if (!stream || !subtitleFilepath) {
      continue;
    }
    subtitles.push({
      name: stream.metadata.title ?? `#${i + 1}`,
      filepath: subtitleFilepath,
    });
  }
  return {
    subtitles,
    audioTracks: streams
      .filter((stream) => stream.type === "Audio")
      .map((stream, index) => ({
        name: stream.metadata.title ?? `#${index + 1}`,
      })),
  };
}
