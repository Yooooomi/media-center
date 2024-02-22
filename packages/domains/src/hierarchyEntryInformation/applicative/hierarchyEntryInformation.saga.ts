import { Saga } from "@media-center/domain-driven";
import { HierarchyItemAdded } from "../../fileWatcher/applicative/fileWatcher.events";
import { exec } from "child_process";
import { fromPairs } from "@media-center/algorithm";

export class HierarchyEntryInformationSaga extends Saga {
  @Saga.on(HierarchyItemAdded)
  private initializeHierarchyEntryInformation(event: HierarchyItemAdded) {
    exec(`ffprobe "${event.item.file.path}"`, (error, stdout, stderr) => {
      if (error) {
        return console.error(error);
      }
      console.log("STD OUT IS", stdout, stderr);
    });
  }

  @Saga.on(HierarchyItemAdded)
  private deleteHierarchyEntryInformation() {}
}

async function main() {
  exec(
    `ffprobe "/Users/timothee/perso/media-center/aaa/films/Skyfall (2012) MULTI VFF 2160p 10bit 4KLight HDR BluRay x265 AAC 5.1-QTZ .mkv"`,
    (error, stdout, stderr) => {
      if (error) {
        return console.error(error);
      }
      const parts = stderr.split("Stream ");
      parts.shift();
      const typeIndexes: Record<string, number> = {};
      const streams = parts.map((part) => {
        const firstLine = part.split("\n")[0];
        const id = firstLine?.split("(")[0];
        const type = firstLine?.split(":")[2]?.trim() ?? "";
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
            .filter(([lineName]) => lineName) ?? []
        );
        return { id, metadata, type, typeIndex };
      });
      console.log(JSON.stringify(streams, null, " "));
    }
  );
}

main();
