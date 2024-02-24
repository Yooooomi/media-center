import {
  ApplicativeError,
  Query,
  QueryHandler,
} from "@media-center/domain-driven";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { SubtitleStore } from "./subtitle.store";
import { HierarchyEntryInformationStore } from "./hierarchyEntryInformation.store";

export class GetSubtitlesQuery extends Query(HierarchyItemId, [
  { name: String, content: String },
]) {}

class HierarchyEntryInformationNotFound extends ApplicativeError {
  constructor(id: HierarchyItemId) {
    super(`Hierarchy entry information not found for ${id.toString()}`);
  }
}

class CorruptedEntryInformation extends ApplicativeError {
  constructor(id: HierarchyItemId) {
    super(`Hierarchy entry information corrupted for ${id.toString()}`);
  }
}

export class GetSubtitlesQueryHandler extends QueryHandler(GetSubtitlesQuery) {
  constructor(
    private readonly hierarchyEntryInformationStore: HierarchyEntryInformationStore,
    private readonly subtitleStore: SubtitleStore,
  ) {
    super();
  }

  async execute(intent: GetSubtitlesQuery) {
    const info = await this.hierarchyEntryInformationStore.load(intent.value);

    if (!info) {
      throw new HierarchyEntryInformationNotFound(intent.value);
    }

    const subtitles = await Promise.all(
      info.textTracks.map((_, index) =>
        this.subtitleStore.load(info.id, index),
      ),
    );

    return info.textTracks.map((textTrack, index) => {
      const subtitle = subtitles[index];
      if (!subtitle) {
        throw new CorruptedEntryInformation(info.id);
      }
      return { name: textTrack.name, content: subtitle };
    });
  }
}
